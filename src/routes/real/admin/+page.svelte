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

<div class="flex flex-col gap-6">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold">最近の受け取り</h1>
		<button class="btn btn-primary btn-sm" disabled={loading} onclick={refresh}>
			{#if loading}<span class="loading loading-spinner loading-sm"></span>{/if}
			更新
		</button>
	</div>

	{#if data.orders.length === 0}
		<div class="alert">受け取り済みの注文はありません。</div>
	{/if}

	{#each data.orders as order (order.email)}
		<div class="card bg-base-100 shadow-md">
			<div class="card-body">
				<h2 class="card-title text-base">{order.email}</h2>
				<OrderTable lines={order.lines} total={order.total} />
			</div>
		</div>
	{/each}
</div>
