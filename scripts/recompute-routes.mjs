// Recomputes road distance + duration from Tiger Circle, Manipal to every place
// with coordinates, using the public OSRM demo server. Writes research/raw/routes.json.
import fs from 'node:fs';
const ORIGIN = [74.7873, 13.3524]; // lng, lat (OSM Nominatim: Tiger Circle, Manipal)
const regions = ['udupi-manipal','kundapura-byndoor','mangaluru-kasaragod','dharmasthala-kukke','malnad','uttara-kannada-goa'];
const out = {};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
for (const r of regions) {
  for (const p of JSON.parse(fs.readFileSync(`research/raw/${r}.json`, 'utf8'))) {
    if (p.lat == null || p.lng == null) continue;
    const url = `https://router.project-osrm.org/route/v1/driving/${ORIGIN[0]},${ORIGIN[1]};${p.lng},${p.lat}?overview=false`;
    try {
      const j = await (await fetch(url)).json();
      if (j.code === 'Ok') out[p.id] = { km: j.routes[0].distance / 1000, min: j.routes[0].duration / 60, url };
    } catch (e) { console.error(p.id, e.message); }
    await sleep(400);
  }
}
fs.writeFileSync('research/raw/routes.json', JSON.stringify(out, null, 2));
console.log(Object.keys(out).length, 'routes');
