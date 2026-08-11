import { env } from '$env/dynamic/private';

/**
 * Send the address-verification mail. In the original app this used Django's
 * SMTP backend (MailHog in dev). Here we POST to an SMTP-less transport only if
 * configured; otherwise we log the link so local development still works
 * without a mail server.
 *
 * To keep the dependency footprint small we shell out to `nodemailer` only when
 * SMTP settings are present. When they are absent we simply log — which is the
 * common case in local/dev and CI.
 */
export async function sendVerificationEmail(to: string, code: string): Promise<void> {
	const base = env.PUBLIC_BASE_URL ?? 'http://localhost:5173';
	const link = `${base}/pre/verify/${code}`;
	const subject = 'メールアドレスの確認<SQP>';
	const body =
		'この度はご注文ありがとうございます。\n' +
		'下記よりメールアドレスの確認をお願いいたします。確認完了後、支払画面に遷移いたします。\n' +
		link;

	const host = env.SMTP_HOST;
	if (!host) {
		console.info(`[email] (no SMTP configured) verification link for ${to}: ${link}`);
		return;
	}

	// Lazy import so the app has no hard runtime dependency on nodemailer unless
	// SMTP is actually configured.
	try {
		const { createTransport } = await import('nodemailer');
		const transport = createTransport({
			host,
			port: Number(env.SMTP_PORT ?? '1025'),
			secure: env.SMTP_SECURE === 'true',
			auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined
		});
		await transport.sendMail({
			from: env.MAIL_FROM ?? 'no-reply@sqp.local',
			to,
			subject,
			text: body
		});
	} catch (err) {
		console.error('[email] failed to send, falling back to log:', err);
		console.info(`[email] verification link for ${to}: ${link}`);
	}
}
