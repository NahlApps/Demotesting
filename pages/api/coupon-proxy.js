// pages/api/coupon-proxy.js
// Proxy to your Google Apps Script Web App (Coupons) to avoid CORS.
// Required env var: COUPON_EXEC_URL="https://script.google.com/macros/s/XXXX/exec"

export default async function handler(req, res) {
  const GAS = process.env.COUPON_EXEC_URL;
  if (!GAS) {
    res.status(500).json({ ok: false, error: 'missing_coupon_exec_url' });
    return;
  }

  // --- CORS: prod + previews + localhost ---
  const origin = req.headers.origin || '';
  const allowedOrigins = [
    'https://www.spongnsoap.com',
    /\.vercel\.app$/,
    /^http:\/\/localhost:\d+$/,
  ];
  const isAllowed = allowedOrigins.some(rule =>
    rule instanceof RegExp ? rule.test(origin) : rule === origin
  );
  if (isAllowed) res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Build target URL with incoming query (?action=...)
    const url = new URL(GAS);
    const incoming = req.query || {};
    Object.keys(incoming).forEach(k => url.searchParams.set(k, incoming[k]));

    // Forward request
    const init = { method: req.method, headers: {} };
    const contentType =
      (req.headers['content-type'] && String(req.headers['content-type'])) ||
      'application/json';

    if (req.method === 'POST') {
      init.headers['Content-Type'] = contentType;
      init.body =
        contentType.includes('application/json')
          ? JSON.stringify(req.body || {})
          : (typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {}));
    }

    const r = await fetch(url.toString(), init);
    const txt = await r.text();

    try { res.status(r.status).json(JSON.parse(txt)); }
    catch { res.status(r.status).send(txt); }
  } catch (e) {
    console.error('coupon-proxy error:', e);
    res.status(502).json({ ok: false, error: 'proxy_failed', message: String(e) });
  }
}
