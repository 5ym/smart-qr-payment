import { env } from '$env/dynamic/private';
import { parseAcsConfig, sendMailAcs } from './acs';

/**
 * Send the address-verification mail via Azure Communication Services (Email).
 * When ACS is not configured the link is logged instead, so local development
 * and CI work without a mail service.
 */
export async function sendVerificationEmail(to: string, code: string): Promise<void> {
	const base = env.PUBLIC_BASE_URL ?? 'http://localhost:5173';
	const link = `${base}/pre/verify/${code}`;
	const subject = 'メールアドレスの確認<SQP>';
	const body =
		'この度はご注文ありがとうございます。\n' +
		'下記よりメールアドレスの確認をお願いいたします。確認完了後、支払画面に遷移いたします。\n' +
		link;

	const config = parseAcsConfig(env);
	if (!config) {
		console.info(`[email] (ACS not configured) verification link for ${to}: ${link}`);
		return;
	}

	try {
		await sendMailAcs(config, { to, subject, text: body });
	} catch (err) {
		console.error('[email] ACS send failed, falling back to log:', err);
		console.info(`[email] verification link for ${to}: ${link}`);
	}
}
