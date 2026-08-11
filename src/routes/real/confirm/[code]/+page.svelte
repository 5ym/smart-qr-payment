<script lang="ts">
import { onMount } from 'svelte';
import { enhance } from '$app/forms';
import { goto } from '$app/navigation';
import OrderTable from '$lib/components/OrderTable.svelte';
import { toasts } from '$lib/stores/toast.svelte';
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
	<title>受け取り確認 · Smart QR Payment</title>
</svelte:head>

<div class="flex flex-col items-center gap-6 select-none">
	<h1 class="text-2xl font-bold">注文内容をご確認ください</h1>

	<div class="card bg-base-100 w-full max-w-xl shadow-md">
		<div class="card-body">
			<h2 class="card-title text-base">{data.email}</h2>
			<OrderTable lines={data.order.lines} total={data.order.total} />
		</div>
	</div>

	<div class="flex w-full max-w-xl gap-4">
		<a href="/real/accept" class="btn btn-outline flex-1">戻る</a>
		<form
			method="POST"
			action="?/confirm"
			class="flex-1"
			use:enhance={() => {
				loading = true;
				return async ({ update, result }) => {
					await update();
					loading = false;
					if (result.type === 'success') {
						toasts.success(
							'Complete',
							'お買い上げありがとうございます。商品をお渡しします。5秒後にトップに戻ります。',
							5000
						);
						setTimeout(() => goto('/real'), 5000);
					}
				};
			}}
		>
			<button type="submit" class="btn btn-primary btn-block" disabled={loading || data.received}>
				{#if loading}
					<span class="loading loading-spinner"></span>
				{/if}
				確定
			</button>
		</form>
	</div>
</div>
