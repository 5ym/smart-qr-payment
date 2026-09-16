<script lang="ts">
import { enhance } from '$app/forms';
import ProductPicker from '$lib/components/ProductPicker.svelte';
import { toasts } from '$lib/stores/toast.svelte';
import type { ActionData, PageData } from './$types';

let { data, form }: { data: PageData; form: ActionData } = $props();

let counts = $state<Record<number, number>>({});
let email = $state('');
let password = $state('');
let loading = $state(false);

const selections = $derived(
	Object.entries(counts)
		.map(([id, count]) => ({ product: Number(id), count }))
		.filter((s) => s.count > 0),
);
const total = $derived(data.products.reduce((sum, p) => sum + p.price * (counts[p.id] ?? 0), 0));

$effect(() => {
	if (form?.error) toasts.error('エラー', form.error);
});
</script>

<svelte:head>
	<title>事前購入 · Smart QR Payment</title>
</svelte:head>

<form
	method="POST"
	action="?/register"
	use:enhance={({ formData, cancel }) => {
		if (!email || password.length < 8 || selections.length === 0) {
			toasts.warning('入力エラー', 'メール・パスワード(8文字以上)・商品選択をご確認ください');
			cancel();
			return;
		}
		formData.set('products', JSON.stringify(selections));
		loading = true;
		return async ({ update, result }) => {
			await update({ reset: false });
			loading = false;
			if (result.type === 'success') {
				toasts.success(
					'送信完了',
					"メールを送信いたしました。メールをご確認ください。<br><a href='https://mail.google.com/'>Gmail</a>",
					8000
				);
				counts = {};
				email = '';
				password = '';
			}
		};
	}}
	class="stack outer"
>
	<section class="stack">
		<h1>欲しい商品の数量を指定してください</h1>
		<ProductPicker products={data.products} bind:counts />
	</section>

	<section class="center">
		<div class="panel body box">
			<h2>お客様情報</h2>
			<p class="muted small">
				メールアドレスとパスワードを入力し、注文内容に誤りがなければ送信してください。
			</p>
			<div>
				<div class="sum-label">合計</div>
				<div class="sum-value">{total.toLocaleString()}円</div>
			</div>
			<label class="field">
				<span class="lab">メールアドレス</span>
				<input name="email" type="email" bind:value={email} maxlength="70" required>
			</label>
			<label class="field">
				<span class="lab">パスワード</span>
				<input
					name="password"
					type="password"
					bind:value={password}
					minlength="8"
					maxlength="20"
					required
				>
			</label>
			<button type="submit" class="block" disabled={loading}>
				{#if loading}
					<span class="spin"></span>
				{/if}
				送信
			</button>
		</div>
	</section>
</form>

<style>
.outer {
	gap: 2rem;
}
h1 {
	font-size: 1.5rem;
}

.center {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 1rem;
}
.panel.box {
	width: 100%;
	max-width: 28rem;
	gap: 1rem;
	padding: 1.5rem;
}
</style>
