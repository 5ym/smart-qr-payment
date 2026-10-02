import { error, json } from '@sveltejs/kit';
import { createPay } from '#lib/server/db/repo.js';
import { calcAmount, getPay } from '#lib/server/orders.js';
import { getStripe } from '#lib/server/stripe.js';
import { randomCode } from '#lib/server/util.js';
import { PUBLIC_BASE_URL } from '$app/env/public';
import type { RequestHandler } from './$types';

/**
 * Create a Stripe PaymentIntent for the authenticated user's order and confirm
 * it. Mirrors the original DRF PaySerializer: on 3DS challenge the body is
 * `["req", client_secret]`; on card error it is `[message]`.
 */
export const POST: RequestHandler = async ({ locals, request, url }) => {
	if (!locals.user) throw error(401, 'authentication required');

	const stripe = getStripe();
	if (!stripe) throw error(503, 'Stripe is not configured');

	if (getPay(locals.user.id)) {
		return json({ ok: true });
	}

	const { token } = (await request.json()) as { token?: string };
	if (!token) throw error(400, 'payment method token required');

	const amount = calcAmount(locals.user.id);
	if (amount <= 0) throw error(400, '注文内容が空です');

	const base = PUBLIC_BASE_URL ?? url.origin;

	let intent: import('stripe').Stripe.PaymentIntent;
	try {
		const created = await stripe.paymentIntents.create({
			amount,
			currency: 'jpy',
			payment_method_types: ['card'],
			payment_method: token,
		});
		intent = await stripe.paymentIntents.confirm(created.id, {
			return_url: `${base}/pre/pay/secure`,
		});
	} catch (err) {
		const message =
			err && typeof err === 'object' && 'message' in err
				? String((err as { message: unknown }).message)
				: 'カード決済に失敗しました';
		return json([message], { status: 400 });
	}

	if (intent.status === 'succeeded') {
		createPay({ userId: locals.user.id, token: intent.id, code: randomCode(16) });
		return json({ ok: true }, { status: 201 });
	}

	// Requires further action (3DS): hand the client secret back to the client.
	return json(['req', intent.client_secret], { status: 400 });
};
