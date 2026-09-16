<script lang="ts">
import '../app.scss';
import { enhance } from '$app/forms';
import { page } from '$app/state';
import Toasts from '$lib/components/Toasts.svelte';

let { children } = $props();
const user = $derived(page.data.user);
</script>

<div class="shell">
	<header class="bar">
		<div class="page inner">
			<a href="/" class="button ghost brand">
				<span class="mark">Smart</span>QR<span class="mark alt">Pay</span>
			</a>
			<div class="grow"></div>
			{#if user}
				<span class="who muted small">{user.email}</span>
				{#if user.isStaff}
					<a href="/real/admin" class="button ghost mini">管理</a>
				{/if}
				<form method="POST" action="/logout" use:enhance>
					<button type="submit" class="outline mini">ログアウト</button>
				</form>
			{:else}
				<a href="/login" class="button mini">ログイン</a>
			{/if}
		</div>
	</header>

	<main class="page main">
		{@render children()}
	</main>

	<footer class="foot muted small">
		<aside>
			<p>Smart QR Payment · Bun + SvelteKit + SQLite + Pico CSS</p>
		</aside>
	</footer>
</div>

<Toasts />

<style>
/* 画面の高さいっぱいに広げて、足元を下に押し付ける */
.shell {
	display: flex;
	flex-direction: column;
	min-height: 100dvh;
}

.bar {
	border-bottom: 1px solid var(--ui-base-300);
	background: var(--ui-surface);
	box-shadow: var(--ui-shadow);
}
.inner {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	min-height: 4rem;
	padding-block: 0.5rem;
}
.brand {
	font-size: 1.25rem;
}
.mark {
	color: var(--pico-primary);
}
.mark.alt {
	color: var(--pico-secondary);
}
/* 狭い画面ではメールアドレスを隠す(ボタンを押せる幅を優先する) */
.who {
	display: none;
}
@media (min-width: 640px) {
	.who {
		display: inline;
	}
}

.main {
	flex: 1 1 auto;
	padding-block: 2rem;
}

.foot {
	padding: 1rem;
	text-align: center;
}
</style>
