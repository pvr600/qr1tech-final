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

  const byDay = {}, byDevice = {}, byCity = {}, byCampaign = {};
  for (const e of entries) {
    const d = (e.ts || "").slice(0,10);
    if (d) byDay[d] = (byDay[d] || 0) + 1;
    byDevice[e.device || "Unknown"] = (byDevice[e.device || "Unknown"] || 0) + 1;
    byCity[e.city || "Unknown"] = (byCity[e.city || "Unknown"] || 0) + 1;
    byCampaign[e.campaign || "Unlabeled"] = (byCampaign[e.campaign || "Unlabeled"] || 0) + 1;
  }

  const recent = entries.slice(0, 20);
  return new Response(JSON.stringify({ byDay, byDevice, byCity, byCampaign, recent }), {
    headers: { "content-type": "application/json", "cache-control": "no-store" }
  });
}
