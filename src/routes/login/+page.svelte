<script lang="ts">
import { enhance } from '$app/forms';
import type { ActionData } from './$types';

let { form }: { form: ActionData } = $props();
let loading = $state(false);
</script>

<svelte:head>
	<title>ログイン · Smart QR Payment</title>
</svelte:head>

<div class="wrap">
	<div class="panel body box">
		<h1>Login to SQP</h1>

		{#if form?.error}
			<div class="note err">{form.error}</div>
		{/if}

		<form
			method="POST"
			use:enhance={() => {
				loading = true;
				return async ({ update }) => {
					await update();
					loading = false;
				};
			}}
			class="form"
		>
			<label class="field">
				<span class="lab">メールアドレス</span>
				<input
					name="email"
					type="email"
					required
					maxlength="70"
					value={form?.email ?? ''}
					placeholder="you@example.com"
				>
			</label>
			<label class="field">
				<span class="lab">パスワード</span>
				<input
					name="password"
					type="password"
					required
					minlength="8"
					maxlength="20"
					placeholder="8文字以上"
				>
			</label>
			<button type="submit" class="block send" disabled={loading}>
				{#if loading}
					<span class="spin"></span>
				{/if}
				Login
			</button>
		</form>
	</div>
</div>

<style>
.wrap {
	display: flex;
	justify-content: center;
}
.panel.box {
	width: 100%;
	max-width: 28rem;
	gap: 1rem;
	padding: 1.5rem;
}
.box h1 {
	font-size: 1.5rem;
}

.form {
	display: flex;
	flex-direction: column;
	gap: 1rem;
}
.send {
	margin-top: 0.5rem;
}
</style>
