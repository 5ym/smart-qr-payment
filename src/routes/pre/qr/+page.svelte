<script lang="ts">
	import { onMount } from 'svelte';
	import QRCode from 'qrcode';
	import OrderTable from '$lib/components/OrderTable.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let dataUrl = $state('');

	onMount(async () => {
		dataUrl = await QRCode.toDataURL(data.code, { width: 320, margin: 2 });
	});
</script>

<svelte:head>
	<title>QRコード · Smart QR Payment</title>
</svelte:head>

<div class="flex flex-col items-center gap-8">
	<section class="flex flex-col items-center gap-4">
		<h1 class="text-2xl font-bold">QRコード</h1>
		<div class="card bg-base-100 shadow-md">
			<div class="card-body items-center">
				{#if dataUrl}
					<img src={dataUrl} alt="受け取り用QRコード" width="320" height="320" />
				{:else}
					<div class="skeleton h-80 w-80"></div>
				{/if}
				<p class="text-base-content/60 font-mono text-sm">{data.code}</p>
			</div>
		</div>
	</section>

	<section class="w-full max-w-xl">
		<h2 class="mb-4 text-xl font-semibold">注文内容</h2>
		<div class="card bg-base-100 shadow-md">
			<div class="card-body">
				<h3 class="card-title text-base">{data.email}</h3>
				<OrderTable lines={data.order.lines} total={data.order.total} />
			</div>
		</div>
	</section>
</div>
