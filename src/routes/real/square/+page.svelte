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
				5000
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

<div class="flex justify-center">
	<div class="card bg-base-100 shadow-lg">
		<div class="card-body items-center gap-4 text-center">
			<span class="loading loading-spinner loading-lg text-primary"></span>
			<h1 class="card-title">処理中...</h1>
		</div>
	</div>
</div>
