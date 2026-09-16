<script lang="ts">
const options = [
	{
		href: '/real/accept',
		title: '受け取り',
		subtitle: '事前購入された方はこちら',
		img: '/img/real0.svg',
		cls: 'primary',
	},
	{
		href: '/real/buy',
		title: '当日購入',
		subtitle: '当日お買い求めの方はこちら',
		img: '/img/real1.svg',
		cls: 'secondary',
	},
];
</script>

<svelte:head>
	<title>対面販売 · Smart QR Payment</title>
</svelte:head>

<div class="tiles">
	{#each options as opt (opt.href)}
		<a href={opt.href} class="tile">
			<figure>
				<img src={opt.img} alt={opt.title}>
			</figure>
			<div class="body {opt.cls}">
				<h2>{opt.title}</h2>
				<p>{opt.subtitle}</p>
			</div>
		</a>
	{/each}
</div>

<style>
.tiles {
	display: grid;
	grid-template-columns: 1fr;
	gap: 1.5rem;
	user-select: none;
}
@media (min-width: 640px) {
	.tiles {
		grid-template-columns: 1fr 1fr;
	}
}

.tile {
	position: relative;
	display: block;
	overflow: hidden;
	border-radius: var(--pico-border-radius);
	box-shadow: var(--ui-shadow);
	text-decoration: none;
	transition: transform 0.15s ease;
}
.tile:hover {
	transform: scale(1.02);
}
.tile img {
	display: block;
	width: 100%;
	height: 24rem;
	object-fit: cover;
}

/* 写真の上に色を重ねて、その上に文字を置く */
.body {
	position: absolute;
	inset: 0;
	display: flex;
	flex-direction: column;
	justify-content: flex-end;
	gap: 0.5rem;
	padding: 1.5rem;
	opacity: 0.9;
}
.body.primary {
	background-image: linear-gradient(
		to top,
		var(--pico-primary-background),
		color-mix(in srgb, var(--pico-primary-background) 70%, transparent)
	);
	color: var(--pico-primary-inverse);
}
.body.secondary {
	background-image: linear-gradient(
		to top,
		var(--pico-secondary-background),
		color-mix(in srgb, var(--pico-secondary-background) 70%, transparent)
	);
	color: var(--pico-secondary-inverse);
}
.body h2 {
	font-size: 1.5rem;
}

@media (prefers-reduced-motion: reduce) {
	.tile {
		transition: none;
	}
	.tile:hover {
		transform: none;
	}
}
</style>
