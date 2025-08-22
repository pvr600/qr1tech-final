import { getStore } from "@netlify/blobs";

export default async (req) => {
  const url = new URL(req.url);
  const campaign = url.searchParams.get("campaign") || "Unlabeled";
  const desc = url.searchParams.get("desc") || "";

  let geo = {};
  try { geo = JSON.parse(req.headers.get("x-nf-geo") || "{}"); } catch {}

  const ua = (req.headers.get("user-agent") || "").toLowerCase();
  const device =
    /ipad|tablet/.test(ua) ? "Tablet" :
    /mobile|android|iphone/.test(ua) ? "Mobile" : "Desktop";

  const rec = {
    ts: new Date().toISOString(),
    city: geo.city || "Unknown",
    country: (geo.country && (geo.country.code || geo.country.name)) || "Unknown",
    lat: geo.latitude || null,
    lon: geo.longitude || null,
    device,
    campaign,
    desc
  };

  const store = getStore("qr1-scans");
  const day = rec.ts.slice(0,10);
  const rand = Math.random().toString(36).slice(2,8);
  const key = `events/${day}/${rec.ts}_${rand}.json`;

  await store.setJSON(key, rec);
  return new Response(JSON.stringify({ ok: true }), {
    headers: { "content-type": "application/json" }
  });
}
