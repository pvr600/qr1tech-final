import { getStore } from "@netlify/blobs";

// Try Netlify's built-in geo first
async function geoFromHeaders(req) {
  try {
    const raw = req.headers.get("x-nf-geo");
    if (raw) {
      const g = JSON.parse(raw);
      if (g && (g.city || g.country || g.latitude)) {
        return {
          city: g.city || null,
          country: g.country?.name || g.country || null,
          lat: g.latitude ?? null,
          lon: g.longitude ?? null,
        };
      }
    }
  } catch {}
  return null;
}

// Fallback: look up city by IP once per request
async function geoFromIp(req) {
  const ip =
    req.headers.get("x-nf-client-connection-ip") ||
    (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
    req.headers.get("client-ip");
  if (!ip) return null;
  try {
    const r = await fetch(`https://ipapi.co/${ip}/json/`, { cache: "no-store" });
    if (!r.ok) return null;
    const j = await r.json();
    return {
      city: j.city || null,
      country: j.country_name || j.country || null,
      lat: j.latitude ?? j.lat ?? null,
      lon: j.longitude ?? j.lon ?? null,
    };
  } catch {}
  return null;
}

export default async (req) => {
  const url = new URL(req.url);
  const campaign = url.searchParams.get("campaign") || "Unlabeled";
  const desc = url.searchParams.get("desc") || "";

  const ua = (req.headers.get("user-agent") || "").toLowerCase();
  const device =
    /ipad|tablet/.test(ua) ? "Tablet" :
    /mobile|android|iphone/.test(ua) ? "Mobile" : "Desktop";

  // Geo: Netlify header → IP lookup → unknown
  let geo = (await geoFromHeaders(req)) || (await geoFromIp(req)) || {};

  const rec = {
    ts: new Date().toISOString(),
    city: geo.city || "Unknown",
    country: geo.country || "Unknown",
    lat: geo.lat ?? null,
    lon: geo.lon ?? null,
    device,
    campaign,
    desc,
  };

  const store = getStore("qr1-scans");
  const day = rec.ts.slice(0, 10);
  const rand = Math.random().toString(36).slice(2, 8);
  const key = `events/${day}/${rec.ts}_${rand}.json`;

  await store.setJSON(key, rec);

  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
      "access-control-allow-origin": "*",
    },
  });
};
