<script lang="ts">
import { goto } from '$app/navigation';
import ProductPicker from '$lib/components/ProductPicker.svelte';
import { toasts } from '$lib/stores/toast.svelte';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();

let counts = $state<Record<number, number>>({});
let loading = $state(false);

const total = $derived(data.products.reduce((sum, p) => sum + p.price * (counts[p.id] ?? 0), 0));
const selections = $derived(
	Object.entries(counts)
		.map(([id, count]) => ({ product: Number(id), count }))
		.filter((s) => s.count > 0),
);

function buildSquareUrl(code: string): string {
	const tenderTypes = 'com.squareup.pos.TENDER_CARD,com.squareup.pos.TENDER_CASH';
	return (
		'intent:#Intent;' +
		'action=com.squareup.pos.action.CHARGE;' +
		'package=com.squareup;' +
		`S.com.squareup.pos.WEB_CALLBACK_URI=${data.square.callbackUrl};` +
		`S.com.squareup.pos.CLIENT_ID=${data.square.applicationId};` +
		'S.com.squareup.pos.API_VERSION=v2.0;' +
		`i.com.squareup.pos.TOTAL_AMOUNT=${total};` +
		'S.com.squareup.pos.CURRENCY_CODE=JPY;' +
		`S.com.squareup.pos.TENDER_TYPES=${tenderTypes};` +
		'l.com.squareup.pos.AUTO_RETURN_TIMEOUT_MS=3200;' +
		`S.com.squareup.pos.REQUEST_METADATA=${code};` +
		'end'
	);
}

async function submit() {
	if (selections.length === 0) {
		toasts.warning('入力エラー', '商品を1つ以上選択してください');
		return;
	}
	loading = true;
	try {
		const res = await fetch('/api/buy', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ userproducts: selections }),
		});
		if (res.ok) {
			const { code } = await res.json();
			window.open(buildSquareUrl(code));
		} else if (res.status === 401) {
			goto('/login?redirect=/real/buy');
		} else if (res.status === 403) {
			toasts.error('エラー', '権限がありません');
		} else {
			toasts.error('エラー', '選択内容をお確かめください');
		}
	} catch {
		toasts.error('エラー', '送信時にエラーが発生しました');
	} finally {
		loading = false;
	}
}
</script>

<svelte:head>
	<title>当日購入 · Smart QR Payment</title>
</svelte:head>

<div class="stack wrap">
	<h1>欲しい商品の数量を指定してください</h1>
	<ProductPicker products={data.products} bind:counts imageHeight="16rem" />

	<div>
		<div class="sum-label">合計</div>
		<div class="sum-value">{total.toLocaleString()}円</div>
	</div>

	<div class="actions">
		<a href="/real" class="button outline big">戻る</a>
		<button type="button" class="big" disabled={loading} onclick={submit}>
			{#if loading}
				<span class="spin"></span>
			{/if}
			確定
		</button>
	</div>
</div>

<style>
.wrap {
	gap: 1.5rem;
	user-select: none;
}
h1 {
	font-size: 1.5rem;
}

.actions {
	display: flex;
	gap: 1rem;
}
/* 「戻る」と「確定」を同じ幅にする */
.actions > a,
.actions > button {
	flex: 1 1 0;
}
</style>
