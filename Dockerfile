# --- Build stage ----------------------------------------------------------
FROM oven/bun:1.3 AS build
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

# --- Runtime stage --------------------------------------------------------
# All dependencies are bundled into build/ (devDependencies are bundled by
# adapter-node; the runtime dependencies list is empty), so the runtime image
# needs no node_modules — just Bun and the build output.
FROM oven/bun:1.3-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_URL=/app/data/sqp.db

COPY --from=build /app/build ./build
# Seed script (optional): run with `bun run ./src/lib/server/db/seed.ts`
COPY --from=build /app/src/lib/server/db/ddl.ts ./src/lib/server/db/ddl.ts
COPY --from=build /app/src/lib/server/db/seed.ts ./src/lib/server/db/seed.ts

# Persist the SQLite database outside the image layer.
VOLUME /app/data
EXPOSE 3000

# The server must run under Bun so `bun:sqlite` is available.
CMD ["bun", "./build/index.js"]
