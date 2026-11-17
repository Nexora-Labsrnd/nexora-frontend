import adapter from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	},
	kit: {
		// Pinned to the Vercel adapter so the production build is the same
		// everywhere. The frontend has no server routes, so the functions this
		// produces are tiny — the FastAPI backend is deployed separately on Render.
		adapter: adapter({
			runtime: 'nodejs22.x'
		})
	}
};

export default config;
