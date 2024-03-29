FROM node:17.3-alpine3.14
COPY api/admin app/admin
COPY api/auth app/auth
COPY api/books/index.js app/books/
RUN mkdir -p /app/books/pdf
COPY api/character app/character
COPY api/db app/db
COPY api/initiative app/initiative
COPY api/monster app/monster
COPY api/settings app/settings
COPY api/package.json app/
COPY api/package-lock.json app/
COPY api/server.js app/
COPY Books/* app/books/pdf/
COPY web/public temp/public
COPY web/src temp/src
COPY web/package.json temp/
COPY web/package-lock.json temp/
COPY web/tsconfig.json temp/
COPY web/.env.production temp/
RUN cd temp \
    && npm ci \
    && npm run build \
    && cp -r build/ /app/ \
    && cd /app \
    && npm ci \
    && rm -rf /temp
WORKDIR /app
EXPOSE 4000
CMD ["npm", "run", "start"]
