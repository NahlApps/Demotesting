// app/api/gas-proxy/route.js
// Same-origin proxy → forwards to GAS Web App and returns JSON with proper CORS.
// Avoids browser CORS limitations by doing server-to-server to Google.
// Set environment variables in your hosting platform:
//
// GAS_EXEC_URL   = https://script.google.com/macros/s/AKfy.../exec
// REVIEWS_TOKEN  = your-long-random-token (must match GAS Script Property; optional)
// ALLOWED_ORIGIN = https://demotesting.nahl.app  (or your domain)

export const runtime = "node"; // or "edge" if preferred

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "https://demotesting.nahl.app";
const GAS_EXEC_URL   = process.env.GAS_EXEC_URL;
const REVIEWS_TOKEN  = process.env.REVIEWS_TOKEN || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(request) {
  try {
    if (!GAS_EXEC_URL) {
      return new Response(JSON.stringify({ ok:false, error:"missing_GAS_EXEC_URL" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type":"application/json" }
      });
    }

    const payload = await request.json();

    // Forward to GAS as x-www-form-urlencoded (no preflight on their side)
    const params = new URLSearchParams();
    params.set("data", JSON.stringify(payload));
    const url = GAS_EXEC_URL +
      (GAS_EXEC_URL.includes("?") ? "&" : "?") +
      "action=review.save" +
      (REVIEWS_TOKEN ? "&token=" + encodeURIComponent(REVIEWS_TOKEN) : "");

    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body: params.toString()
    });

    const text = await r.text();
    return new Response(text, {
      status: r.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok:false, error:"proxy_failed", detail:String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type":"application/json" }
    });
  }
}
