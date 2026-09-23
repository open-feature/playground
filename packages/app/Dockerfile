FROM node:20.18-bullseye@sha256:f97b8caece4a3996281fea35f3b39ae4064cb93da56365bee6d664abdfe5cd24 AS builder
WORKDIR /tmp/playground/
COPY package*.json tsconfig*.json nx.json babel.config.json ./
COPY schemas/ ./schemas/
RUN npm ci
COPY packages/ ./packages/
RUN npm run build:app

FROM node:20-alpine@sha256:fb4cd12c85ee03686f6af5362a0b0d56d50c58a04632e6c0fb8363f609372293 as app

WORKDIR /opt/playground/
COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /tmp/playground/dist ./dist
# Tracing script
COPY scripts ./scripts
COPY schemas ./schemas

LABEL org.opencontainers.image.source=https://github.com/open-feature/playground

EXPOSE 30000

ENTRYPOINT ["node", "-r", "./scripts/tracing.js", "dist/packages/app/main.js"]
