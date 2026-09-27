FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --no-audit --no-fund
COPY . .
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=8787

COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund \
  && npm cache clean --force \
  && addgroup -S vaultmind \
  && adduser -S vaultmind -G vaultmind

COPY --from=build /app/dist ./dist
COPY server ./server
COPY .env.example ./.env.example

RUN chown -R vaultmind:vaultmind /app
USER vaultmind

EXPOSE 8787

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:8787/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server/index.mjs"]
