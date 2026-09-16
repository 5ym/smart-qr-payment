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

<div class="wrap">
	<h1>受け取り用QRコードを読み込ませてください</h1>

	<div id="qr-reader"></div>

	{#if error}
		<div class="note warn msg">{error}</div>
	{/if}

	<a href="/real" class="button outline back">戻る</a>
</div>

<style>
.wrap {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 1.5rem;
	user-select: none;
}
h1 {
	font-size: 1.5rem;
}

/* html5-qrcode が中に video を差し込む枠 */
#qr-reader {
	width: 100%;
	max-width: 28rem;
	overflow: hidden;
	border-radius: var(--pico-border-radius);
	box-shadow: var(--ui-shadow);
}
.msg {
	max-width: 28rem;
}
.back {
	width: 100%;
	max-width: 28rem;
}
</style>
