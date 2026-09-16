<script lang="ts">
import { toasts } from '$lib/stores/toast.svelte';

const noteClass: Record<string, string> = {
	info: 'info',
	success: 'ok',
	warning: 'warn',
	error: 'err',
};
</script>

<div class="toasts">
	{#each toasts.items as t (t.id)}
		<div class="note {noteClass[t.kind]}">
			<div class="grow">
				<h3>{t.title}</h3>
				{#if t.message}
					<!-- Toast messages are developer-authored constant strings (never user
					     input), so rendering the small amount of markup they contain (links,
					     line breaks) is safe here. -->
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					<div class="msg small">{@html t.message}</div>
				{/if}
			</div>
			<button
				type="button"
				class="ghost mini"
				onclick={() => toasts.dismiss(t.id)}
				aria-label="閉じる"
			>
				✕
			</button>
		</div>
	{/each}
</div>

<style>
/* 画面の右上に積む。中身が無いときは触れないようにする */
.toasts {
	position: fixed;
	top: 1rem;
	right: 1rem;
	z-index: 50;
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
	max-width: calc(100% - 2rem);
	pointer-events: none;
}
.note {
	box-shadow: var(--ui-shadow);
	pointer-events: auto;
}
.note h3 {
	font-size: 0.95rem;
}
.msg {
	white-space: pre-line;
}
</style>
