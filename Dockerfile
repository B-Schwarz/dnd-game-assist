FROM node:lts-alpine3.22
# API
COPY api/admin app/admin
COPY api/auth app/auth
COPY api/books/index.js app/books/
RUN mkdir -p /app/books/pdf
COPY api/character app/character
COPY api/db app/db
COPY api/initiative app/initiative
COPY api/monster app/monster
COPY api/encounter app/encounter
COPY api/settings app/settings
COPY api/package.json app/
COPY api/yarn.lock app/
COPY api/server.js app/
# BOOKS
COPY Books/* app/books/pdf/
# WEB (character sheet is now embedded directly in web/src)
RUN mkdir -p /temp/web
COPY web/package.json temp/web
COPY web/yarn.lock temp/web
COPY web/tsconfig.json temp/web
COPY web/.env.production temp/web
COPY web/public temp/web/public
RUN cd /temp/web \
    && yarn install --ignore-engines

COPY web/src temp/web/src

# BUILD WEB
RUN cd /temp/web \
    && yarn run build \
    && cp -r build/ /app/

# BUILD API
RUN cd /app \
    && yarn install --ignore-engines \
    && rm -rf /temp

WORKDIR /app
EXPOSE 4000
CMD ["npm", "run", "start"]
