<script lang="ts">
const options = [
	{
		href: '/real/accept',
		title: '受け取り',
		subtitle: '事前購入された方はこちら',
		img: '/img/real0.svg',
		cls: 'from-primary to-primary/70',
	},
	{
		href: '/real/buy',
		title: '当日購入',
		subtitle: '当日お買い求めの方はこちら',
		img: '/img/real1.svg',
		cls: 'from-secondary to-secondary/70',
	},
];
</script>

<svelte:head>
	<title>対面販売 · Smart QR Payment</title>
</svelte:head>

<div class="grid grid-cols-1 gap-6 select-none sm:grid-cols-2">
	{#each options as opt (opt.href)}
		<a href={opt.href} class="card image-full shadow-lg transition-transform hover:scale-[1.02]">
			<figure>
				<img src={opt.img} alt={opt.title} class="h-96 w-full object-cover" />
			</figure>
			<div class="card-body justify-end bg-gradient-to-t {opt.cls} opacity-90">
				<h2 class="card-title text-2xl text-white">{opt.title}</h2>
				<p class="text-white/90">{opt.subtitle}</p>
			</div>
		</a>
	{/each}
</div>
