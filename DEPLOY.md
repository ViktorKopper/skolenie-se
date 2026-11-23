# Nasadenie – Školenie o kyberbezpečnosti

Cieľ: Docker Compose na hoste **services** (10.40.6.39), za **nginx-rp**, adresa `https://skolenie.urad.vicepremier.gov.sk`, prístup len z LAN a VPN.

## 0. Jednorazovo na Macu: databázové migrácie

V produkcii sa schéma nevytvára automaticky (to robí len `pnpm dev`). Treba vygenerovať migrácie:

```bash
pnpm payload migrate:create init
```

Vznikne `src/migrations/`. Potom v `src/payload.config.ts` pridaj import a `prodMigrations`, aby sa migrácie spustili pri štarte produkcie:

```ts
import { migrations } from './migrations'
// ...
db: postgresAdapter({
  pool: { connectionString: process.env.DATABASE_URL || '' },
  prodMigrations: migrations,
}),
```

Pri každej ďalšej zmene kolekcií: `pnpm payload migrate:create <nazov>` a commit.

Over build lokálne (ak build prejde, prejde aj v Dockeri):

```bash
pnpm build
```

## 1. Server: kód a konfigurácia

```bash
sudo mkdir -p /opt/skolenie-se && sudo chown $USER /opt/skolenie-se
git clone <tvoj-github-repo> /opt/skolenie-se
cd /opt/skolenie-se
cp deploy/env.production.example .env.production
sed -i "s/^POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=$(openssl rand -hex 24)/" .env.production
sed -i "s/^PAYLOAD_SECRET=.*/PAYLOAD_SECRET=$(openssl rand -hex 32)/" .env.production
chmod 600 .env.production
```

## 2. Spustenie

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f app
curl -s http://127.0.0.1:3010/health
```

Admin cookie sa v produkcii posiela len cez HTTPS, preto prvého admina nevytváraj cez `http://…:3010`. Najprv sprav kroky 3–5.

## 3. Certifikát z AD CS

```bash
openssl req -new -newkey rsa:2048 -nodes \
  -keyout skolenie.key -out skolenie.csr \
  -subj "/CN=skolenie.urad.vicepremier.gov.sk" \
  -addext "subjectAltName=DNS:skolenie.urad.vicepremier.gov.sk"
```

Na CA (PowerShell, šablóna WebServer):

```powershell
certreq -submit -attrib "CertificateTemplate:WebServer" skolenie.csr skolenie.crt
```

Do `skolenie.crt` pripoj aj certifikát CA (`UPPVL-CA-DC01`), ak ho klienti nemajú v reťazci.

## 4. nginx-rp (zatiaľ len z admin IP)

Vhost `deploy/nginx/skolenie.conf` má dočasne `allow 10.40.6.23; deny all;` – web uvidíš len ty.

```bash
docker cp skolenie.crt nginx-rp:/etc/nginx/certs/skolenie.crt
docker cp skolenie.key nginx-rp:/etc/nginx/certs/skolenie.key
docker cp deploy/nginx/skolenie.conf nginx-rp:/etc/nginx/conf.d/skolenie.conf
docker exec nginx-rp nginx -t && docker exec nginx-rp nginx -s reload
```

Ak má nginx-rp konfiguráciu vo zväzku z hostiteľa, skopíruj súbory tam namiesto `docker cp`.

## 5. DNS

```powershell
Add-DnsServerResourceRecordA -ZoneName "urad.vicepremier.gov.sk" -Name "skolenie" -IPv4Address <IP nginx-rp>
```

## 6. Prvý admin a obsah

1. Otvor `https://skolenie.urad.vicepremier.gov.sk/admin` a vytvor prvého administrátora.
2. Zapni seed a naplň témy a 60 otázok:

```bash
echo "ALLOW_SEED=1" >> .env.production
docker compose --env-file .env.production -f docker-compose.prod.yml up -d
```

3. V tom istom prehliadači (prihlásený v adminovi) otvor `https://skolenie.urad.vicepremier.gov.sk/seed`.
4. Seed vypni:

```bash
sed -i '/^ALLOW_SEED=/d' .env.production
docker compose --env-file .env.production -f docker-compose.prod.yml up -d
```

5. Z vhostu zmaž riadky `allow 10.40.6.23;` a `deny all;`, nahraj ho znova a `nginx -s reload`.
6. Na FortiGate over, že používateľské VLAN a VPN majú prístup na nginx-rp TCP 443 (ak pravidlo pre interné služby existuje, stačí ono). Port 3010 na hoste services má byť dostupný len z nginx-rp.

## 7. Zálohy

```bash
chmod +x deploy/backup.sh
sudo crontab -e
# 30 2 * * * /opt/skolenie-se/deploy/backup.sh >> /var/log/skolenie-backup.log 2>&1
```

Obnova:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml exec -T db \
  pg_restore -U payload -d skolenie_se --clean --if-exists < backups/db_<datum>.dump
docker run --rm -v skolenie-se_media:/m -v "$PWD/backups":/b alpine sh -c "tar xzf /b/media_<datum>.tgz -C /m"
```

## 8. Zabbix

Web scenár: `https://skolenie.urad.vicepremier.gov.sk/health`, očakávaný kód **200**, požadovaný reťazec `"ok":true`, interval 1 min, trigger pri 3 zlyhaniach po sebe.

## Aktualizácia

```bash
cd /opt/skolenie-se && git pull
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

Migrácie sa spustia automaticky pri štarte (`prodMigrations`).
