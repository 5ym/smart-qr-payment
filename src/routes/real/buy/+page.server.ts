import { env as publicEnv } from '$env/dynamic/public';
import { db } from '$lib/server/db';
import { products as productsTable } from '$lib/server/db/schema';
import { requireStaff } from '$lib/server/guards';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	requireStaff(locals.user, '/real/buy');
	return {
		products: db.select().from(productsTable).all(),
		square: {
			applicationId: publicEnv.PUBLIC_SQUARE_APPLICATION_ID ?? '',
			callbackUrl: publicEnv.PUBLIC_SQUARE_CALLBACK_URL ?? '',
		},
	};
};
