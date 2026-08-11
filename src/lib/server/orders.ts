import { eq } from 'drizzle-orm';
import { db } from './db';
import { userProducts, products, pays } from './db/schema';

export type OrderLine = {
	id: number;
	title: string;
	price: number;
	count: number;
	subtotal: number;
};

export type Order = {
	lines: OrderLine[];
	total: number;
};

/** Load a user's ordered line items joined with product info. */
export function getOrderLines(userId: number): Order {
	const rows = db
		.select({
			id: products.id,
			title: products.title,
			price: userProducts.price,
			count: userProducts.count
		})
		.from(userProducts)
		.innerJoin(products, eq(userProducts.productId, products.id))
		.where(eq(userProducts.userId, userId))
		.all();

	const lines: OrderLine[] = rows.map((r) => ({
		id: r.id,
		title: r.title,
		price: r.price,
		count: r.count,
		subtotal: r.price * r.count
	}));
	const total = lines.reduce((sum, l) => sum + l.subtotal, 0);
	return { lines, total };
}

export function getPay(userId: number) {
	return db.select().from(pays).where(eq(pays.userId, userId)).get() ?? null;
}

export function calcAmount(userId: number): number {
	return getOrderLines(userId).total;
}
