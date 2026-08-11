import { eq } from 'drizzle-orm';
import { error, fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { pays, users } from '$lib/server/db/schema';
import { getOrderLines } from '$lib/server/orders';
import { requireStaff } from '$lib/server/guards';
import { isValidCode } from '$lib/validation';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	requireStaff(locals.user, `/real/confirm/${params.code}`);
	if (!isValidCode(params.code)) throw error(404, 'invalid code');

	const pay = db.select().from(pays).where(eq(pays.code, params.code)).get();
	if (!pay) throw error(404, 'order not found');

	const user = db.select().from(users).where(eq(users.id, pay.userId)).get();
	return {
		code: params.code,
		received: pay.receive,
		email: user?.email ?? '',
		order: getOrderLines(pay.userId)
	};
};

export const actions: Actions = {
	confirm: async ({ locals, params }) => {
		requireStaff(locals.user, `/real/confirm/${params.code}`);
		const pay = db.select().from(pays).where(eq(pays.code, params.code)).get();
		if (!pay) return fail(404, { error: '不正なQRコードです' });

		db.update(pays).set({ receive: true }).where(eq(pays.id, pay.id)).run();
		return { success: true };
	}
};
