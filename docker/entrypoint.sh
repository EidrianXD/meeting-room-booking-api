#!/bin/sh
# Entrypoint do container do backend.
# Aplica as migrations pendentes antes de iniciar a aplicação.
# Em produção real (Postgres/Fase 6), idealmente isso roda como um job
# separado antes do deploy. Para o escopo atual (SQLite + 1 instância),
# rodar no boot é seguro e suficiente.
#
# Variáveis controladas:
#   SEED_ON_BOOT  - "true" para rodar `dist/prisma/seed.js` após o migrate.
#                   O seed é idempotente (upsert), seguro para múltiplos boots.
#                   Use em desenvolvimento/demo; em produção real prefira "false".

set -e

echo "[entrypoint] Aplicando migrations do Prisma..."
npx --no-install prisma migrate deploy

if [ "${SEED_ON_BOOT:-false}" = "true" ]; then
    echo "[entrypoint] SEED_ON_BOOT=true — populando dados iniciais..."
    node dist/prisma/seed.js
fi

echo "[entrypoint] Iniciando aplicação..."
exec "$@"
