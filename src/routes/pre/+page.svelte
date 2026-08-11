<script lang="ts">
	import { enhance } from '$app/forms';
	import ProductPicker from '$lib/components/ProductPicker.svelte';
	import { toasts } from '$lib/stores/toast.svelte';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let counts = $state<Record<number, number>>({});
	let email = $state('');
	let password = $state('');
	let loading = $state(false);

	const selections = $derived(
		Object.entries(counts)
			.map(([id, count]) => ({ product: Number(id), count }))
			.filter((s) => s.count > 0)
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
					"メールを送信いたしました。メールをご確認ください。<br><a class='link' href='https://mail.google.com/'>Gmail</a>",
					8000
				);
				counts = {};
				email = '';
				password = '';
			}
		};
	}}
	class="flex flex-col gap-8"
>
	<section class="flex flex-col gap-4">
		<h1 class="text-2xl font-bold">欲しい商品の数量を指定してください</h1>
		<ProductPicker products={data.products} bind:counts />
	</section>

	<section class="flex flex-col items-center gap-4">
		<div class="card bg-base-100 w-full max-w-md shadow-md">
			<div class="card-body gap-4">
				<h2 class="card-title">お客様情報</h2>
				<p class="text-base-content/70 text-sm">
					メールアドレスとパスワードを入力し、注文内容に誤りがなければ送信してください。
				</p>
				<div class="stat px-0">
					<div class="stat-title">合計</div>
					<div class="stat-value text-primary">{total.toLocaleString()}円</div>
				</div>
				<label class="form-control w-full">
					<span class="label-text mb-1">メールアドレス</span>
					<input
						name="email"
						type="email"
						bind:value={email}
						maxlength="70"
						required
						class="input input-bordered w-full"
					/>
				</label>
				<label class="form-control w-full">
					<span class="label-text mb-1">パスワード</span>
					<input
						name="password"
						type="password"
						bind:value={password}
						minlength="8"
						maxlength="20"
						required
						class="input input-bordered w-full"
					/>
				</label>
				<button class="btn btn-primary" disabled={loading}>
					{#if loading}<span class="loading loading-spinner"></span>{/if}
					送信
				</button>
			</div>
		</div>
	</section>
</form>
