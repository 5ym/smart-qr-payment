import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { env } from '$env/dynamic/private';
import * as schema from './schema';
import { ensureSchema } from './ddl';

const url = env.DATABASE_URL ?? './data/sqp.db';

// Make sure the directory for a file-backed database exists.
if (url !== ':memory:') {
	mkdirSync(dirname(url), { recursive: true });
}

const sqlite = new Database(url, { create: true });
sqlite.exec('PRAGMA journal_mode = WAL;');
sqlite.exec('PRAGMA foreign_keys = ON;');
ensureSchema(sqlite);

export const db = drizzle(sqlite, { schema });
export { schema };
