import { getStore } from "@netlify/blobs";
export default async (req) => {
  const id = new URL(req.url).searchParams.get("id");
  if(!id) return new Response("Missing id",{ status:400 });
  const store = getStore("qr1-pages");
  const rec = await store.get(`pages/${id}.json`, { type:"json" }).catch(()=>null);
  if(!rec) return new Response("Not found",{ status:404 });
  return new Response(`<h1>QR1 Page</h1><pre>${JSON.stringify(rec,null,2).replace(/[<>&]/g, s=>({"<":"&lt;",">":"&gt;","&":"&amp;"}[s]))}</pre>`, { headers:{ "content-type":"text/html; charset=utf-8","cache-control":"no-store" } });
};
