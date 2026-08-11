/**
 * Seed script — run with `bun run db:seed`.
 *
 * Self-contained (no SvelteKit `$lib`/`$env` aliases) so it works under a plain
 * `bun run`. Creates the schema, a sample product catalogue and an admin user.
 */
import { Database } from 'bun:sqlite';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { eq } from 'drizzle-orm';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { ensureSchema } from './ddl';
import { users, products } from './schema';

const url = process.env.DATABASE_URL ?? './data/sqp.db';
if (url !== ':memory:') mkdirSync(dirname(url), { recursive: true });

const sqlite = new Database(url, { create: true });
sqlite.exec('PRAGMA foreign_keys = ON;');
ensureSchema(sqlite);
const db = drizzle(sqlite, { schema: { users, products } });

// --- Products -------------------------------------------------------------
const sampleProducts = [
	{ price: 500, image: 'sample.svg', title: 'ブレンドコーヒー', desc: '当店自慢の一杯' },
	{ price: 800, image: 'sample.svg', title: 'カフェラテ', desc: 'なめらかなミルク' },
	{ price: 300, image: 'sample.svg', title: '焼き菓子', desc: 'サクサク食感' }
];

const existingProducts = db.select().from(products).all();
if (existingProducts.length === 0) {
	db.insert(products).values(sampleProducts).run();
	console.info(`[seed] inserted ${sampleProducts.length} products`);
} else {
	console.info(`[seed] products already present (${existingProducts.length}), skipping`);
}

// --- Admin user -----------------------------------------------------------
const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@sqp.local';
const adminPassword = process.env.ADMIN_PASSWORD ?? 'adminpassword';

const existingAdmin = db.select().from(users).where(eq(users.email, adminEmail)).get();
if (!existingAdmin) {
	const passwordHash = await Bun.password.hash(adminPassword, 'argon2id');
	db.insert(users)
		.values({ email: adminEmail, passwordHash, isActive: true, isStaff: true, isSuperuser: true })
		.run();
	console.info(`[seed] created admin user: ${adminEmail} / ${adminPassword}`);
} else {
	console.info(`[seed] admin user already exists: ${adminEmail}`);
}

console.info('[seed] done.');
