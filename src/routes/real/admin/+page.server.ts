import { getRecentReceivedPays } from '$lib/server/db/repo';
import { requireStaff } from '$lib/server/guards';
import { getOrderLines } from '$lib/server/orders';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	requireStaff(locals.user, '/real/admin');

	const orders = getRecentReceivedPays(3).map((r) => ({
		email: r.email,
		...getOrderLines(r.userId),
	}));
	return { orders };
};
