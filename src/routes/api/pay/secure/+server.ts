import { json, error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { pays } from '$lib/server/db/schema';
import { getPay } from '$lib/server/orders';
import { getStripe } from '$lib/server/stripe';
import { randomCode } from '$lib/server/util';
import type { RequestHandler } from './$types';

/** Finalise a payment after a 3DS challenge (mirrors SecurePaySerializer). */
export const POST: RequestHandler = async ({ locals, request }) => {
	if (!locals.user) throw error(401, 'authentication required');

	const stripe = getStripe();
	if (!stripe) throw error(503, 'Stripe is not configured');

	if (getPay(locals.user.id)) {
		return json({ ok: true });
	}

	const { token } = (await request.json()) as { token?: string };
	if (!token) throw error(400, 'payment intent id required');

	const intent = await stripe.paymentIntents.retrieve(token);
	if (intent.status !== 'succeeded') {
		throw error(400, '決済が完了していません');
	}

	db.insert(pays)
		.values({ userId: locals.user.id, token: intent.id, code: randomCode(16) })
		.run();
	return json({ ok: true }, { status: 201 });
};
