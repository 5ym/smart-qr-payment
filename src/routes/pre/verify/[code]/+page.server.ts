import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { users, verifies } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const verify = db.select().from(verifies).where(eq(verifies.code, params.code)).get();

	if (!verify) {
		// Unknown/already-consumed code: original behaviour forwards to the pay page.
		return { status: 'notfound' as const };
	}

	db.transaction((tx) => {
		tx.update(users).set({ isActive: true }).where(eq(users.id, verify.userId)).run();
		tx.delete(verifies).where(eq(verifies.id, verify.id)).run();
	});

	return { status: 'verified' as const };
};
