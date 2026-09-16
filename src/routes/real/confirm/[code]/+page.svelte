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

<div class="wrap">
	<h1>注文内容をご確認ください</h1>

	<div class="panel body box">
		<h2 class="who">{data.email}</h2>
		<OrderTable lines={data.order.lines} total={data.order.total} />
	</div>

	<div class="actions">
		<a href="/real/accept" class="button outline">戻る</a>
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
							5000
						);
						setTimeout(() => goto('/real'), 5000);
					}
				};
			}}
		>
			<button type="submit" class="block" disabled={loading || data.received}>
				{#if loading}
					<span class="spin"></span>
				{/if}
				確定
			</button>
		</form>
	</div>
</div>

<style>
.wrap {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 1.5rem;
	user-select: none;
}
h1 {
	font-size: 1.5rem;
}
.panel.box {
	width: 100%;
	max-width: 36rem;
	padding: 1.5rem;
}
.who {
	font-size: 1rem;
}

.actions {
	display: flex;
	gap: 1rem;
	width: 100%;
	max-width: 36rem;
}
/* 「戻る」と「確定」を同じ幅にする。確定はフォームに包まれているので中身も広げる */
.actions > a,
.actions > form {
	flex: 1 1 0;
}
</style>
