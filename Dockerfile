# syntax=docker/dockerfile:1.7
#
# Dockerfile multi-stage do backend (Express + Prisma + TypeScript).
#
# Stages:
#   1) deps    -> instala TODAS as dependências (incluindo dev) para o build.
#   2) build   -> roda `prisma generate` e `tsc`, depois faz prune de dev deps.
#   3) runtime -> imagem final mínima, não-root, com apenas o necessário.
#
# Base: node:20-slim (Debian-based) em vez de alpine — Prisma 5+ funciona
# imediatamente em glibc; alpine exigiria `binaryTargets` musl no schema.

ARG NODE_VERSION=20

# ============================================================================
# Stage 1: deps
# ============================================================================
FROM node:${NODE_VERSION}-slim AS deps

WORKDIR /app

# Copia apenas manifests para aproveitar cache do Docker entre builds.
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# ============================================================================
# Stage 2: build
# ============================================================================
FROM node:${NODE_VERSION}-slim AS build

WORKDIR /app

# Aproveita node_modules instalados no stage `deps`.
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

# Gera o Prisma Client e compila TypeScript para `dist/`.
RUN npx prisma generate
RUN npm run build

# Remove devDependencies — mantém apenas o que `dependencies` precisa.
# O `prisma` CLI faz parte de `dependencies` (necessário para `migrate deploy`).
RUN npm prune --omit=dev

# ============================================================================
# Stage 3: runtime
# ============================================================================
FROM node:${NODE_VERSION}-slim AS runtime

# OpenSSL é exigido pelo binário do query engine do Prisma.
# wget é usado pelo HEALTHCHECK.
# `apt-get upgrade` aplica os patches de segurança disponíveis na base
# Debian (necessário para passar no quality gate do Trivy).
RUN apt-get update -y \
 && apt-get upgrade -y \
 && apt-get install -y --no-install-recommends openssl ca-certificates wget \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Permissões para o usuário não-root (`node`).
RUN chown -R node:node /app

# `DATABASE_URL` é obrigatório em runtime (injetado pelo Compose/Jenkins).
# Não há default — falhar cedo (no entrypoint) é melhor do que rodar
# com URL falsa contra um Postgres inexistente.
ENV NODE_ENV=production \
    PORT=3000

# Copia artefatos prontos do stage de build (já pruned).
COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/dist ./dist
COPY --chown=node:node --from=build /app/prisma ./prisma
COPY --chown=node:node --from=build /app/package.json ./package.json

# Entrypoint que roda `prisma migrate deploy` antes de subir o Node.
COPY --chown=node:node docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --quiet --tries=1 --spider "http://localhost:${PORT}/health" || exit 1

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["node", "dist/src/main.js"]
