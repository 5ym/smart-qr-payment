import { relations, sql } from 'drizzle-orm';
import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

/**
 * Users. Mirrors the original custom Django user (email as the username), but
 * passwords are hashed with Bun.password (argon2id) instead of Django's hasher.
 */
export const users = sqliteTable('users', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	email: text('email').notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	isActive: integer('is_active', { mode: 'boolean' }).notNull().default(false),
	isStaff: integer('is_staff', { mode: 'boolean' }).notNull().default(false),
	isSuperuser: integer('is_superuser', { mode: 'boolean' }).notNull().default(false),
	createdAt: text('created_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

/** Email-verification codes (one-to-one with a user, removed once verified). */
export const verifies = sqliteTable('verifies', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	userId: integer('user_id')
		.notNull()
		.unique()
		.references(() => users.id, { onDelete: 'cascade' }),
	code: text('code').notNull(),
});

/** Catalogue of purchasable products. */
export const products = sqliteTable('products', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	price: integer('price').notNull(),
	image: text('image').notNull(),
	title: text('title').notNull(),
	desc: text('desc').notNull().default(''),
});

/** Line items: a product bought by a user, with the price captured at order time. */
export const userProducts = sqliteTable('user_products', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	userId: integer('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	productId: integer('product_id')
		.notNull()
		.references(() => products.id, { onDelete: 'cascade' }),
	count: integer('count').notNull(),
	price: integer('price').notNull(),
});

/** Payment / order status (one per user). `code` is the QR payload. */
export const pays = sqliteTable('pays', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	userId: integer('user_id')
		.notNull()
		.unique()
		.references(() => users.id, { onDelete: 'cascade' }),
	token: text('token').notNull(),
	code: text('code').notNull(),
	receive: integer('receive', { mode: 'boolean' }).notNull().default(false),
	updatedAt: text('updated_at').notNull().default(sql`(CURRENT_TIMESTAMP)`),
});

/** Server-side sessions backing the auth cookie. */
export const sessions = sqliteTable(
	'sessions',
	{
		id: text('id').primaryKey(),
		userId: integer('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		expiresAt: integer('expires_at').notNull(),
	},
	(table) => [uniqueIndex('sessions_user_idx').on(table.userId, table.id)],
);

export const usersRelations = relations(users, ({ one, many }) => ({
	verify: one(verifies, { fields: [users.id], references: [verifies.userId] }),
	pay: one(pays, { fields: [users.id], references: [pays.userId] }),
	userProducts: many(userProducts),
}));

export const verifiesRelations = relations(verifies, ({ one }) => ({
	user: one(users, { fields: [verifies.userId], references: [users.id] }),
}));

export const userProductsRelations = relations(userProducts, ({ one }) => ({
	user: one(users, { fields: [userProducts.userId], references: [users.id] }),
	product: one(products, { fields: [userProducts.productId], references: [products.id] }),
}));

export const paysRelations = relations(pays, ({ one }) => ({
	user: one(users, { fields: [pays.userId], references: [users.id] }),
}));

export type User = typeof users.$inferSelect;
export type Product = typeof products.$inferSelect;
export type UserProduct = typeof userProducts.$inferSelect;
export type Pay = typeof pays.$inferSelect;
