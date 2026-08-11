/**
 * Seed script — run with `bun run db:seed`.
 *
 * Self-contained (no SvelteKit `$lib`/`$env` aliases) so it works under a plain
 * `bun run`. Creates the schema, a sample product catalogue and an admin user.
 */
import { Database } from 'bun:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { ensureSchema } from './ddl';

const url = process.env.DATABASE_URL ?? './data/sqp.db';
if (url !== ':memory:') mkdirSync(dirname(url), { recursive: true });

const db = new Database(url, { create: true });
db.exec('PRAGMA foreign_keys = ON;');
ensureSchema(db);

// --- Products -------------------------------------------------------------
const sampleProducts = [
	{ price: 500, image: 'sample.svg', title: 'ブレンドコーヒー', desc: '当店自慢の一杯' },
	{ price: 800, image: 'sample.svg', title: 'カフェラテ', desc: 'なめらかなミルク' },
	{ price: 300, image: 'sample.svg', title: '焼き菓子', desc: 'サクサク食感' },
];

const productCount = (db.query('SELECT COUNT(*) AS n FROM products').get() as { n: number }).n;
if (productCount === 0) {
	const insert = db.query('INSERT INTO products (price, image, title, desc) VALUES (?, ?, ?, ?)');
	for (const p of sampleProducts) insert.run(p.price, p.image, p.title, p.desc);
	console.info(`[seed] inserted ${sampleProducts.length} products`);
} else {
	console.info(`[seed] products already present (${productCount}), skipping`);
}

// --- Admin user -----------------------------------------------------------
const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@sqp.local';
const adminPassword = process.env.ADMIN_PASSWORD ?? 'adminpassword';

const existingAdmin = db.query('SELECT id FROM users WHERE email = ?').get(adminEmail);
if (!existingAdmin) {
	const passwordHash = await Bun.password.hash(adminPassword, 'argon2id');
	db.query(
		`INSERT INTO users (email, password_hash, is_active, is_staff, is_superuser)
		 VALUES (?, ?, 1, 1, 1)`,
	).run(adminEmail, passwordHash);
	console.info(`[seed] created admin user: ${adminEmail} / ${adminPassword}`);
} else {
	console.info(`[seed] admin user already exists: ${adminEmail}`);
}

console.info('[seed] done.');
