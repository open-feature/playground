FROM node:20.17-bullseye-slim AS builder
WORKDIR /tmp/playground/
COPY package*.json tsconfig*.json nx.json babel.config.json ./
RUN npm ci
COPY packages/ ./packages/
RUN npm run build:fib-service

FROM node:20-alpine as app

WORKDIR /opt/playground/
COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /tmp/playground/dist ./dist
# Tracing script
COPY scripts ./scripts

LABEL org.opencontainers.image.source=https://github.com/open-feature/playground

EXPOSE 30001

ENTRYPOINT ["node", "-r", "./scripts/tracing.js", "dist/packages/fibonacci-service/main.js"]
