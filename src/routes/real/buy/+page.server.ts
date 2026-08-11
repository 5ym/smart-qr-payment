import { env as publicEnv } from '$env/dynamic/public';
import { getAllProducts } from '$lib/server/db/repo';
import { requireStaff } from '$lib/server/guards';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	requireStaff(locals.user, '/real/buy');
	return {
		products: getAllProducts(),
		square: {
			applicationId: publicEnv.PUBLIC_SQUARE_APPLICATION_ID ?? '',
			callbackUrl: publicEnv.PUBLIC_SQUARE_CALLBACK_URL ?? '',
		},
	};
};
