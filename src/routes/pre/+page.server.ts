import { fail } from '@sveltejs/kit';
import { eq, inArray } from 'drizzle-orm';
import { hashPassword } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { products as productsTable, userProducts, users, verifies } from '$lib/server/db/schema';
import { sendVerificationEmail } from '$lib/server/email';
import { randomCode } from '$lib/server/util';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const products = db.select().from(productsTable).all();
	return { products };
};

type Selection = { product: number; count: number };

function parseSelections(raw: FormDataEntryValue | null): Selection[] {
	if (typeof raw !== 'string') return [];
	try {
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];
		return parsed
			.map((s) => ({ product: Number(s.product), count: Number(s.count) }))
			.filter((s) => Number.isInteger(s.product) && Number.isInteger(s.count) && s.count > 0);
	} catch {
		return [];
	}
}

export const actions: Actions = {
	register: async ({ request }) => {
		const form = await request.formData();
		const email = String(form.get('email') ?? '').trim();
		const password = String(form.get('password') ?? '');
		const selections = parseSelections(form.get('products'));

		if (!email) return fail(400, { error: 'メールアドレスは必須です' });
		if (password.length < 8)
			return fail(400, { error: 'パスワードは8文字以上でなければなりません' });
		if (selections.length === 0) return fail(400, { error: '商品を1つ以上選択してください' });

		const existing = db.select().from(users).where(eq(users.email, email)).get();
		if (existing) return fail(400, { error: 'このメールアドレスは既に登録されています' });

		// Validate the selected products exist and capture their current price.
		const ids = selections.map((s) => s.product);
		const found = db.select().from(productsTable).where(inArray(productsTable.id, ids)).all();
		const priceById = new Map(found.map((p) => [p.id, p.price]));
		if (selections.some((s) => !priceById.has(s.product))) {
			return fail(400, { error: '選択内容をお確かめください' });
		}

		const passwordHash = await hashPassword(password);
		const code = randomCode(16);

		db.transaction((tx) => {
			const user = tx
				.insert(users)
				.values({ email, passwordHash, isActive: false })
				.returning()
				.get();
			tx.insert(verifies).values({ userId: user.id, code }).run();
			for (const s of selections) {
				tx.insert(userProducts)
					.values({
						userId: user.id,
						productId: s.product,
						count: s.count,
						price: priceById.get(s.product)!,
					})
					.run();
			}
		});

		await sendVerificationEmail(email, code);
		return { success: true };
	},
};
