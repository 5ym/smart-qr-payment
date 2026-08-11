<script lang="ts">
import type { Product } from '$lib/server/db/schema';

let {
	products,
	counts = $bindable({}),
	imageHeight = 'h-56',
}: {
	products: Product[];
	counts: Record<number, number>;
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

<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
	{#each products as product (product.id)}
		<div class="card bg-base-100 shadow-md">
			<figure class="relative {imageHeight} overflow-hidden">
				{#if product.image}
					<img
						src={'/img/' + product.image}
						alt={product.title}
						class="h-full w-full object-cover"
					/>
				{:else}
					<div class="bg-base-300 h-full w-full"></div>
				{/if}
				<div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
					<span class="text-lg font-bold text-white">{product.price.toLocaleString()}円</span>
				</div>
			</figure>
			<div class="card-body gap-3">
				<h3 class="card-title">{product.title}</h3>
				{#if product.desc}
					<p class="text-base-content/70 text-sm">{product.desc}</p>
				{/if}
				<div class="join justify-end self-end">
					<button
						type="button"
						class="btn btn-error join-item"
						aria-label="減らす"
						onclick={() => change(product.id, -1)}
					>
						−
					</button>
					<input
						type="number"
						min="0"
						inputmode="numeric"
						class="input input-bordered join-item w-20 text-center"
						value={counts[product.id] ?? 0}
						oninput={(e) => set(product.id, e.currentTarget.value)}
					/>
					<button
						type="button"
						class="btn btn-primary join-item"
						aria-label="増やす"
						onclick={() => change(product.id, 1)}
					>
						＋
					</button>
				</div>
			</div>
		</div>
	{/each}
</div>
