import type { Database } from 'bun:sqlite';

/**
 * Idempotent schema bootstrap. Kept in sync with `schema.ts` (the Drizzle ORM
 * source of truth). Running it on startup means the app works with a fresh
 * SQLite file without a separate migration step; `drizzle-kit push` remains
 * available for those who prefer a migration workflow.
 */
export const DDL = `
CREATE TABLE IF NOT EXISTS users (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	email TEXT NOT NULL UNIQUE,
	password_hash TEXT NOT NULL,
	is_active INTEGER NOT NULL DEFAULT 0,
	is_staff INTEGER NOT NULL DEFAULT 0,
	is_superuser INTEGER NOT NULL DEFAULT 0,
	created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE IF NOT EXISTS verifies (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
	code TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	price INTEGER NOT NULL,
	image TEXT NOT NULL,
	title TEXT NOT NULL,
	desc TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS user_products (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
	count INTEGER NOT NULL,
	price INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS pays (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
	token TEXT NOT NULL,
	code TEXT NOT NULL,
	receive INTEGER NOT NULL DEFAULT 0,
	updated_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE IF NOT EXISTS sessions (
	id TEXT PRIMARY KEY,
	user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	expires_at INTEGER NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS sessions_user_idx ON sessions(user_id, id);
`;

export function ensureSchema(sqlite: Database): void {
	sqlite.exec(DDL);
}
