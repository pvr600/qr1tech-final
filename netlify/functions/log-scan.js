import { getStore } from "@netlify/blobs";
export default async (req) => {
  const url = new URL(req.url);
  const campaign = url.searchParams.get("campaign") || "Unlabeled";
  const desc = url.searchParams.get("desc") || "";
  const to = url.searchParams.get("to");
  const ua = (req.headers.get("user-agent") || "").toLowerCase();
  const device = /ipad|tablet/.test(ua) ? "Tablet" : /mobile|android|iphone/.test(ua) ? "Mobile" : "Desktop";
  const rec = { ts:new Date().toISOString(), city:"Unknown", country:"Unknown", lat:null, lon:null, device, campaign, desc };
  const store = getStore("qr1-scans");
  const day = rec.ts.slice(0,10);
  const rand = Math.random().toString(36).slice(2,8);
  await store.setJSON(`events/${day}/${rec.ts}_${rand}.json`, rec);
  const headers = { "access-control-allow-origin": "*", "cache-control": "no-store" };
  if (to) return new Response(null, { status: 302, headers: { ...headers, location: to } });
  return new Response(JSON.stringify({ ok:true }), { headers: { ...headers, "content-type": "application/json" } });
};
