#!/usr/bin/env bash
# Aktualizácia na serveri services: stiahne nový image z ghcr.io a reštartuje aplikáciu.
# Použitie: /opt/skolenie-se/deploy/update.sh
set -euo pipefail
cd "$(dirname "$0")/.."
C="docker compose --env-file .env.production -f docker-compose.prod.yml"

git pull --ff-only
$C pull app
$C up -d
docker image prune -f >/dev/null

echo -n "Čakám na štart"
for i in $(seq 1 30); do
  if curl --noproxy '*' -fsS http://127.0.0.1:3010/health >/dev/null 2>&1; then
    echo " – OK"
    docker image inspect "$($C images -q app | head -1)" --format 'Verzia: {{index .Config.Labels "org.opencontainers.image.revision"}}  ({{.Created}})' 2>/dev/null || true
    exit 0
  fi
  echo -n "."; sleep 2
done
echo " – aplikácia nenaštartovala, posledné logy:"
$C logs --tail 40 app
exit 1
