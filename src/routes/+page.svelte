<script lang="ts">
const options = [
	{
		href: '/pre',
		title: '事前購入',
		subtitle: '事前購入されたい方はこちら',
		cls: 'from-primary to-primary/70',
	},
	{
		href: '/real',
		title: '対面販売',
		subtitle: '対面販売でのセルフレジを使う場合はこちら',
		cls: 'from-secondary to-secondary/70',
	},
];
</script>

<svelte:head>
	<title>Smart QR Payment</title>
</svelte:head>

<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
	{#each options as opt (opt.href)}
		<a
			href={opt.href}
			class="card bg-gradient-to-br {opt.cls} text-primary-content min-h-48 shadow-lg transition-transform hover:scale-[1.02]"
		>
			<div class="card-body justify-center">
				<h2 class="card-title text-3xl">{opt.title}</h2>
				<p class="opacity-90">{opt.subtitle}</p>
			</div>
		</a>
	{/each}
</div>
