/* gas-rpc-shim.js — tiny JSON-RPC client for Apps Script web app
 * Uses POST text/plain to avoid CORS preflight.
 */
window.GAS = {
  async run(method, ...args){
    if (!window.NAHL_API_BASE) throw new Error('NAHL_API_BASE not set');
    const body = JSON.stringify({ method, args });
    const res = await fetch(`${window.NAHL_API_BASE}?route=rpc`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' }, // simple CORS
      body
    });
    const json = await res.json().catch(()=>({ ok:false, error:'bad json' }));
    if (!json || !('ok' in json)) throw new Error('Invalid RPC response');
    return json;
  }
};
