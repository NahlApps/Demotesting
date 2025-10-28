// app/api/gas-proxy/route.js
export const runtime = "node";
export const dynamic = "force-dynamic";

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "https://demotesting.nahl.app";
const GAS_EXEC_URL   = process.env.GAS_EXEC_URL;          // e.g. https://script.google.com/macros/s/AKfy.../exec
const REVIEWS_TOKEN  = process.env.REVIEWS_TOKEN || "";   // must match GAS (optional)

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

// Health: GET /api/gas-proxy?health=1 → ينادي GAS ?action=health
export async function GET(request) {
  try {
    const urlObj = new URL(request.url);
    if (urlObj.searchParams.get("health") !== "1") {
      return new Response(JSON.stringify({ ok:false, error:"not_found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type":"application/json" }
      });
    }
    if (!GAS_EXEC_URL) {
      return new Response(JSON.stringify({ ok:false, error:"missing_GAS_EXEC_URL" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type":"application/json" }
      });
    }
    const pingUrl = GAS_EXEC_URL + (GAS_EXEC_URL.includes("?") ? "&" : "?") + "action=health";
    const r = await fetch(pingUrl, { method: "GET" });
    const text = await r.text();
    return new Response(text, {
      status: r.status, headers: { ...corsHeaders, "Content-Type":"application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok:false, error:"proxy_failed", detail:String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type":"application/json" }
    });
  }
}

export async function POST(request) {
  try {
    if (!GAS_EXEC_URL) {
      return new Response(JSON.stringify({ ok:false, error:"missing_GAS_EXEC_URL" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type":"application/json" }
      });
    }

    const payload = await request.json();

    // Forward to GAS as x-www-form-urlencoded (avoids their preflight)
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

    // Pass-through (even لو ok:false) مع Content-Type json
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
