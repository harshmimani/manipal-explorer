// Builds src/data/tripIdeas.json from research/raw/trips.mjs + src/data/places.json.
// For bike trips it routes Manipal → stops → Manipal through OSRM to get total road km.
// Run: node scripts/build-trips.mjs
import fs from 'node:fs';
import trips from '../research/raw/trips.mjs';

const places = JSON.parse(fs.readFileSync('src/data/places.json', 'utf8'));
const byId = Object.fromEntries(places.map((p) => [p.id, p]));
const food = JSON.parse(fs.readFileSync('src/data/food.json', 'utf8'));
const eateries = [...food.places, ...food.annadana];
const MANIPAL = { lat: 13.3524, lng: 74.7873 };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const out = [];
for (const t of trips) {
  for (const s of t.stops) if (s.placeId && !byId[s.placeId]) throw new Error(`${t.id}: unknown placeId ${s.placeId}`);
  const tripPlaces = [...new Set(t.stops.filter((s) => s.placeId).map((s) => s.placeId))].map((id) => byId[id]);

  // Best season = months good for every place on the trip (intersection); fall back to union.
  const sets = tripPlaces.map((p) => new Set(p.bestMonths)).filter((s) => s.size);
  let months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].filter((m) => sets.every((s) => s.has(m)));
  if (!months.length) months = [...new Set(sets.flatMap((s) => [...s]))].sort((a, b) => a - b);

  let roadKm = null, routeUrl = null;
  if (t.transport === 'bike') {
    const pts = [MANIPAL, ...tripPlaces.filter((p) => p.lat != null), MANIPAL];
    const coords = pts.map((p) => `${p.lng},${p.lat}`).join(';');
    try {
      routeUrl = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=false`;
      const j = await (await fetch(routeUrl)).json();
      if (j.code === 'Ok') roadKm = Math.round(j.routes[0].distance / 1000 / 10) * 10;
    } catch (e) { console.error(t.id, e.message); }
    await sleep(500);
  }

  // Sources (Part 6 review): every fact in a trip comes from its places, the
  // eateries and temple meals it names (food.json), its own list, and the route.
  const text = JSON.stringify([t.stops, t.vegMealStops, t.extraSafety, t.packThis]).toLowerCase();
  const key = (e) => String(e.name ?? e.temple ?? e.place ?? '').toLowerCase().split(/[,(]/)[0].replace(/^(hotel|sri|shri)\s+/, '').trim();
  const named = eateries.filter((e) => key(e).length > 3 && text.includes(key(e)));
  const sources = [...new Set([...(t.sources ?? []), ...tripPlaces.flatMap((p) => p.sources ?? []), ...named.flatMap((e) => e.sources ?? []), ...(routeUrl ? [routeUrl] : [])])];

  // Trip-level safety only; each place's own safety note lives on the place.
  const safety = t.extraSafety ?? null;
  out.push({
    id: t.id,
    title: t.title,
    hook: t.hook,
    duration: t.duration,
    days: t.days,
    transport: t.transport,
    difficulty: t.difficulty,
    route: ['Manipal', ...t.stops.map((s) => (s.placeId ? byId[s.placeId].name : s.name)).filter((n, i, a) => n !== a[i - 1]), ...(t.transport === 'bike' ? ['Manipal'] : [])].join(' → '),
    roadKmRoundTrip: roadKm,
    stops: t.stops.map((s) => ({ placeId: s.placeId, name: s.placeId ? byId[s.placeId].name : s.name, day: s.day, time: s.time, note: s.note })),
    vegMealStops: t.vegMealStops,
    bestMonths: months,
    bestSeason: `Best when every stop is in season: ${months.map((m) => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m - 1]).join(', ')}. See each place's season note.`,
    packThis: t.packThis,
    safety,
    placeIds: tripPlaces.map((p) => p.id),
    sources,
  });
}
fs.writeFileSync('src/data/tripIdeas.json', JSON.stringify(out, null, 2) + '\n');
for (const t of out) console.log(t.id.padEnd(34), t.days, t.transport.padEnd(6), String(t.roadKmRoundTrip).padEnd(5), t.bestMonths.join(','));
