import { redirect } from '@sveltejs/kit';
import { getOrderLines, getPay } from '#lib/server/orders.js';
import { isStripeConfigured } from '#lib/server/stripe.js';
import { PUBLIC_STRIPE_PUBLISHABLE_KEY } from '$app/env/public';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(303, '/login?redirect=/pre/pay');
	}
	if (getPay(locals.user.id)) {
		throw redirect(303, '/pre/qr');
	}

	const order = getOrderLines(locals.user.id);
	return {
		email: locals.user.email,
		order,
		stripeConfigured: isStripeConfigured(),
		publishableKey: PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '',
	};
};
