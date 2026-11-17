import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

// Vite config runs in Node; declared here so no @types/node dependency is needed.
declare const process: { env: Record<string, string | undefined> };

// Where the FastAPI backend listens. run.py sets this; default matches it.
const API_TARGET = process.env.NEXORA_API_URL ?? 'http://127.0.0.1:8000';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	server: {
		port: 5173,
		strictPort: true,
		// Allow access through LAN IPs and public share tunnels (cloudflared).
		host: true,
		allowedHosts: true,
		// One origin for everything: the browser only talks to Vite, which
		// forwards API calls to the backend. No CORS or hard-coded hosts.
		proxy: {
			'/api': { target: API_TARGET, changeOrigin: true },
			'/health': { target: API_TARGET, changeOrigin: true }
		}
	}
});
