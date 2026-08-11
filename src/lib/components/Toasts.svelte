<script lang="ts">
import { toasts } from '$lib/stores/toast.svelte';

const alertClass: Record<string, string> = {
	info: 'alert-info',
	success: 'alert-success',
	warning: 'alert-warning',
	error: 'alert-error',
};
</script>

<div class="toast toast-top toast-end z-50 max-w-full">
	{#each toasts.items as t (t.id)}
		<div class="alert {alertClass[t.kind]} shadow-lg">
			<div>
				<h3 class="font-bold">{t.title}</h3>
				{#if t.message}
					<!-- Toast messages are developer-authored constant strings (never user
					     input), so rendering the small amount of markup they contain (links,
					     line breaks) is safe here. -->
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					<div class="text-sm whitespace-pre-line">{@html t.message}</div>
				{/if}
			</div>
			<button class="btn btn-ghost btn-xs" onclick={() => toasts.dismiss(t.id)} aria-label="閉じる">
				✕
			</button>
		</div>
	{/each}
</div>
