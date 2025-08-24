import { getStore } from "@netlify/blobs";

export default async () => {
  const store = getStore("qr1-scans");
  const listing = await store.list({ prefix: "events/" });
  const blobs = listing.blobs || [];

  const entries = [];
  for (const b of blobs) {
    try {
      const data = await store.get(b.key, { type: "json" });
      if (data && data.ts) entries.push(data);
    } catch {}
  }

  entries.sort((a, b) => (b.ts || "").localeCompare(a.ts || ""));

  const byHour = {}, byDay = {}, byCity = {}, byCampaign = {}, byDevice = {};
  for (const e of entries) {
    const t = new Date(e.ts);
    const h = isNaN(t) ? null : t.getHours();
    if (h !== null) byHour[h] = (byHour[h] || 0) + 1;
    const d = (e.ts || "").slice(0,10);
    if (d) byDay[d] = (byDay[d] || 0) + 1;
    byCity[e.city || "Unknown"] = (byCity[e.city || "Unknown"] || 0) + 1;
    byCampaign[e.campaign || "Unlabeled"] = (byCampaign[e.campaign || "Unlabeled"] || 0) + 1;
    byDevice[e.device || "Unknown"] = (byDevice[e.device || "Unknown"] || 0) + 1;
  }

  const bestHour = Object.entries(byHour).sort((a,b)=>b[1]-a[1])[0] || null;
  const topCity = Object.entries(byCity).sort((a,b)=>b[1]-a[1])[0] || null;

  return new Response(JSON.stringify({ byHour, byDay, byCity, byCampaign, byDevice, bestHour, topCity }), {
    headers: { "content-type": "application/json", "cache-control": "no-store" }
  });
}
