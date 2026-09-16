<script lang="ts">
import { onMount } from 'svelte';
import { goto } from '$app/navigation';
import { toasts } from '$lib/stores/toast.svelte';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();

onMount(() => {
	if (data.ok) {
		toasts.success(
			'Complete',
			'お買い上げありがとうございます。商品をお渡しします。5秒後にトップに戻ります。',
			5000,
		);
		setTimeout(() => goto('/real'), 5000);
	} else {
		toasts.error('エラー', `${data.message}。3秒後に商品選択画面に戻ります。`);
		setTimeout(() => goto('/real/buy'), 3000);
	}
});
</script>

<svelte:head>
	<title>決済処理 · Smart QR Payment</title>
</svelte:head>

<div class="wrap">
	<div class="panel body box">
		<span class="spin lg"></span>
		<h1>処理中...</h1>
	</div>
</div>

<style>
.wrap {
	display: flex;
	justify-content: center;
}
.panel.box {
	align-items: center;
	gap: 1rem;
	padding: 1.5rem;
	text-align: center;
}
.box h1 {
	font-size: 1rem;
}
</style>
