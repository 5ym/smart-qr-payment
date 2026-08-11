import { error, json } from '@sveltejs/kit';
import { inArray } from 'drizzle-orm';
import { hashPassword } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { pays, products as productsTable, userProducts, users } from '$lib/server/db/schema';
import { requireStaff } from '$lib/server/guards';
import { randomCode } from '$lib/server/util';
import type { RequestHandler } from './$types';

type Selection = { product: number; count: number };

/**
 * Create a pseudo order for an in-person same-day purchase (mirrors the DRF
 * BuySerializer). Returns the QR/receipt code used as Square's request metadata.
 */
export const POST: RequestHandler = async ({ locals, request }) => {
	requireStaff(locals.user, '/real/buy');

	const body = (await request.json()) as { userproducts?: Selection[] };
	const selections = (body.userproducts ?? []).filter(
		(s) => Number.isInteger(s.product) && Number.isInteger(s.count) && s.count > 0,
	);
	if (selections.length === 0) throw error(400, '選択内容をお確かめください');

	const ids = selections.map((s) => s.product);
	const found = db.select().from(productsTable).where(inArray(productsTable.id, ids)).all();
	const priceById = new Map(found.map((p) => [p.id, p.price]));
	if (selections.some((s) => !priceById.has(s.product))) {
		throw error(400, '選択内容をお確かめください');
	}

	const email = `info+${Date.now()}@sqp.local`;
	const passwordHash = await hashPassword(randomCode(16));
	const code = randomCode(16);

	db.transaction((tx) => {
		const user = tx.insert(users).values({ email, passwordHash, isActive: true }).returning().get();
		for (const s of selections) {
			tx.insert(userProducts)
				.values({
					userId: user.id,
					productId: s.product,
					count: s.count,
					price: priceById.get(s.product)!,
				})
				.run();
		}
		tx.insert(pays).values({ userId: user.id, code, token: code, receive: false }).run();
	});

	return json({ code }, { status: 201 });
};
