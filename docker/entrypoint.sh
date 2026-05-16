#!/bin/sh
# Entrypoint do container do backend.
# Aplica as migrations pendentes antes de iniciar a aplicação.
# Em produção real (Postgres/Fase 6), idealmente isso roda como um job
# separado antes do deploy. Para o escopo atual (SQLite + 1 instância),
# rodar no boot é seguro e suficiente.

set -e

echo "[entrypoint] Aplicando migrations do Prisma..."
npx --no-install prisma migrate deploy

echo "[entrypoint] Iniciando aplicação..."
exec "$@"
