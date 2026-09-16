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
	width: 100%;
	max-width: 28rem;
	align-items: center;
	gap: 1rem;
	padding: 1.5rem;
	text-align: center;
}
.box h1 {
	font-size: 1rem;
}
</style>
