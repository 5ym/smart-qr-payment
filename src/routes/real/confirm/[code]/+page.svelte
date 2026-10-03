<script lang="ts">
import { onMount } from 'svelte';
import OrderTable from '#lib/components/OrderTable.svelte';
import { toasts } from '#lib/stores/toast.svelte.js';
import { enhance } from '$app/forms';
import { goto } from '$app/navigation';
import type { ActionData, PageData } from './$types';

let { data, form }: { data: PageData; form: ActionData } = $props();
let loading = $state(false);

onMount(() => {
	if (data.received) {
		toasts.warning('受け取り済み', '受け取り済みのQRコードです。3秒後にQR読み込み画面に戻ります。');
		setTimeout(() => goto('/real/accept'), 3000);
	}
});

$effect(() => {
	if (form?.error) toasts.error('エラー', form.error);
});
</script>

<svelte:head>
	<title>受け取り確認 · mogiri</title>
</svelte:head>

<h1>注文内容をご確認ください</h1>

<article>
	<h2>{data.email}</h2>
	<OrderTable lines={data.order.lines} total={data.order.total} />
</article>

<div class="grid">
	<a href="/real/accept" role="button" class="outline">戻る</a>
	<form
		method="POST"
		action="?/confirm"
		use:enhance={() => {
			loading = true;
			return async ({ update, result }) => {
				await update();
				loading = false;
				if (result.type === 'success') {
					toasts.success(
						'Complete',
						'お買い上げありがとうございます。商品をお渡しします。5秒後にトップに戻ります。',
						5000,
					);
					setTimeout(() => goto('/real'), 5000);
				}
			};
		}}
	>
		<button type="submit" disabled={loading || data.received} aria-busy={loading}>確定</button>
	</form>
</div>
