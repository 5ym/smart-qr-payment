<script lang="ts">
import { invalidateAll } from '$app/navigation';
import OrderTable from '$lib/components/OrderTable.svelte';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();
let loading = $state(false);

async function refresh() {
	loading = true;
	await invalidateAll();
	loading = false;
}
</script>

<svelte:head>
	<title>管理 · Smart QR Payment</title>
</svelte:head>

<div class="stack list">
	<div class="head">
		<h1>最近の受け取り</h1>
		<button type="button" class="mini" disabled={loading} onclick={refresh}>
			{#if loading}
				<span class="spin"></span>
			{/if}
			更新
		</button>
	</div>

	{#if data.orders.length === 0}
		<div class="note">受け取り済みの注文はありません。</div>
	{/if}

	{#each data.orders as order (order.email)}
		<div class="panel body box">
			<h2 class="who">{order.email}</h2>
			<OrderTable lines={order.lines} total={order.total} />
		</div>
	{/each}
</div>

<style>
.list {
	gap: 1.5rem;
}
.head {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 1rem;
}
.head h1 {
	font-size: 1.5rem;
}
.who {
	font-size: 1rem;
}
.panel.box {
	padding: 1.5rem;
}
</style>
