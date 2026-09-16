<script lang="ts">
import { onMount } from 'svelte';
import OrderTable from '$lib/components/OrderTable.svelte';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();
let dataUrl = $state('');

onMount(async () => {
	const QRCode = (await import('qrcode')).default;
	dataUrl = await QRCode.toDataURL(data.code, { width: 320, margin: 2 });
});
</script>

<svelte:head>
	<title>QRコード · Smart QR Payment</title>
</svelte:head>

<div class="wrap">
	<section class="center">
		<h1>QRコード</h1>
		<div class="panel body box mid">
			{#if dataUrl}
				<img src={dataUrl} alt="受け取り用QRコード" width="320" height="320">
			{:else}
				<div class="wait"></div>
			{/if}
			<p class="muted small mono">{data.code}</p>
		</div>
	</section>

	<section class="col">
		<h2 class="head">注文内容</h2>
		<div class="panel body box">
			<h3 class="who">{data.email}</h3>
			<OrderTable lines={data.order.lines} total={data.order.total} />
		</div>
	</section>
</div>

<style>
.wrap {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 2rem;
}
.center {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 1rem;
}
.col {
	display: flex;
	flex-direction: column;
	gap: 1rem;
	width: 100%;
	max-width: 36rem;
}
h1 {
	font-size: 1.5rem;
}
.head {
	font-size: 1.25rem;
	font-weight: 600;
}
.who {
	font-size: 1rem;
}
.panel.box {
	padding: 1.5rem;
}
.mid {
	align-items: center;
}

/* QRコードを読み込むまでの場所取り。出来上がった画像と同じ大きさにする */
.wait {
	width: 20rem;
	height: 20rem;
	border-radius: var(--pico-border-radius);
	background: var(--ui-base-300);
	animation: qr-pulse 1.5s ease-in-out infinite;
}
@keyframes qr-pulse {
	50% {
		opacity: 0.5;
	}
}
@media (prefers-reduced-motion: reduce) {
	.wait {
		animation: none;
	}
}
</style>
