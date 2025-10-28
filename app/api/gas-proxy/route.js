export const runtime = "node";
export const dynamic = "force-dynamic";

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "https://demotesting.nahl.app";
const GAS_EXEC_URL   = process.env.GAS_EXEC_URL;
const REVIEWS_TOKEN  = process.env.REVIEWS_TOKEN || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function GET(req) {
  try {
    const u = new URL(req.url);
    if (u.searchParams.get("health") !== "1") {
      return new Response(JSON.stringify({ ok:false, error:"not_found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type":"application/json" }
      });
    }
    if (!GAS_EXEC_URL) {
      return new Response(JSON.stringify({ ok:false, error:"missing_GAS_EXEC_URL" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type":"application/json" }
      });
    }
    const r = await fetch(GAS_EXEC_URL + (GAS_EXEC_URL.includes("?")?"&":"?") + "action=health");
    let text = await r.text(), body;
    try { body = JSON.parse(text); }
    catch { body = { ok:false, error:"gas_returned_non_json", raw:text?.slice(0,500)||"" }; }
    return new Response(JSON.stringify(body), { status:r.status, headers:{...corsHeaders,"Content-Type":"application/json"} });
  } catch (e) {
    return new Response(JSON.stringify({ ok:false, error:"proxy_failed", detail:String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type":"application/json" }
    });
  }
}

export async function POST(req) {
  try {
    if (!GAS_EXEC_URL) {
      return new Response(JSON.stringify({ ok:false, error:"missing_GAS_EXEC_URL" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type":"application/json" }
      });
    }
    const payload = await req.json();
    const params = new URLSearchParams();
    params.set("data", JSON.stringify(payload));
    if (REVIEWS_TOKEN) params.set("token", REVIEWS_TOKEN);
    params.set("action", "review.save");

    const r = await fetch(GAS_EXEC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
      body: params.toString()
    });

    let text = await r.text(), body;
    try { body = JSON.parse(text); }
    catch { body = { ok:false, error:"gas_returned_non_json", raw:text?.slice(0,1000)||"" }; }

    return new Response(JSON.stringify(body), { status:r.status, headers:{...corsHeaders,"Content-Type":"application/json"} });
  } catch (e) {
    return new Response(JSON.stringify({ ok:false, error:"proxy_failed", detail:String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type":"application/json" }
    });
  }
}
