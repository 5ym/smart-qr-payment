<script lang="ts">
import type { Stripe, StripeCardElement } from '@stripe/stripe-js';
import { onMount } from 'svelte';
import { goto } from '$app/navigation';
import OrderTable from '$lib/components/OrderTable.svelte';
import { toasts } from '$lib/stores/toast.svelte';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();

let stripe: Stripe | null = null;
let card: StripeCardElement | null = null;
let cardError = $state('');
let loading = $state(false);
let show3ds = $state(false);
let iframeUrl = $state('');
let intentSecret = '';

async function onSucceeded() {
	toasts.success('決済完了', 'カード決済が完了しました。3秒後にQRコード画面に移動します。');
	setTimeout(() => goto('/pre/qr'), 3000);
}

onMount(() => {
	if (!data.stripeConfigured || !data.publishableKey) return;

	(async () => {
		const { loadStripe } = await import('@stripe/stripe-js');
		stripe = await loadStripe(data.publishableKey);
		if (!stripe) return;
		card = stripe.elements().create('card');
		card.mount('#card-element');
		card.on('change', (event) => {
			cardError = event.error?.message ?? '';
		});
	})();

	const onMessage = (ev: MessageEvent) => {
		if (ev.data !== '3DS-authentication-complete' || !stripe) return;
		show3ds = false;
		stripe.retrievePaymentIntent(intentSecret).then((result) => {
			if (result.paymentIntent?.status === 'succeeded') {
				onSucceeded();
			} else {
				toasts.error(
					'エラー',
					'カード決済時にエラーが発生しました。別のカードをお試しいただくか、カード会社にお問い合わせください。',
				);
			}
		});
	};
	window.addEventListener('message', onMessage);
	return () => window.removeEventListener('message', onMessage);
});

async function submit() {
	if (!stripe || !card) return;
	loading = true;
	try {
		const method = await stripe.createPaymentMethod({ type: 'card', card });
		if (method.error) {
			cardError = method.error.message ?? '';
			loading = false;
			return;
		}
		const res = await fetch('/api/pay', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ token: method.paymentMethod.id }),
		});
		if (res.ok) {
			loading = false;
			await onSucceeded();
			return;
		}
		const body = await res.json();
		if (res.status === 401) {
			goto('/login?redirect=/pre/pay');
		} else if (Array.isArray(body) && body[0] === 'req') {
			const r = await stripe.retrievePaymentIntent(body[1]);
			intentSecret = r.paymentIntent?.client_secret ?? body[1];
			const nextAction = r.paymentIntent?.next_action;
			iframeUrl = nextAction?.redirect_to_url?.url ?? '';
			show3ds = true;
		} else {
			const msg = Array.isArray(body) ? body[0] : (body?.message ?? '不明なエラー');
			toasts.error('エラー', `カード決済時にエラーが発生しました。<br>${msg}`);
		}
	} catch {
		toasts.error('エラー', 'カード決済時にエラーが発生しました。');
	} finally {
		loading = false;
	}
}
</script>

<svelte:head>
	<title>お支払い · Smart QR Payment</title>
</svelte:head>

<div class="wrap">
	<section class="col wide">
		<h1>注文内容をご確認ください</h1>
		<div class="panel body box">
			<h2 class="who">{data.email}</h2>
			<OrderTable lines={data.order.lines} total={data.order.total} />
		</div>
	</section>

	<section class="col narrow">
		<h2 class="head">お支払い情報</h2>
		<div class="panel body box">
			{#if !data.stripeConfigured}
				<div class="note warn">
					Stripe が設定されていません。<code>STRIPE_SECRET_KEY</code>
					と
					<code>PUBLIC_STRIPE_PUBLISHABLE_KEY</code>
					を設定してください。
				</div>
			{:else}
				<div id="card-element"></div>
				{#if cardError}
					<p class="fail small" role="alert">{cardError}</p>
				{/if}
				<button type="button" class="block" disabled={loading} onclick={submit}>
					{#if loading}
						<span class="spin"></span>
					{/if}
					支払
				</button>
			{/if}
		</div>
	</section>
</div>

{#if show3ds}
	<div class="overlay">
		<div class="frame">
			<iframe src={iframeUrl} title="3D Secure"></iframe>
		</div>
	</div>
{/if}

<style>
.wrap {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 2rem;
}
.col {
	display: flex;
	flex-direction: column;
	gap: 1rem;
	width: 100%;
}
.wide {
	max-width: 36rem;
}
.narrow {
	max-width: 28rem;
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
	gap: 1rem;
	padding: 1.5rem;
}

/* Stripe が iframe を差し込む枠。枠線を自分で描く */
#card-element {
	border: 1px solid var(--ui-base-300);
	border-radius: var(--pico-border-radius);
	padding: 0.75rem;
}
.fail {
	color: var(--ui-err);
}

/* 3D セキュアの画面。カード会社のページをそのまま重ねて出す */
.overlay {
	position: fixed;
	inset: 0;
	z-index: 40;
	display: flex;
	align-items: center;
	justify-content: center;
	background: var(--ui-scrim-weak);
	padding: 1rem;
}
.frame {
	width: 100%;
	max-width: 56rem;
	height: 90vh;
	overflow: hidden;
	border-radius: var(--pico-border-radius);
	background: var(--ui-surface);
}
.frame iframe {
	display: block;
	width: 100%;
	height: 100%;
	border: 0;
}
</style>
