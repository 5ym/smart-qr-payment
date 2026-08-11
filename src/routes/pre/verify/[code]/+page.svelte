<script lang="ts">
import { onMount } from 'svelte';
import { goto } from '$app/navigation';
import { toasts } from '$lib/stores/toast.svelte';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();

onMount(() => {
	if (data.status === 'verified') {
		toasts.success('確認完了', 'メールアドレスの確認が完了しました。3秒後に支払画面に移動します。');
	}
	const t = setTimeout(() => goto('/pre/pay'), data.status === 'verified' ? 3000 : 0);
	return () => clearTimeout(t);
});
</script>

<svelte:head>
	<title>メール確認 · Smart QR Payment</title>
</svelte:head>

<div class="flex justify-center">
	<div class="card bg-base-100 w-full max-w-md shadow-lg">
		<div class="card-body items-center gap-4 text-center">
			<span class="loading loading-spinner loading-lg text-primary"></span>
			<h1 class="card-title">処理中...</h1>
		</div>
	</div>
</div>
