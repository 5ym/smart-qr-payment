import adapter from '@sveltejs/adapter-node';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		// SvelteKit の設定もここに置く (SvelteKit 3 から `svelte.config.*` は読まれない)。
		sveltekit({
			preprocess: vitePreprocess(),
			// adapter-node の出力を `bun ./build/index.js` で動かす。
			// Bun で起動するので、サーバ側では `bun:sqlite` をそのまま使える。
			adapter: adapter(),
			paths: {
				// 公開 URL の origin (CSRF 判定に使う)。adapter-node 6 で実行時の `ORIGIN`
				// が無くなったので、必要ならビルド時の `ORIGIN` で埋め込む。未設定なら
				// リクエストの Host (+ `PROTOCOL_HEADER`、既定 https) から求める。
				origin: process.env.ORIGIN || undefined,
			},
		}),
	],
	css: { preprocessorOptions: { scss: { silenceDeprecations: ['if-function'] } } },
});
