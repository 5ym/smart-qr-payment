<script lang="ts">
import { onMount } from 'svelte';
import OrderTable from '#lib/components/OrderTable.svelte';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();
let dataUrl = $state('');

onMount(async () => {
	const QRCode = (await import('qrcode')).default;
	dataUrl = await QRCode.toDataURL(data.code, { width: 320, margin: 2 });
});
</script>

<svelte:head>
	<title>QRコード · mogiri</title>
</svelte:head>

<h1>QRコード</h1>
<article>
	{#if dataUrl}
		<img src={dataUrl} alt="受け取り用QRコード" width="320" height="320">
	{:else}
		<p aria-busy="true">QRコードを作っています</p>
	{/if}
	<p>
		<small><code>{data.code}</code></small>
	</p>
</article>

<h2>注文内容</h2>
<article>
	<h3>{data.email}</h3>
	<OrderTable lines={data.order.lines} total={data.order.total} />
</article>
