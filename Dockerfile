###################
# BUILD FOR LOCAL DEVELOPMENT
###################

FROM node:22-alpine As development

WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./

RUN npm ci

COPY --chown=node:node . .

USER node

###################
# BUILD FOR PRODUCTION
###################

FROM node:22-alpine As build

WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./

COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules

COPY --chown=node:node . .

RUN npm run build:web

ENV NODE_ENV production

RUN npm ci --only=production && npm cache clean --force

USER node

###################
# PRODUCTION
###################

FROM node:22-alpine As production

ARG NODE_ENV=production
ARG WEB_PORT=3000
ARG MONGODB_URI
ARG MONGODB_CACHE_ENABLE
ARG MONGODB_CACHE_HOST
ARG MONGODB_CACHE_PORT
ARG MONGODB_CACHE_DB
ARG MONGODB_CACHE_PREFIX
ARG MONGODB_CACHE_AUTH
ARG MONGODB_CACHE_PASSWORD
ARG REDIS_HOST
ARG REDIS_PORT
ARG REDIS_DB
ARG REDIS_PREFIX
ARG REDIS_AUTH
ARG REDIS_PASSWORD

ENV NODE_ENV=${NODE_ENV}
ENV WEB_PORT=${WEB_PORT}
ENV MONGODB_URI=${MONGODB_URI}
ENV MONGODB_CACHE_ENABLE=${MONGODB_CACHE_ENABLE}
ENV MONGODB_CACHE_HOST=${MONGODB_CACHE_HOST}
ENV MONGODB_CACHE_PORT=${MONGODB_CACHE_PORT}
ENV MONGODB_CACHE_DB=${MONGODB_CACHE_DB}
ENV MONGODB_CACHE_PREFIX=${MONGODB_CACHE_PREFIX}
ENV MONGODB_CACHE_AUTH=${MONGODB_CACHE_AUTH}
ENV MONGODB_CACHE_PASSWORD=${MONGODB_CACHE_PASSWORD}
ENV REDIS_HOST=${REDIS_HOST}
ENV REDIS_PORT=${REDIS_PORT}
ENV REDIS_DB=${REDIS_DB}
ENV REDIS_PREFIX=${REDIS_PREFIX}
ENV REDIS_AUTH=${REDIS_AUTH}
ENV REDIS_PASSWORD=${REDIS_PASSWORD}

COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist

CMD [ "node", "dist/apps/web/main.js" ]
