import { redirect } from '@sveltejs/kit';
import { env as publicEnv } from '$env/dynamic/public';
import { getOrderLines, getPay } from '$lib/server/orders';
import { isStripeConfigured } from '$lib/server/stripe';
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
		publishableKey: publicEnv.PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '',
	};
};
