# --- Build stage ----------------------------------------------------------
FROM oven/bun:1.3 AS build
WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

# Prune dev dependencies for the runtime image.
RUN rm -rf node_modules && bun install --frozen-lockfile --production

# --- Runtime stage --------------------------------------------------------
FROM oven/bun:1.3-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_URL=/app/data/sqp.db

COPY --from=build /app/build ./build
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/src/lib/server/db ./src/lib/server/db

# Persist the SQLite database outside the image layer.
VOLUME /app/data
EXPOSE 3000

# The server must run under Bun so `bun:sqlite` is available.
CMD ["bun", "./build/index.js"]
