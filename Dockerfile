# We are moving in the node_modules/dist because NX hangs if we build it in Docker. We'll have to look into this...
FROM node:14-bullseye as builder

WORKDIR /
COPY node_modules /node_modules
COPY dist /dist
COPY scripts /scripts
COPY schemas /schemas
LABEL org.opencontainers.image.source=https://github.com/open-feature/open-feature-demo

EXPOSE 30000

# should we add tracing this way? 
ENTRYPOINT ["node", "-r", "./scripts/tracing.js", "dist/packages/app/main.js"]

