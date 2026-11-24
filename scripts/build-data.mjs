// Merges the raw research in research/raw/ into the site data in src/data/.
// Run: node scripts/build-data.mjs   (after scripts/recompute-routes.mjs)
import fs from 'node:fs';
import seasons from '../research/raw/seasons.mjs';
import overrides, { foodPatches } from '../research/raw/overrides.mjs';

const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const write = (p, d) => fs.writeFileSync(p, JSON.stringify(d, null, 2) + '\n');

const REGIONS = ['udupi-manipal', 'kundapura-byndoor', 'mangaluru-kasaragod', 'dharmasthala-kukke', 'malnad', 'uttara-kannada-goa'];
const KEYS = ['id', 'name', 'chapter', 'tags', 'hook', 'why', 'lat', 'lng', 'distanceKmFromManipal', 'rideTimeFromManipal', 'transport', 'tripType', 'bestTime', 'bestMonths', 'seasonNote', 'vegFoodNearby', 'temple', 'trek', 'bikeTips', 'safety', 'mustDo', 'images', 'sources', 'confidence', 'lastChecked'];

// The 10 must-dos for a first-timer (rationale in research/report.md).
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
// Image links come from scripts/fetch-images.mjs (hero first), so a data rebuild keeps them.
const imageCredits = fs.existsSync('src/data/image-credits.json') ? read('src/data/image-credits.json') : {};
const imagesFor = (id) => Object.values(imageCredits).filter((c) => c.placeId === id).sort((a, b) => a.order - b.order).map((c) => c.id);
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

// Hand-checked patches to food.json entries (verification fixes).
for (const [section, byId] of Object.entries(foodPatches)) {
  for (const [id, patch] of Object.entries(byId)) {
    const e = food[section].find((x) => x.id === id);
    if (!e) throw new Error(`foodPatches: no ${section}/${id}`);
    Object.assign(e, patch);
  }
}

const eateries = food.places.filter((e) => e.pureVeg === true && e.lat != null && e.lng != null && e.operatingStatus !== 'closed');

const places = [];
const report = { retimed: 0, foodAdded: 0, missingKeys: [] };
for (const region of REGIONS) {
  for (const raw of read(`research/raw/${region}.json`)) {
    const p = {};
    for (const k of KEYS) p[k] = raw[k] ?? (Array.isArray(raw[k]) ? [] : raw[k] ?? null);
    const missing = KEYS.filter((k) => !(k in raw) && !['bestMonths', 'seasonNote'].includes(k));
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
        p.vegFoodNearby.push(`${e.name} (pure veg, ~${d < 1 ? '<1' : Math.round(d)} km): ${e.order}${e.operatingStatus !== 'open' ? ` Opening status: ${e.operatingStatus}.` : ''}`);
        if (e.sources?.[0] && !p.sources.includes(e.sources[0])) p.sources.push(e.sources[0]);
        report.foodAdded++;
      }
    }

    const season = seasons[p.id];
    if (!season) throw new Error(`no season data for ${p.id}`);
    [p.bestMonths, p.seasonNote] = season;
    if (p.trek) delete p.trek.openDecJan; // superseded by bestMonths (evergreen guide)

    // Hand-checked patches (gap fills, evergreen rewording); objects merge one level deep.
    for (const [k, v] of Object.entries(overrides[p.id] ?? {})) {
      if (k === 'textFix') {
        // [['field.sub.0', 'old text', 'new text']]: exact substring replacement, must match.
        for (const [path, from, to] of v) {
          const keys = path.split('.');
          const obj = keys.slice(0, -1).reduce((o, key) => o[key], p);
          const last = keys.at(-1);
          if (typeof obj[last] !== 'string' || !obj[last].includes(from)) throw new Error(`textFix miss: ${p.id} ${path}`);
          obj[last] = obj[last].replace(from, to).replace(/s{2,}/g, ' ').trim();
        }
        continue;
      }
      if (k === 'addSources') { for (const u of v) if (!p.sources.includes(u)) p.sources.push(u); continue; }
      p[k] = v && typeof v === 'object' && !Array.isArray(v) && p[k] ? { ...p[k], ...v } : v;
    }

    p.mustDo = MUST_DO.has(p.id);
    p.images = imagesFor(p.id);
    p.lastChecked = '2026-11';
    places.push(p);
  }
}

const ids = new Set(places.map((p) => p.id));
for (const id of MUST_DO) if (!ids.has(id)) throw new Error(`mustDo id not found: ${id}`);

// Festivals (year-round) + Worth Watching: keep only placeIds that exist.
const fixId = (id) => (id && ids.has(id) ? id : null);
const festivals = read('research/raw/festivals-year.json').map((f) => ({ ...f, placeId: fixId(f.placeId) }));
const festIds = new Set(festivals.map((f) => f.id));
const worthWatching = read('research/raw/worthWatching.json').map((w) => ({
  ...w,
  placeIds: (w.placeIds ?? []).filter((id) => ids.has(id)),
  festivalIds: (w.festivalIds ?? []).filter((id) => festIds.has(id)),
}));
if (worthWatching.filter((w) => w.dontMiss).length !== 5) throw new Error('worthWatching needs exactly 5 dontMiss');

write('src/data/places.json', places);
write('src/data/food.json', food);
write('src/data/festivals.json', festivals);
write('src/data/worthWatching.json', worthWatching);
console.log(JSON.stringify({ places: places.length, mustDo: places.filter((p) => p.mustDo).length, ...report, festivals: festivals.length, worthWatching: worthWatching.length }, null, 2));
