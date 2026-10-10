FROM node:20.18-bullseye-slim@sha256:ca6ffc5171f8d18ed5d14aff639082e834b7f1c40266080501c8b8ce78919119 AS builder
WORKDIR /tmp/playground/
COPY package*.json tsconfig*.json nx.json babel.config.json ./
RUN npm ci
COPY packages/ ./packages/
RUN npm run build:fib-service

FROM node:20-alpine@sha256:fb4cd12c85ee03686f6af5362a0b0d56d50c58a04632e6c0fb8363f609372293 as app

WORKDIR /opt/playground/
COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /tmp/playground/dist ./dist
# Tracing script
COPY scripts ./scripts

LABEL org.opencontainers.image.source=https://github.com/open-feature/playground

EXPOSE 30001

ENTRYPOINT ["node", "-r", "./scripts/tracing.js", "dist/packages/fibonacci-service/main.js"]
