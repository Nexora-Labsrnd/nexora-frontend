# Nexora frontend

SvelteKit + Tailwind web app for Nexora. The FastAPI backend lives in the
separate [`nexora`](https://github.com/Nexora-Labsrnd/nexora) repository and is
deployed on Render; this repo is deployed on Vercel on its own.

## Local development

Requires Node 20.19+ / 22.12+.

```sh
npm install
npm run dev            # http://localhost:5173
```

Leave `VITE_API_URL` unset locally. `vite.config.ts` proxies `/api` and
`/health` to `http://127.0.0.1:8000`, so the browser only talks to Vite and no
CORS configuration is needed. Override the target with `NEXORA_API_URL` if the
backend runs elsewhere.

The one-command launcher in the backend repo (`python run.py`) recognises this
repo as a sibling directory named `nexora-frontend`, or at the path given by
`NEXORA_FRONTEND_DIR`.

## Deploy to Vercel

1. Import **this repository** into Vercel. The project root is the app root —
   do **not** set a Root Directory subdirectory.
2. Build settings are detected automatically; `svelte.config.js` pins
   `@sveltejs/adapter-vercel`.
3. **No environment variables are required.** `vercel.json` proxies `/api/*`
   and `/health` to the Render backend, so the browser only talks to its own
   Vercel origin. You can remove `VITE_API_URL` from Vercel; it is ignored in
   production builds.
4. There is also a SvelteKit server-route fallback (`src/routes/api/[...path]`)
   for cases where Vercel does not apply the `vercel.json` rewrites. It uses
   `NEXORA_API_URL`.
5. Because requests are same-origin, no CORS configuration is needed on Render.
   If the Render URL ever changes, update the rewrites in `vercel.json` **and**
   the `NEXORA_API_URL` default in `src/lib/server/api-proxy.ts`.

## Assets

All brand assets are local to this repo:

- `static/` — favicon, logos and hero image (served from `/`)
- `src/lib/assets/favicon.svg` — imported by the root page

No assets are shared with the backend repository.
