import { getStore } from "@netlify/blobs";
export default async () => {
  const store = getStore("qr1-scans");
  const { blobs=[] } = await store.list({ prefix: "events/" });
  const rows = [];
  for (const b of blobs) { try { const j = await store.get(b.key, { type: "json" }); if (j?.ts) rows.push(j);} catch {} }
  rows.sort((a,b)=>(b.ts||"").localeCompare(a.ts||""));
  const byHour={},byDay={},byCity={},byCampaign={},byDevice={};
  for (const r of rows) {
    const t = new Date(r.ts); const h = isNaN(t)?null:t.getHours(); if(h!==null) byHour[h]=(byHour[h]||0)+1;
    const d=(r.ts||"").slice(0,10); if(d) byDay[d]=(byDay[d]||0)+1;
    byCity[r.city||"Unknown"]=(byCity[r.city||"Unknown"]||0)+1;
    byCampaign[r.campaign||"Unlabeled"]=(byCampaign[r.campaign||"Unlabeled"]||0)+1;
    byDevice[r.device||"Unknown"]=(byDevice[r.device||"Unknown"]||0)+1;
  }
  const bestHour = Object.entries(byHour).sort((a,b)=>b[1]-a[1])[0]||null;
  const topCity = Object.entries(byCity).sort((a,b)=>b[1]-a[1])[0]||null;
  return new Response(JSON.stringify({ byHour, byDay, byCity, byCampaign, byDevice, bestHour, topCity }), { headers: { "content-type":"application/json","access-control-allow-origin":"*","cache-control":"no-store" }});
};
