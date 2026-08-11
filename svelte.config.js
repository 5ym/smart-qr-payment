import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		// adapter-node runs the built server under Bun (`bun ./build/index.js`),
		// which is required so `bun:sqlite` is available at runtime.
		adapter: adapter()
	}
};

export default config;
