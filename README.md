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
3. Add the environment variable:

   ```text
   VITE_API_URL=https://nexora-api.onrender.com
   ```

   Vite inlines this at **build time**, so redeploy after changing it.

4. The Render backend must allow this origin in its `CORS_ORIGINS` setting.

## Assets

All brand assets are local to this repo:

- `static/` — favicon, logos and hero image (served from `/`)
- `src/lib/assets/favicon.svg` — imported by the root page

No assets are shared with the backend repository.
