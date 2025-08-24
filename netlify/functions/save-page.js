import { getStore } from "@netlify/blobs";
export default async (req) => {
  if (req.method !== "POST") return new Response(JSON.stringify({ error:"POST only" }), { status:405, headers:{ "content-type":"application/json", "access-control-allow-origin":"*" } });
  const body = await req.json().catch(()=>null);
  if (!body || !body.type || !body.data) return new Response(JSON.stringify({ error:"Invalid payload" }), { status:400, headers:{ "content-type":"application/json", "access-control-allow-origin":"*" } });
  const id = Math.random().toString(36).slice(2,10);
  const store = getStore("qr1-pages");
  await store.setJSON(`pages/${id}.json`, body);
  return new Response(JSON.stringify({ id }), { headers:{ "content-type":"application/json","access-control-allow-origin":"*","cache-control":"no-store" } });
};
