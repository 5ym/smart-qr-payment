<script lang="ts">
import type { Html5Qrcode } from 'html5-qrcode';
import { onDestroy, onMount } from 'svelte';
import { goto } from '$app/navigation';
import { isValidCode } from '$lib/validation';

let scanner: Html5Qrcode | null = null;
let error = $state('');
let handled = false;

onMount(async () => {
	const { Html5Qrcode } = await import('html5-qrcode');
	scanner = new Html5Qrcode('qr-reader');
	try {
		await scanner.start(
			{ facingMode: 'environment' },
			{ fps: 10, qrbox: { width: 250, height: 250 } },
			onScan,
			() => {},
		);
	} catch (e) {
		error =
			e instanceof Error
				? `カメラを起動できませんでした: ${e.message}`
				: 'カメラを起動できませんでした';
	}
});

async function onScan(text: string) {
	if (handled) return;
	if (isValidCode(text)) {
		handled = true;
		await stop();
		goto(`/real/confirm/${text}`);
	} else {
		error =
			'不正なQRコードかQRコードが正しく読み取れませんでした。もう一度読み込み直してください。';
	}
}

async function stop() {
	if (scanner?.isScanning) {
		try {
			await scanner.stop();
		} catch {
			/* ignore */
		}
	}
}

onDestroy(stop);
</script>

<svelte:head>
	<title>受け取り · Smart QR Payment</title>
</svelte:head>

<div class="flex flex-col items-center gap-6 select-none">
	<h1 class="text-2xl font-bold">受け取り用QRコードを読み込ませてください</h1>

	<div id="qr-reader" class="w-full max-w-md overflow-hidden rounded-lg shadow-md"></div>

	{#if error}
		<div class="alert alert-warning max-w-md text-sm">{error}</div>
	{/if}

	<a href="/real" class="btn btn-outline btn-block max-w-md">戻る</a>
</div>
