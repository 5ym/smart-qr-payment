import { db } from './index';
import type { Pay, Product, User } from './schema';

/**
 * Typed data-access helpers over raw `bun:sqlite`. SELECTs alias snake_case
 * columns to camelCase; integer flags are coerced to booleans on the way out.
 */

type UserRow = Omit<User, 'isActive' | 'isStaff' | 'isSuperuser'> & {
	isActive: number;
	isStaff: number;
	isSuperuser: number;
};
type PayRow = Omit<Pay, 'receive'> & { receive: number };

const USER_COLS =
	'id, email, password_hash AS passwordHash, is_active AS isActive, is_staff AS isStaff, is_superuser AS isSuperuser, created_at AS createdAt';
const PAY_COLS = 'id, user_id AS userId, token, code, receive, updated_at AS updatedAt';

function toUser(row: UserRow | null): User | null {
	if (!row) return null;
	return {
		...row,
		isActive: Boolean(row.isActive),
		isStaff: Boolean(row.isStaff),
		isSuperuser: Boolean(row.isSuperuser),
	};
}

function toPay(row: PayRow | null): Pay | null {
	if (!row) return null;
	return { ...row, receive: Boolean(row.receive) };
}

// --- Users ----------------------------------------------------------------

export function getUserByEmail(email: string): User | null {
	return toUser(db.query(`SELECT ${USER_COLS} FROM users WHERE email = ?`).get(email) as UserRow);
}

export function getUserById(id: number): User | null {
	return toUser(db.query(`SELECT ${USER_COLS} FROM users WHERE id = ?`).get(id) as UserRow);
}

export function createUser(input: {
	email: string;
	passwordHash: string;
	isActive?: boolean;
	isStaff?: boolean;
	isSuperuser?: boolean;
}): User {
	const row = db
		.query(
			`INSERT INTO users (email, password_hash, is_active, is_staff, is_superuser)
			 VALUES (?, ?, ?, ?, ?) RETURNING ${USER_COLS}`,
		)
		.get(
			input.email,
			input.passwordHash,
			input.isActive ? 1 : 0,
			input.isStaff ? 1 : 0,
			input.isSuperuser ? 1 : 0,
		) as UserRow;
	return toUser(row)!;
}

export function activateUser(id: number): void {
	db.query('UPDATE users SET is_active = 1 WHERE id = ?').run(id);
}

// --- Verifications --------------------------------------------------------

export function createVerify(userId: number, code: string): void {
	db.query('INSERT INTO verifies (user_id, code) VALUES (?, ?)').run(userId, code);
}

export function getVerifyByCode(code: string): { id: number; userId: number } | null {
	return (
		(db.query('SELECT id, user_id AS userId FROM verifies WHERE code = ?').get(code) as {
			id: number;
			userId: number;
		} | null) ?? null
	);
}

export function deleteVerify(id: number): void {
	db.query('DELETE FROM verifies WHERE id = ?').run(id);
}

// --- Products -------------------------------------------------------------

export function getAllProducts(): Product[] {
	return db
		.query('SELECT id, price, image, title, desc FROM products ORDER BY id')
		.all() as Product[];
}

export function getProductsByIds(ids: number[]): Product[] {
	if (ids.length === 0) return [];
	const placeholders = ids.map(() => '?').join(', ');
	return db
		.query(`SELECT id, price, image, title, desc FROM products WHERE id IN (${placeholders})`)
		.all(...ids) as Product[];
}

export function createUserProduct(input: {
	userId: number;
	productId: number;
	count: number;
	price: number;
}): void {
	db.query('INSERT INTO user_products (user_id, product_id, count, price) VALUES (?, ?, ?, ?)').run(
		input.userId,
		input.productId,
		input.count,
		input.price,
	);
}

// --- Pays -----------------------------------------------------------------

export function getPayByUser(userId: number): Pay | null {
	return toPay(db.query(`SELECT ${PAY_COLS} FROM pays WHERE user_id = ?`).get(userId) as PayRow);
}

export function getPayByCode(code: string): Pay | null {
	return toPay(db.query(`SELECT ${PAY_COLS} FROM pays WHERE code = ?`).get(code) as PayRow);
}

export function createPay(input: {
	userId: number;
	token: string;
	code: string;
	receive?: boolean;
}): void {
	db.query('INSERT INTO pays (user_id, token, code, receive) VALUES (?, ?, ?, ?)').run(
		input.userId,
		input.token,
		input.code,
		input.receive ? 1 : 0,
	);
}

export function setPayReceived(id: number): void {
	db.query('UPDATE pays SET receive = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(id);
}

/** Most-recently received orders with the buyer's email (admin list). */
export function getRecentReceivedPays(limit: number): { email: string; userId: number }[] {
	return db
		.query(
			`SELECT u.email AS email, p.user_id AS userId
			 FROM pays p JOIN users u ON u.id = p.user_id
			 WHERE p.receive = 1 ORDER BY p.updated_at DESC LIMIT ?`,
		)
		.all(limit) as { email: string; userId: number }[];
}

/** Run a set of writes in a single transaction. */
export function transaction<T>(fn: () => T): T {
	return db.transaction(fn)();
}
