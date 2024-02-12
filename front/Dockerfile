FROM node:lts AS base
WORKDIR /usr/src/app
EXPOSE 3000
ENTRYPOINT [ "npm" ]

FROM base as builder
ENV NODE_ENV production
COPY package.json package-lock.json ./
RUN npm i
COPY . .
RUN npm run build

FROM base
USER node
COPY --from=builder --chown=node:node /usr/src/app/.output .
ENTRYPOINT [ "node" ]
CMD [ ".output/server/index.mjs" ]