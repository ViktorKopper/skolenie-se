# Školenie – Social Engineering (Payload CMS + IDSK 3.1)

Interná vzdelávacia a referenčná aplikácia o social engineeringu pre Úrad
podpredsedu vlády SR pre Plán obnovy a znalostnú ekonomiku.

- **Stack:** Payload CMS (v4, Next.js) + SQLite + IDSK 3.1 frontend
- **Beží:** lokálne na `http://localhost:3000` (admin na `/admin`)
- **Obsah:** editovateľný cez Payload admin (témy, články, kvíz)

---

## 1. Predpoklady (nainštaluj raz)

- **Node.js 24 LTS** – https://nodejs.org (over `node -v` → v24.x)
- **pnpm** – `npm install -g pnpm`
- **Git** – https://git-scm.com
- **VS Code** + rozšírenia: ESLint, Prettier, Tailwind (voliteľné)
- **Docker Desktop** – voliteľné, len ak budeš chcieť neskôr nasadiť v kontajneri

## 2. Otvorenie projektu

Otvor tento priečinok (`skolenie-se`) vo VS Code:

```
code ~/Desktop/skolenie-se
```

## 3. Scaffold Payloadu (spravíme spolu)

Baseline projekt vygenerujeme cez create-payload-app so SQLite. Keď sa to
rozbehne, v termináli VS Code:

```
pnpm create payload-app@latest . --use-pnpm
```

Pri výbere databázy zvoľ **SQLite**. (Krok dolaďíme spolu – pridám naše
kolekcie, obsah a IDSK frontend.)

## 4. Inštalácia závislostí

```
pnpm install
```

## 5. Konfigurácia prostredia

Skopíruj `.env.example` → `.env` a over premenné:

```
cp .env.example .env
```

- `DATABASE_URI` – ostane na SQLite (súbor `payload.db` v projekte)
- `PAYLOAD_SECRET` – vygeneruj náhodný reťazec (napr. `openssl rand -hex 32`)

## 6. Spustenie (dev)

```
pnpm dev
```

- Aplikácia: `http://localhost:3000`
- Admin: `http://localhost:3000/admin` – pri prvom spustení vytvoríš admin účet

## 7. Git + GitHub

```
git init
git add .
git commit -m "Initial commit – skolenie SE"
git branch -M main
git remote add origin <URL_TVOJHO_GITHUB_REPA>
git push -u origin main
```

> Pošli mi URL tvojho GitHub repozitára a remote nastavíme spolu.

---

## Štruktúra obsahu (čo budeme napĺňať)

Témy social engineeringu (nie iba phishing):

1. Čo je social engineering – psychologické páky
2. Phishing (e-mail) – vrátane spear/whaling
3. Vishing (telefón)
4. Smishing (SMS)
5. Quishing (QR kódy)
6. Pretexting (vymyslená zámienka)
7. Baiting (USB, lákadlá)
8. Tailgating / fyzický prístup
9. BEC / impersonácia autority
10. Ako sa brániť – overovanie, nahlasovanie
11. Kvíz / self-check

---

## Poznámky

- IDSK 3.1 štýl natiahneme ako skompilované CSS/JS z oficiálneho `id-sk/idsk`
  (self-hosted, aby to fungovalo aj offline / za proxy).
- Obsah je editovateľný v admin paneli – netreba zasahovať do kódu.
- Kvíz beží čisto v prehliadači, bez ukladania osobných údajov (GDPR-čisté).
