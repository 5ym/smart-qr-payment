import { fail, redirect } from '@sveltejs/kit';
import { createSession, setSessionCookie, verifyPassword } from '$lib/server/auth';
import { getUserByEmail } from '$lib/server/db/repo';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (locals.user) {
		throw redirect(303, url.searchParams.get('redirect') ?? '/');
	}
	return {};
};

export const actions: Actions = {
	default: async (event) => {
		const form = await event.request.formData();
		const email = String(form.get('email') ?? '').trim();
		const password = String(form.get('password') ?? '');

		if (!email || !password) {
			return fail(400, { email, error: 'メールアドレスとパスワードを入力してください' });
		}

		const user = getUserByEmail(email);
		if (!user?.isActive || !(await verifyPassword(password, user.passwordHash))) {
			return fail(401, {
				email,
				error: 'メールアドレスもしくはパスワード、または両方が間違っています',
			});
		}

		const sessionId = createSession(user.id);
		setSessionCookie(event, sessionId);

		const redirectTo = event.url.searchParams.get('redirect') ?? '/';
		throw redirect(303, redirectTo);
	},
};
