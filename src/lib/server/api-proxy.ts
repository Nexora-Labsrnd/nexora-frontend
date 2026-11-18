import { env } from '$env/dynamic/private';

const DEFAULT_UPSTREAM = 'https://nexora-api-gu9p.onrender.com';

function upstreamBase(): string {
	return (env.NEXORA_API_URL || DEFAULT_UPSTREAM).replace(/\/+$/, '');
}

// Hop-by-hop headers belong to a single connection and must not be forwarded.
const HOP_BY_HOP = new Set([
	'connection',
	'content-length',
	'content-encoding',
	'transfer-encoding',
	'keep-alive',
	'proxy-authenticate',
	'proxy-authorization',
	'te',
	'trailer',
	'upgrade',
	'host'
]);

function cleanHeaders(headers: Headers): Headers {
	const result = new Headers();
	for (const [key, value] of headers) {
		if (!HOP_BY_HOP.has(key.toLowerCase())) result.append(key, value);
	}
	return result;
}

/**
 * Server-side fallback for the same-origin /api proxy.
 *
 * Vercel normally handles this with the `rewrites` in vercel.json, but those
 * rewrites are applied by the Vercel proxy and can be bypassed depending on
 * framework routing. This SvelteKit route guarantees that /api/* still reaches
 * Render from the same origin, with no CORS and no VITE_API_URL in the client.
 */
export async function proxyToApi(request: Request, pathAndQuery: string): Promise<Response> {
	const target = `${upstreamBase()}${pathAndQuery}`;
	const headers = cleanHeaders(request.headers);
	headers.delete('accept-encoding'); // let fetch decompress; we strip content-encoding below

	const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
	const init: RequestInit = {
		method: request.method,
		headers,
		redirect: 'manual'
	};
	if (hasBody) init.body = await request.arrayBuffer();

	let upstream: Response;
	try {
		upstream = await fetch(target, init);
	} catch (err) {
		console.error('Nexora API proxy failed', { target, err });
		return new Response(
			JSON.stringify({ detail: 'The Nexora API is unreachable. Please try again shortly.' }),
			{ status: 502, headers: { 'content-type': 'application/json' } }
		);
	}

	const responseHeaders = cleanHeaders(upstream.headers);
	const body = request.method === 'HEAD' || !upstream.body ? null : await upstream.arrayBuffer();
	return new Response(body, {
		status: upstream.status,
		statusText: upstream.statusText,
		headers: responseHeaders
	});
}
