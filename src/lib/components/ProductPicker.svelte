<script lang="ts">
import type { Product } from '$lib/server/db/schema';

let {
	products,
	counts = $bindable({}),
	imageHeight = '14rem',
}: {
	products: Product[];
	counts: Record<number, number>;
	// 写真の高さ。画面ごとに変えるので CSS の長さで受け取る
	imageHeight?: string;
} = $props();

function change(id: number, delta: number) {
	const next = Math.max(0, (counts[id] ?? 0) + delta);
	counts = { ...counts, [id]: next };
}

function set(id: number, value: string) {
	const n = Number(value);
	counts = { ...counts, [id]: Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0 };
}
</script>

<div class="lineup">
	{#each products as product (product.id)}
		<div class="panel item">
			<figure class="shot" style="height: {imageHeight}">
				{#if product.image}
					<img src={`/img/${product.image}`} alt={product.title}>
				{:else}
					<div class="blank"></div>
				{/if}
				<div class="price">
					<span>{product.price.toLocaleString()}円</span>
				</div>
			</figure>
			<div class="info">
				<h3>{product.title}</h3>
				{#if product.desc}
					<p class="muted small">{product.desc}</p>
				{/if}
				<div class="counter">
					<button
						type="button"
						class="minus"
						aria-label="減らす"
						onclick={() => change(product.id, -1)}
					>
						−
					</button>
					<input
						type="number"
						min="0"
						inputmode="numeric"
						class="count"
						value={counts[product.id] ?? 0}
						oninput={(e) => set(product.id, e.currentTarget.value)}
					>
					<button type="button" aria-label="増やす" onclick={() => change(product.id, 1)}>
						＋
					</button>
				</div>
			</div>
		</div>
	{/each}
</div>

<style>
.lineup {
	display: grid;
	grid-template-columns: 1fr;
	gap: 1.5rem;
}
@media (min-width: 640px) {
	.lineup {
		grid-template-columns: repeat(2, 1fr);
	}
}
@media (min-width: 1024px) {
	.lineup {
		grid-template-columns: repeat(3, 1fr);
	}
}

/* 写真を箱の角に合わせて切るので overflow を止める */
.item {
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

.shot {
	position: relative;
	margin: 0;
	overflow: hidden;
}
.shot img,
.blank {
	width: 100%;
	height: 100%;
	object-fit: cover;
}
.blank {
	background: var(--ui-base-300);
}
/* 値段は写真の下端に重ねる。写真が明るくても読めるよう影を敷く */
.price {
	position: absolute;
	inset-inline: 0;
	bottom: 0;
	background-image: linear-gradient(to top, var(--ui-scrim), transparent);
	padding: 0.75rem;
	color: var(--ui-scrim-color);
	font-size: 1.125rem;
	font-weight: 700;
}

.info {
	display: flex;
	flex-direction: column;
	gap: 0.75rem;
	padding: 1.5rem;
}
.info h3 {
	font-size: 1.125rem;
}

/* 減らす・数・増やすを隙間なくつなげる */
.counter {
	display: flex;
	align-self: flex-end;
}
.counter > :first-child {
	border-start-end-radius: 0;
	border-end-end-radius: 0;
}
.counter > :last-child {
	border-start-start-radius: 0;
	border-end-start-radius: 0;
}
.counter > :not(:first-child) {
	margin-inline-start: -1px;
}
.count {
	width: 5rem;
	margin: 0;
	border-radius: 0;
	text-align: center;
}
.minus {
	border-color: var(--ui-err);
	background: var(--ui-err);
	color: var(--pico-primary-inverse);
}
</style>
