import { db } from './db';
import { getPayByUser } from './db/repo';

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
		.query(
			`SELECT p.id AS id, p.title AS title, up.price AS price, up.count AS count
			 FROM user_products up JOIN products p ON p.id = up.product_id
			 WHERE up.user_id = ?`,
		)
		.all(userId) as { id: number; title: string; price: number; count: number }[];

	const lines: OrderLine[] = rows.map((r) => ({
		id: r.id,
		title: r.title,
		price: r.price,
		count: r.count,
		subtotal: r.price * r.count,
	}));
	const total = lines.reduce((sum, l) => sum + l.subtotal, 0);
	return { lines, total };
}

export function getPay(userId: number) {
	return getPayByUser(userId);
}

export function calcAmount(userId: number): number {
	return getOrderLines(userId).total;
}
