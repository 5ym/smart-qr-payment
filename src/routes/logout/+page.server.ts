import { redirect } from '@sveltejs/kit';
import { SESSION_COOKIE, clearSessionCookie, deleteSession } from '$lib/server/auth';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async (event) => {
		const sessionId = event.cookies.get(SESSION_COOKIE);
		if (sessionId) deleteSession(sessionId);
		clearSessionCookie(event);
		throw redirect(303, '/');
	}
};
