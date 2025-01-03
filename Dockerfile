FROM node:lts-alpine3.19
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
# DND SHEETS
RUN mkdir -p /temp/dnd
COPY dnd-character-sheets-master/src temp/dnd-character-sheets-master/src
COPY dnd-character-sheets-master/.editorconfig temp/dnd-character-sheets-master
COPY dnd-character-sheets-master/.eslintignore temp/dnd-character-sheets-master
COPY dnd-character-sheets-master/.eslintrc temp/dnd-character-sheets-master
COPY dnd-character-sheets-master/.prettierrc temp/dnd-character-sheets-master
COPY dnd-character-sheets-master/.travis.yml temp/dnd-character-sheets-master
COPY dnd-character-sheets-master/yarn.lock temp/dnd-character-sheets-master
COPY dnd-character-sheets-master/package.json temp/dnd-character-sheets-master
COPY dnd-character-sheets-master/tsconfig.json temp/dnd-character-sheets-master

# BUILD DND SHEETS
RUN cd /temp/dnd-character-sheets-master \
    && yarn install --ignore-engines \
    && yarn run build
#    && rm -rf /temp/web/src/dnd-character-sheets \
#    && mkdir -p /temp/web/src/dnd-character-sheets \
#    && mv dist/* /temp/web/src/dnd-character-sheets

# WEB
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
