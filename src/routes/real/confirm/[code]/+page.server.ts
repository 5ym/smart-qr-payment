import { error, fail } from '@sveltejs/kit';
import { getPayByCode, getUserById, setPayReceived } from '$lib/server/db/repo';
import { requireStaff } from '$lib/server/guards';
import { getOrderLines } from '$lib/server/orders';
import { isValidCode } from '$lib/validation';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	requireStaff(locals.user, `/real/confirm/${params.code}`);
	if (!isValidCode(params.code)) throw error(404, 'invalid code');

	const pay = getPayByCode(params.code);
	if (!pay) throw error(404, 'order not found');

	const user = getUserById(pay.userId);
	return {
		code: params.code,
		received: pay.receive,
		email: user?.email ?? '',
		order: getOrderLines(pay.userId),
	};
};

export const actions: Actions = {
	confirm: async ({ locals, params }) => {
		requireStaff(locals.user, `/real/confirm/${params.code}`);
		const pay = getPayByCode(params.code);
		if (!pay) return fail(404, { error: '不正なQRコードです' });

		setPayReceived(pay.id);
		return { success: true };
	},
};
