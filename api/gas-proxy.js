// pages/api/gas-proxy.js
//
// A tiny server-side proxy to your Google Apps Script Web App, to avoid CORS issues.
// Required env var on Vercel: GAS_EXEC_URL = "https://script.google.com/macros/s/XXXX/exec"

export default async function handler(req, res) {
  const GAS = process.env.GAS_EXEC_URL;
  if (!GAS) {
    res.status(500).json({ ok: false, error: 'missing_gas_exec_url' });
    return;
  }

  // Allow your site & preflight
  res.setHeader('Access-Control-Allow-Origin', 'https://www.spongnsoap.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Rebuild GAS URL with original query (?action=...)
    const url = new URL(GAS);
    const incoming = req.query || {};
    Object.keys(incoming).forEach(k => url.searchParams.set(k, incoming[k]));

    // Forward body for POST
    const init = {
      method: req.method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (req.method === 'POST') {
      init.body = JSON.stringify(req.body || {});
    }

    const r = await fetch(url.toString(), init);
    const txt = await r.text();

    // Try JSON first; fallback to text
    try {
      const json = JSON.parse(txt);
      res.status(r.status).json(json);
    } catch {
      res.status(r.status).send(txt);
    }
  } catch (e) {
    console.error('gas-proxy error:', e);
    res.status(502).json({ ok: false, error: 'proxy_failed', message: String(e) });
  }
}
