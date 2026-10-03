<script lang="ts">
import OrderTable from '#lib/components/OrderTable.svelte';
import { refreshAll } from '$app/navigation';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();
let loading = $state(false);

async function refresh() {
	loading = true;
	await refreshAll();
	loading = false;
}
</script>

<svelte:head>
	<title>管理 · mogiri</title>
</svelte:head>

<h1>最近の受け取り</h1>
<button type="button" class="outline" disabled={loading} aria-busy={loading} onclick={refresh}>
	更新
</button>

{#if data.orders.length === 0}
	<p>受け取り済みの注文はありません。</p>
{/if}

{#each data.orders as order (order.email)}
	<article>
		<h2>{order.email}</h2>
		<OrderTable lines={order.lines} total={order.total} />
	</article>
{/each}
