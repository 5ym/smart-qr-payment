import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { pays } from '$lib/server/db/schema';
import { requireStaff } from '$lib/server/guards';
import { isValidCode } from '$lib/validation';
import type { PageServerLoad } from './$types';

/**
 * Square POS returns here after a charge. On success it includes
 * CLIENT_TRANSACTION_ID; we then mark the matching order as received.
 */
export const load: PageServerLoad = async ({ locals, url }) => {
	requireStaff(locals.user, '/real/square');

	const q = url.searchParams;
	const transactionId = q.get('com.squareup.pos.CLIENT_TRANSACTION_ID');
	const code = q.get('com.squareup.pos.REQUEST_METADATA') ?? '';

	if (!transactionId) {
		return {
			ok: false as const,
			message: q.get('com.squareup.pos.ERROR_DESCRIPTION') ?? '決済がキャンセルされました'
		};
	}

	if (!isValidCode(code)) {
		return { ok: false as const, message: '不正なリクエストです' };
	}

	const pay = db.select().from(pays).where(eq(pays.code, code)).get();
	if (!pay) {
		return { ok: false as const, message: '該当する注文が見つかりません' };
	}

	db.update(pays).set({ receive: true }).where(eq(pays.id, pay.id)).run();
	return { ok: true as const, message: '' };
};
