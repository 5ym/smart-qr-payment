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

<div class="flex flex-col items-center gap-8">
	<section class="w-full max-w-xl">
		<h1 class="mb-4 text-2xl font-bold">注文内容をご確認ください</h1>
		<div class="card bg-base-100 shadow-md">
			<div class="card-body">
				<h2 class="card-title text-base">{data.email}</h2>
				<OrderTable lines={data.order.lines} total={data.order.total} />
			</div>
		</div>
	</section>

	<section class="w-full max-w-md">
		<h2 class="mb-4 text-xl font-semibold">お支払い情報</h2>
		<div class="card bg-base-100 shadow-md">
			<div class="card-body gap-4">
				{#if !data.stripeConfigured}
					<div class="alert alert-warning text-sm">
						Stripe が設定されていません。<code>STRIPE_SECRET_KEY</code> と
						<code>PUBLIC_STRIPE_PUBLISHABLE_KEY</code> を設定してください。
					</div>
				{:else}
					<div id="card-element" class="border-base-300 rounded-lg border p-3"></div>
					{#if cardError}
						<p class="text-error text-sm" role="alert">{cardError}</p>
					{/if}
					<button class="btn btn-primary" disabled={loading} onclick={submit}>
						{#if loading}<span class="loading loading-spinner"></span>{/if}
						支払
					</button>
				{/if}
			</div>
		</div>
	</section>
</div>

{#if show3ds}
	<div class="modal modal-open">
		<div class="modal-box h-[90vh] max-w-4xl p-0">
			<iframe src={iframeUrl} title="3D Secure" class="h-full w-full border-0"></iframe>
		</div>
	</div>
{/if}
