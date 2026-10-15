/**
 * Adapts the existing Netlify-style handlers to Cloudflare Pages Functions.
 * The business logic remains in netlify/functions so both runtimes can be
 * tested during the migration.
 */
export async function runNetlifyHandler(request, handler) {
  const url = new URL(request.url);
  const body = request.method === 'GET' || request.method === 'HEAD'
    ? null
    : await request.text();

  const result = await handler({
    httpMethod: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    queryStringParameters: Object.fromEntries(url.searchParams.entries()),
    body
  }, {});

  const responseHeaders = new Headers(result.headers || {});
  return new Response(result.body || '', {
    status: result.statusCode || 200,
    headers: responseHeaders
  });
}
