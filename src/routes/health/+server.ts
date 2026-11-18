import type { RequestHandler } from './$types';
import { proxyToApi } from '$lib/server/api-proxy';

// Convenience endpoint so the deployed frontend can be checked with
// GET <vercel-app>/health; it reaches the same Render backend as /api/*.
export const GET: RequestHandler = ({ request, url }) =>
	proxyToApi(request, `${url.pathname}${url.search}`);
