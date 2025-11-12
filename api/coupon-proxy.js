// /api/coupon-proxy.ts (Edge Runtime)
export const config = { runtime: 'edge' };

function corsHeaders(origin: string) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  };
}
function preflight(origin: string) {
  return new Response(null, { status: 204, headers: corsHeaders(origin) });
}

export default async function handler(req: Request) {
  const origin = req.headers.get('origin') || '*';
  if (req.method === 'OPTIONS') return preflight(origin);

  const COUPON_EXEC_URL =
    process.env.COUPON_EXEC_URL || process.env.NEXT_PUBLIC_COUPON_EXEC_URL;

  if (!COUPON_EXEC_URL) {
    return new Response(
      JSON.stringify({ ok: false, error: 'COUPON_EXEC_URL not set' }),
      { status: 500, headers: { 'content-type': 'application/json', ...corsHeaders(origin) } }
    );
  }

  const url = new URL(req.url);
  const action = url.searchParams.get('action') || '';

  // Forward to Apps Script, preserving action & query
  let target = new URL(COUPON_EXEC_URL);
  for (const [k, v] of url.searchParams) target.searchParams.set(k, v);

  const init: RequestInit = { method: req.method, headers: { 'Content-Type': 'application/json' } };

  if (req.method === 'POST') {
    // Forward the raw body to Apps Script (it expects JSON in e.postData.contents)
    init.body = await req.text();
  }

  try {
    const upstream = await fetch(target.toString(), init);
    const text = await upstream.text(); // return upstream JSON as-is

    return new Response(text, {
      status: upstream.status,
      headers: { 'content-type': 'application/json', ...corsHeaders(origin) },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ ok: false, error: String(err?.message || err) }),
      { status: 502, headers: { 'content-type': 'application/json', ...corsHeaders(origin) } }
    );
  }
}
