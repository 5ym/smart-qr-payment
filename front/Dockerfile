FROM oven/bun:1 AS base
WORKDIR /usr/src/app
EXPOSE 3000

FROM base as builder
ENV NODE_ENV production
COPY package.json bun.lockb ./
RUN bun
COPY . .
RUN bun run build

FROM base
USER bun
COPY --from=builder --chown=bun:bun /usr/src/app/.output .
CMD [ ".output/server/index.mjs" ]