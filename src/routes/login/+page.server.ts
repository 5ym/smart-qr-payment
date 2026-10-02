import { fail, redirect } from '@sveltejs/kit';
import { createSession, setSessionCookie, verifyPassword } from '#lib/server/auth.js';
import { getUserByEmail } from '#lib/server/db/repo.js';
import type { Actions, PageServerLoad } from './$types';

/**
 * `?redirect=` の行き先。サイト内の道 (`/` 始まり、`//` や `/\` 始まりは除く) だけ通し、
 * ほかは `/` にする。SvelteKit 3 の `redirect()` は外への転送を明示しないと投げる
 * (500 になる) ので、外を指す値はここで落とす。
 */
function redirectTarget(url: URL): string {
	const to = url.searchParams.get('redirect');
	return to && /^\/(?![/\\])/.test(to) ? to : '/';
}

export const load: PageServerLoad = async ({ locals, url }) => {
	if (locals.user) {
		throw redirect(303, redirectTarget(url));
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

		throw redirect(303, redirectTarget(event.url));
	},
};
