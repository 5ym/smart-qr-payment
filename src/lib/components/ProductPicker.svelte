<script lang="ts">
import type { Product } from '#lib/server/db/schema.js';

let {
	products,
	counts = $bindable({}),
}: {
	products: Product[];
	counts: Record<number, number>;
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
		<article>
			{#if product.image}
				<img src={`/img/${product.image}`} alt={product.title}>
			{/if}
			<h3>{product.title}</h3>
			<p>
				{product.price.toLocaleString()}円
				{#if product.desc}
					<br><small>{product.desc}</small>
				{/if}
			</p>
			<div role="group">
				<button
					type="button"
					class="secondary"
					aria-label="減らす"
					onclick={() => change(product.id, -1)}
				>
					−
				</button>
				<input
					type="number"
					min="0"
					inputmode="numeric"
					aria-label="{product.title}の数量"
					value={counts[product.id] ?? 0}
					oninput={(e) => set(product.id, e.currentTarget.value)}
				>
				<button type="button" aria-label="増やす" onclick={() => change(product.id, 1)}>＋</button>
			</div>
		</article>
	{/each}
</div>

<style>
/* 商品の数に合わせて折り返す(Pico の .grid は全部を一行に並べてしまう) */
.lineup {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
	gap: var(--pico-grid-column-gap);
}
/* 写真の大きさが商品ごとに違っても揃える */
img {
	width: 100%;
	aspect-ratio: 3 / 2;
	object-fit: cover;
}
</style>
