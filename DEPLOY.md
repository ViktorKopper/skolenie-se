# Nasadenie – Školenie o kyberbezpečnosti

Cieľ: Docker Compose na hoste **services** (10.40.6.39), za **nginx-rp**, adresa `https://skolenie.urad.vicepremier.gov.sk`, prístup len z LAN a VPN.

Ako to funguje: push do `main` → GitHub Actions (`.github/workflows/docker.yml`) zostaví image → `ghcr.io/viktorkopper/skolenie-se:latest` (+ `sha-<commit>`). Server nič nebuilduje, len sťahuje image.

## 0. Na Macu: migrácie databázy (pri každej zmene kolekcií)

V produkcii sa schéma nevytvára automaticky (to robí len `pnpm dev`). Migrácie sa spustia samé pri štarte (`prodMigrations`).

```bash
pnpm generate:types
pnpm payload migrate:create init      # prvýkrát; neskôr migrate:create <nazov-zmeny>
git add -A && git commit -m "..." && git push
```

Stav buildu: GitHub → repo → **Actions**. Image: GitHub → profil → **Packages** → `skolenie-se`.

## 1. Server: prvá inštalácia

```bash
sudo mkdir -p /opt/skolenie-se && sudo chown $USER /opt/skolenie-se
git clone https://github.com/ViktorKopper/skolenie-se.git /opt/skolenie-se
cd /opt/skolenie-se
cp deploy/env.production.example .env.production
sed -i "s/^POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=$(openssl rand -hex 24)/" .env.production
sed -i "s/^PAYLOAD_SECRET=.*/PAYLOAD_SECRET=$(openssl rand -hex 32)/" .env.production
sed -i "s/^SYNC_SECRET=.*/SYNC_SECRET=$(openssl rand -hex 32)/" .env.production
chmod 600 .env.production
nano .env.production   # vyplň LDAP_BIND_PASSWORD (heslo svc.skolenie)
```

Ak je repo / image súkromný, prihlás server do ghcr.io tokenom (GitHub → Settings → Developer settings → Personal access tokens (classic), len `read:packages`):

```bash
read -rs GHCR_TOKEN && echo "$GHCR_TOKEN" | docker login ghcr.io -u ViktorKopper --password-stdin; unset GHCR_TOKEN
```

Reťazec CA pre LDAPS (`UPPVL-CA-DC01` + `UPPVL-ROOT-CA`, PEM, bez kľúča) je v repozitári ako `deploy/UPPVL-CA-chain.pem`, compose ho pripojí do kontajnera. Over spojenie z hosta services na DC:

```bash
openssl s_client -connect UPPVL-VM-DC01.urad.vicepremier.gov.sk:636 -CAfile deploy/UPPVL-CA-chain.pem </dev/null 2>&1 | grep -E "Verify return code|connect:"
```

## 2. Spustenie

```bash
cd /opt/skolenie-se
docker compose --env-file .env.production -f docker-compose.prod.yml pull
docker compose --env-file .env.production -f docker-compose.prod.yml up -d
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f app
curl -s http://127.0.0.1:3010/health
```

Session cookie je v produkcii len cez HTTPS (`Secure`). Na rýchly test prihlásenia pred nginx/DNS použi SSH tunel – Chrome berie `localhost` ako zabezpečený:

```bash
ssh -L 3010:127.0.0.1:3010 <user>@10.40.6.39
# v Chrome: http://localhost:3010/prihlasenie
```

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

1. Prihlás sa na `https://skolenie.urad.vicepremier.gov.sk/prihlasenie` účtom zo skupiny **DL_Skolenie_Admins**. Ako núdzový účet (keby AD nešlo) si v `/admin` vytvor aj lokálneho administrátora s dlhým heslom.
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

## 7b. Nočná synchronizácia z AD

Pridá nových zamestnancov, aktualizuje odbory a role, deaktivuje účty, ktoré z AD zmizli (alebo sú vypnuté).

```bash
sudo tee /etc/cron.d/skolenie-sync >/dev/null <<'EOF'
15 2 * * * root curl -fsS -X POST -H "Authorization: Bearer $(grep ^SYNC_SECRET= /opt/skolenie-se/.env.production | cut -d= -f2)" http://127.0.0.1:3010/auth/sync >> /var/log/skolenie-sync.log 2>&1
EOF
```

Ručne sa dá spustiť aj tlačidlom **Synchronizovať z AD** v `/sprava`.

## 8. Zabbix

Web scenár: `https://skolenie.urad.vicepremier.gov.sk/health`, očakávaný kód **200**, požadovaný reťazec `"ok":true`, interval 1 min, trigger pri 3 zlyhaniach po sebe.

## Aktualizácia

Na Macu: zmena → (ak sa menili kolekcie `pnpm payload migrate:create <nazov>`) → commit → push. Počkaj, kým v GitHub Actions dobehne build (zelená fajka). Potom na serveri:

```bash
cd /opt/skolenie-se && git pull
docker compose --env-file .env.production -f docker-compose.prod.yml pull
docker compose --env-file .env.production -f docker-compose.prod.yml up -d
docker image prune -f
```

`git pull` je potrebný len kvôli `docker-compose.prod.yml` a súborom v `deploy/`. Migrácie sa spustia pri štarte.

Rollback na predchádzajúcu verziu: do `.env.production` pridaj `IMAGE_TAG=sha-<7 znakov commitu>` a `up -d`. Pozor, migrácie sa samé nevrátia.
