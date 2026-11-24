// Merges the raw research in research/raw/ into the site data in src/data/.
// Run: node scripts/build-data.mjs   (after scripts/recompute-routes.mjs)
import fs from 'node:fs';

const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const write = (p, d) => fs.writeFileSync(p, JSON.stringify(d, null, 2) + '\n');

const REGIONS = ['udupi-manipal', 'kundapura-byndoor', 'mangaluru-kasaragod', 'dharmasthala-kukke', 'malnad', 'uttara-kannada-goa'];
const KEYS = ['id', 'name', 'chapter', 'tags', 'hook', 'why', 'lat', 'lng', 'distanceKmFromManipal', 'rideTimeFromManipal', 'transport', 'tripType', 'bestTime', 'decJanVerdict', 'decJanNote', 'vegFoodNearby', 'temple', 'trek', 'bikeTips', 'safety', 'mustDo', 'images', 'sources', 'confidence', 'lastChecked'];

// The 10 must-dos for 28 Nov 2026 – 31 Jan 2027 (rationale in research/report.md).
const MUST_DO = new Set([
  'udupi-sri-krishna-matha',
  'st-marys-island',
  'kollur-mookambika-temple',
  'dharmasthala-manjunatha-temple',
  'sringeri-sharada-peetham',
  'agumbe-sunset-point-and-ghat',
  'kudremukh-peak-trek',
  'gokarna-beach-trail',
  'dudhsagar-falls-overnight',
  'bekal-fort',
]);

// Some route endpoints differ from the place pin (islands: route to the jetty).
const ROUTE_ALIAS = { 'st-marys-island': 'malpe-beach-sea-walk' };

const routes = read('research/raw/routes.json');
const food = read('research/raw/food.json');

const fmtTime = (min) => {
  const m = Math.max(5, Math.round(min / 5) * 5);
  const h = Math.floor(m / 60);
  const r = m % 60;
  return h ? `${h}h ${String(r).padStart(2, '0')}m` : `${r}m`;
};
const normaliseTime = (s) => {
  if (!s) return s;
  const h = /(\d+)\s*h/.exec(s);
  const m = /(\d+)\s*m/.exec(s);
  return fmtTime((h ? +h[1] * 60 : 0) + (m ? +m[1] : 0));
};
const km = (a, b) => {
  const R = 6371, toR = (x) => (x * Math.PI) / 180;
  const dLat = toR(b.lat - a.lat), dLng = toR(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toR(a.lat)) * Math.cos(toR(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

const eateries = food.places.filter((e) => e.pureVeg === true && e.lat != null && e.lng != null && e.operatingStatus !== 'closed');

const places = [];
const report = { retimed: 0, foodAdded: 0, missingKeys: [] };
for (const region of REGIONS) {
  for (const raw of read(`research/raw/${region}.json`)) {
    const p = {};
    for (const k of KEYS) p[k] = raw[k] ?? (Array.isArray(raw[k]) ? [] : raw[k] ?? null);
    const missing = KEYS.filter((k) => !(k in raw));
    if (missing.length) report.missingKeys.push(`${raw.id}: ${missing.join(', ')}`);

    // Uniform ride time: OSRM car duration x 1.2 motorcycle buffer, rounded to 5 min.
    // OSRM's demo server assumes ~65–80 km/h car speeds, unrealistic here, so ride time is
    // the longer of (OSRM x 1.2) and (distance / 40 km/h). Dudhsagar keeps the agent's
    // distance to the Collem jeep base, where the bike stops.
    const r = routes[ROUTE_ALIAS[p.id] ?? p.id];
    if (r) {
      const keep = ROUTE_ALIAS[p.id] != null || p.id === 'dudhsagar-falls-overnight';
      if (!keep) p.distanceKmFromManipal = Math.round(r.km);
      const dist = keep && p.id !== 'st-marys-island' ? p.distanceKmFromManipal : r.km;
      p.rideTimeFromManipal = fmtTime(Math.max(r.min * 1.2, (dist / 40) * 60));
      if (!p.sources.includes(r.url)) p.sources.push(r.url);
      report.retimed++;
    } else {
      p.rideTimeFromManipal = normaliseTime(p.rideTimeFromManipal);
    }

    // Pure-veg eateries from the food research within 6 km, with their source.
    if (p.lat != null && p.lng != null) {
      for (const e of eateries) {
        const d = km(p, e);
        if (d > 6) continue;
        if (p.vegFoodNearby.some((s) => s.toLowerCase().includes(e.name.toLowerCase()))) continue;
        p.vegFoodNearby.push(`${e.name} (pure veg, ~${d < 1 ? '<1' : Math.round(d)} km): ${e.order}${e.operatingStatus === 'verify locally' ? ' Opening status: verify locally.' : ''}`);
        if (e.sources?.[0] && !p.sources.includes(e.sources[0])) p.sources.push(e.sources[0]);
        report.foodAdded++;
      }
    }

    p.mustDo = MUST_DO.has(p.id);
    p.images = [];
    p.lastChecked = '2026-11';
    places.push(p);
  }
}

const ids = new Set(places.map((p) => p.id));
for (const id of MUST_DO) if (!ids.has(id)) throw new Error(`mustDo id not found: ${id}`);

// Festivals: point placeId at a real place, else null (venue stays in `place`).
const FEST_ALIAS = { 'saligrama-guru-narasimha-temple': 'saligrama-guru-narasimha', 'venur-kambala': 'venur-bahubali', 'moodbidri-kambala': 'moodbidri-saavira-kambada-basadi' };
const festivals = read('research/raw/festivals.json').map((f) => {
  const id = FEST_ALIAS[f.placeId] ?? f.placeId;
  return { ...f, placeId: ids.has(id) ? id : null };
});

write('src/data/places.json', places);
write('src/data/food.json', food);
write('src/data/festivals.json', festivals);
console.log(JSON.stringify({ places: places.length, mustDo: places.filter((p) => p.mustDo).length, ...report, festivals: festivals.length }, null, 2));
