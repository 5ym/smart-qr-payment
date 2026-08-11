import { desc, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { pays, users } from '$lib/server/db/schema';
import { requireStaff } from '$lib/server/guards';
import { getOrderLines } from '$lib/server/orders';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	requireStaff(locals.user, '/real/admin');

	const rows = db
		.select({ email: users.email, userId: pays.userId })
		.from(pays)
		.innerJoin(users, eq(pays.userId, users.id))
		.where(eq(pays.receive, true))
		.orderBy(desc(pays.updatedAt))
		.limit(3)
		.all();

	const orders = rows.map((r) => ({ email: r.email, ...getOrderLines(r.userId) }));
	return { orders };
};
