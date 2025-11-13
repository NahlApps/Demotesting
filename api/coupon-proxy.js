// api/coupon-proxy.js
// Env: COUPON_EXEC_URL="https://script.google.com/macros/s/XXXX/exec"

module.exports = async function (req, res) {
  // CORS: allow your domains (localhost, *.nahl.app, spongnsoap.com)
  const origin = req.headers.origin || '';
  const allow = /^(https?:\/\/localhost:\d+|https?:\/\/.*\.?nahl\.app|https?:\/\/.*\.?spongnsoap\.com)$/i
    .test(origin) ? origin : '*';
  res.setHeader('Access-Control-Allow-Origin', allow);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const GAS = process.env.COUPON_EXEC_URL;
  if (!GAS) { res.status(500).json({ ok:false, error:'missing_coupon_exec_url' }); return; }

  if (req.query.action === '__selftest') {
    res.status(200).json({ ok:true, proxy:'coupon-proxy', env:Boolean(GAS) });
    return;
  }

  try {
    const url = new URL(GAS);
    Object.entries(req.query || {}).forEach(([k, v]) => url.searchParams.set(k, v));

    const init = { method: req.method, headers: { 'Content-Type': 'application/json' } };
    if (req.method === 'POST') init.body = JSON.stringify(req.body || {});

    const r = await fetch(url.toString(), init);
    const txt = await r.text();
    let json; try { json = JSON.parse(txt); } catch {}

    if (!r.ok) {
      res.status(r.status || 502).json({ ok:false, upstream_status:r.status, details: json || { body: txt } });
      return;
    }
    if (json) res.status(r.status).json(json); else res.status(r.status).send(txt);
  } catch (e) {
    console.error('coupon-proxy error:', e);
    res.status(502).json({ ok:false, error:'proxy_failed', message:String(e) });
  }
};
