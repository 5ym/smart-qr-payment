import Stripe from 'stripe';
import { env } from '$env/dynamic/private';

let client: Stripe | null = null;

/** Lazily construct the Stripe client. Returns null when no secret key is set. */
export function getStripe(): Stripe | null {
	if (client) return client;
	const key = env.STRIPE_SECRET_KEY;
	if (!key) return null;
	client = new Stripe(key);
	return client;
}

export function isStripeConfigured(): boolean {
	return Boolean(env.STRIPE_SECRET_KEY);
}
