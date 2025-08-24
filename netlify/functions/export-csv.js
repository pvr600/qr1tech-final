import { getStore } from "@netlify/blobs";
export default async () => {
  const store = getStore("qr1-scans");
  const { blobs=[] } = await store.list({ prefix: "events/" });
  const rows=[]; for (const b of blobs){ try { const j = await store.get(b.key, { type:"json" }); if(j?.ts) rows.push(j);} catch{} }
  rows.sort((a,b)=>(a.ts||"").localeCompare(b.ts||""));
  const csv = "timestamp,city,device,campaign\n" + rows.map(r=>[r.ts,(r.city||"").replaceAll(","," "),r.device||"",r.campaign||""].join(",")).join("\n") + "\n";
  return new Response(csv, { headers: {"content-type":"text/csv; charset=utf-8","content-disposition":"attachment; filename=\"qr1_scans.csv\"","access-control-allow-origin":"*","cache-control":"no-store"} });
};
