import { getStore } from "@netlify/blobs";

function toCsv(rows) {
  const header = "timestamp,city,device,campaign\n";
  const body = rows.map(r => [
    r.ts,
    (r.city || "").replaceAll(",", " "),
    (r.device || ""),
    (r.campaign || "")
  ].join(",")).join("\n");
  return header + body + "\n";
}

export default async () => {
  const store = getStore("qr1-scans");
  const listing = await store.list({ prefix: "events/" });
  const blobs = listing.blobs || [];

  const rows = [];
  for (const b of blobs) {
    try {
      const data = await store.get(b.key, { type: "json" });
      if (data && data.ts) rows.push(data);
    } catch {}
  }
  rows.sort((a, b) => (a.ts || "").localeCompare(b.ts || ""));

  const csv = toCsv(rows);
  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": "attachment; filename=\"qr1_scans.csv\"",
      "cache-control": "no-store"
    }
  });
}
