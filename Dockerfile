FROM node:16-bullseye AS builder
WORKDIR /tmp/playground/
COPY package*.json workspace.json tsconfig*.json nx.json babel.config.json ./
COPY schemas/ ./schemas/
# TODO Remove force once @openfeature/js-sdk@0.5.0 is avaliable
RUN npm install --force
COPY packages/ ./packages/
RUN npm run build

FROM node:16-bullseye as app

WORKDIR /opt/playground/
COPY package*.json ./
# TODO Remove force once @openfeature/js-sdk@0.5.0 is avaliable
RUN npm ci --omit=dev --force

COPY --from=builder /tmp/playground/dist ./dist
# Tracing script
COPY scripts ./scripts
COPY schemas ./schemas

LABEL org.opencontainers.image.source=https://github.com/open-feature/open-feature-demo

EXPOSE 30000

ENTRYPOINT ["node", "-r", "./scripts/tracing.js", "dist/packages/app/main.js"]
