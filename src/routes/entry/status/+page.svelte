<script lang="ts">
import { enhance, type SubmitFunction } from '$app/forms';
import type { ActionData, PageData } from './$types';

let { data, form }: { data: PageData; form: ActionData } = $props();
let loading = $state(false);

const tagClass = $derived(data.entry.status === 3 ? 'ok' : data.entry.status === 0 ? '' : 'warn');

const toggleHandler: SubmitFunction = () => {
	loading = true;
	return async ({ update }) => {
		// 失敗時のメッセージ (form) を出しつつ、ステータスを読み直す
		await update();
		loading = false;
	};
};
</script>

<svelte:head>
	<title>入場ステータス · mogiri</title>
</svelte:head>

<div class="center">
	<div class="panel body box">
		<h1>入場ステータス</h1>
		{#if form?.error}
			<div class="note err">{form.error}</div>
		{/if}
		<table class="info">
			<tbody>
				<tr>
					<th>名前</th>
					<td>{data.entry.name}</td>
				</tr>
				<tr>
					<th>連絡先</th>
					<td>{data.entry.contact}</td>
				</tr>
				<tr>
					<th>住所</th>
					<td>{data.entry.address}</td>
				</tr>
				<tr>
					<th>ステータス</th>
					<td><span class="tag {tagClass}">{data.entry.label}</span></td>
				</tr>
				<tr>
					<th>シークレット</th>
					<td class="mono">{data.entry.secret}</td>
				</tr>
			</tbody>
		</table>

		<div class="cluster">
			{#each [
				{ action: 'pay', label: '支払切替', cls: '' },
				{ action: 'entry', label: '入場切替', cls: 'secondary' },
				{ action: 'pe', label: '支払+入場', cls: 'contrast' },
			] as b (b.action)}
				<form method="POST" action="?/toggle" use:enhance={toggleHandler} class="act">
					<input type="hidden" name="secret" value={data.entry.secret}>
					<input type="hidden" name="action" value={b.action}>
					<button type="submit" class={b.cls} disabled={loading}>
						{b.label}
					</button>
				</form>
			{/each}
		</div>
	</div>
	<div class="cluster">
		<a href="/real/accept" class="button outline">続けて読み取る</a>
		<a href="/entry/list" class="button ghost">一覧に戻る</a>
	</div>
</div>

<style>
.center {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 1.5rem;
}
.box {
	width: 100%;
	max-width: 28rem;
}
.info th {
	white-space: nowrap;
}
/* 3 つのボタンを等幅で並べる */
.act {
	flex: 1 1 0;
}
.act button {
	width: 100%;
}
</style>
