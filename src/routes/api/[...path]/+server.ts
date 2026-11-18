import type { RequestHandler } from './$types';
import { proxyToApi } from '$lib/server/api-proxy';

// Same-origin proxy: the browser calls /api/* on Vercel and this route
// forwards it to the FastAPI backend on Render. vercel.json also declares the
// equivalent external rewrite; this route is the guaranteed fallback.
const proxy: RequestHandler = ({ request, url }) =>
	proxyToApi(request, `${url.pathname}${url.search}`);

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;
export const HEAD = proxy;
