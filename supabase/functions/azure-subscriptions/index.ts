import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
async function getToken(scope = "https://management.azure.com/.default"): Promise<string> {
  const t = Deno.env.get("AZURE_TENANT_ID")!, c = Deno.env.get("AZURE_CLIENT_ID")!, s = Deno.env.get("AZURE_CLIENT_SECRET")!;
  const r = await fetch(`https://login.microsoftonline.com/${t}/oauth2/v2.0/token`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ grant_type: "client_credentials", client_id: c, client_secret: s, scope }) });
  const j = await r.json(); if (!r.ok) throw { error: true, userMessage: `Azure auth failed: ${j.error_description}` };
  return j.access_token;
}
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const token = await getToken();
    const r = await fetch("https://management.azure.com/subscriptions?api-version=2022-12-01", { headers: { Authorization: `Bearer ${token}` } });
    const j = await r.json(); if (!r.ok) throw { error: true, userMessage: j.error?.message || "Failed to list subscriptions" };
    const subscriptions = (j.value || []).map((s: any) => ({ subscriptionId: s.subscriptionId, displayName: s.displayName, state: s.state, tenantId: s.tenantId }));
    return new Response(JSON.stringify({ subscriptions, count: subscriptions.length, timestamp: new Date().toISOString() }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: true, userMessage: err.userMessage || err.message }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
