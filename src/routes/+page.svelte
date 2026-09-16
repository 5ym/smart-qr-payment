<script lang="ts">
const options = [
	{
		href: '/pre',
		title: '事前購入',
		subtitle: '事前購入されたい方はこちら',
		cls: 'primary',
	},
	{
		href: '/real',
		title: '対面販売',
		subtitle: '対面販売でのセルフレジを使う場合はこちら',
		cls: 'secondary',
	},
];
</script>

<svelte:head>
	<title>Smart QR Payment</title>
</svelte:head>

<div class="tiles">
	{#each options as opt (opt.href)}
		<a href={opt.href} class="tile {opt.cls}">
			<div class="body">
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
}
@media (min-width: 640px) {
	.tiles {
		grid-template-columns: 1fr 1fr;
	}
}

.tile {
	display: flex;
	min-height: 12rem;
	border-radius: var(--pico-border-radius);
	box-shadow: var(--ui-shadow);
	text-decoration: none;
	transition: transform 0.15s ease;
}
.tile:hover {
	transform: scale(1.02);
}
.tile.primary {
	background-image: linear-gradient(
		to bottom right,
		var(--pico-primary-background),
		color-mix(in srgb, var(--pico-primary-background) 70%, transparent)
	);
	color: var(--pico-primary-inverse);
}
.tile.secondary {
	background-image: linear-gradient(
		to bottom right,
		var(--pico-secondary-background),
		color-mix(in srgb, var(--pico-secondary-background) 70%, transparent)
	);
	color: var(--pico-secondary-inverse);
}

.body {
	display: flex;
	flex-direction: column;
	justify-content: center;
	gap: 0.5rem;
	padding: 1.5rem;
}
.body h2 {
	font-size: 1.875rem;
}
.body p {
	opacity: 0.9;
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
