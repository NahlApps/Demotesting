// pages/api/coupon-proxy.js
// Proxies requests to your Coupon GAS web app.
// Required env: COUPON_EXEC_URL = "https://script.google.com/macros/s/XXXX/exec"

export default async function handler(req, res) {
  // CORS: mirror the caller’s origin (demotesting.nahl.app, spongnsoap.com, localhost)
  const origin = req.headers.origin || '';
  const allow =
    /(?:^https?:\/\/(?:localhost:\d+|(?:.*\.)?nahl\.app|(?:.*\.)?spongnsoap\.com)$)/i.test(origin)
      ? origin
      : '*';
  res.setHeader('Access-Control-Allow-Origin', allow);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const GAS = process.env.COUPON_EXEC_URL;
  if (!GAS) {
    res.status(500).json({ ok: false, error: 'missing_coupon_exec_url' });
    return;
  }

  // quick self-test endpoint
  if (req.query.action === '__selftest') {
    res.status(200).json({ ok: true, proxy: 'coupon-proxy', env: !!GAS });
    return;
  }

  try {
    // Build target URL with original query (?action=...)
    const url = new URL(GAS);
    Object.entries(req.query || {}).forEach(([k, v]) => url.searchParams.set(k, v));

    const init = { method: req.method, headers: { 'Content-Type': 'application/json' } };
    if (req.method === 'POST') init.body = JSON.stringify(req.body || {});

    const r = await fetch(url.toString(), init);
    const text = await r.text();
    let json;
    try { json = JSON.parse(text); } catch {}

    if (!r.ok) {
      // Bubble up underlying error so you can see it in the browser/console
      const details = json || { body: text };
      res.status(r.status || 502).json({
        ok: false, proxy: 'coupon-proxy', upstream_status: r.status, details
      });
      return;
    }

    if (json) res.status(r.status).json(json);
    else res.status(r.status).send(text);
  } catch (e) {
    console.error('coupon-proxy error:', e);
    res.status(502).json({ ok: false, error: 'proxy_failed', message: String(e) });
  }
}
