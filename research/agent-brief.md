# Research agent brief (Part 1)

Project root: C:\Users\harsh\OneDrive\Desktop\manipal-explorer
Read CLAUDE.md in the project root first. Its hard rules are binding. The most important ones are below.

## Non-negotiables
- **No fabrication.** Every factual field (timings, distances, permits, prices, dates, operating status, veg status) must come from a web source you actually opened, and its URL must be listed in `sources`. If you can't verify something, set it to `null` and add the words "verify locally" in the relevant note field. Never guess. Never fill a field from memory alone.
- **Strict vegetarian.** Never recommend seafood, meat, egg or non-veg-focused restaurants. Only list pure-veg eateries in `vegFoodNearby` (temple bhojana halls, "pure veg" Udupi hotels, etc.), and only when a source shows they're veg. For dishes famous in non-veg form (ghee roast etc.), name only the veg/paneer/mushroom version and say so.
- **Copy voice** (`hook`, `why`, `decJanNote`, `bikeTips`): a well-travelled local friend. Specific, sensory, a bit witty, short sentences. BANNED words: "hidden gem", "paradise", "nestled", "breathtaking", "must-visit", "serene", "tranquil", "untouched", "offbeat", "picturesque". No lorem ipsum.
- **Safety first** in `safety`: ghat-road risks (hairpins, fog, buses, night riding), slippery waterfall rocks, rip currents and swimming bans on beaches, wildlife, forest closures, and anything prohibited.
- The user rides a motorcycle from Manipal and can take Konkan Railway trains from Udupi station. Season of travel: 28 Nov 2026 – 31 Jan 2027 (post-monsoon/winter). Many waterfalls thin out by Jan and some forest treks have seasonal rules, so judge `decJanVerdict` honestly.

## Distances (do this, don't guess)
Origin = Tiger Circle, Manipal: lat 13.3524, lng 74.7873 (OpenStreetMap Nominatim).
1. Get each place's coordinates from a source (OpenStreetMap Nominatim, Wikipedia, or an official page). Example: `curl -s -A "data-research-script/1.0" "https://nominatim.openstreetmap.org/search?q=Kollur+Mookambika+Temple&format=json&limit=3"` (max 1 request per second to Nominatim).
2. Road distance and time: `curl -s "https://router.project-osrm.org/route/v1/driving/74.7873,13.3524;<lng>,<lat>?overview=false"`. `distance` is in metres, `duration` in seconds.
3. `distanceKmFromManipal` = round(distance/1000). `rideTimeFromManipal` = OSRM duration × 1.2 (motorcycle buffer), rounded to 5 minutes, like "1h 40m". Add the Nominatim and OSRM URLs to `sources`.
4. For islands (St Mary's, Netrani) and trek peaks, route to the jetty or trailhead and say so in `bikeTips`.

## Schema (use EXACTLY these keys, in this order)
```json
{
  "id": "kebab-case",
  "name": "",
  "chapter": "coast | gods | ghats | heritage",
  "tags": [],
  "hook": "max 12 words",
  "why": "2–3 specific, vivid sentences",
  "lat": 0, "lng": 0,
  "distanceKmFromManipal": 0,
  "rideTimeFromManipal": "e.g. 1h 40m",
  "transport": { "bike": true, "train": { "available": false, "station": null, "notes": null } },
  "tripType": "quick | day | overnight | long-ride",
  "bestTime": "",
  "decJanVerdict": "great | good | ok | skip",
  "decJanNote": "",
  "vegFoodNearby": [],
  "temple": null,
  "trek": null,
  "bikeTips": "",
  "safety": "",
  "mustDo": false,
  "images": [],
  "sources": ["url", "url"],
  "confidence": "verified | partial | verify-locally",
  "lastChecked": "2026-11"
}
```
- `chapter`: coast = beaches, islands, backwaters, river kayaking. gods = temples and mathas. ghats = hills, falls, treks, ghat rides, wildlife. heritage = forts, Jain basadis, museums, crafts, towns, culture.
- `temple` for temples: `{ "dressCode": "", "darshanTimings": "", "annadana": "" }`. Unverified sub-fields: use `null` and put "verify locally" into another field's note. (Ints stay null; strings may say "Not confirmed online — verify locally".)
- `trek` for treks/peaks: `{ "difficulty": "easy|moderate|hard", "duration": "", "permitRequired": true|false|null, "howToBook": "", "guideMandatory": true|false|null, "openDecJan": true|false|null }`. Karnataka Forest Dept now runs online booking for many treks (Aranya Vihaara / "Karnataka Eco Trails" portal). Check what applies to each one.
- `transport.train`: only set `available: true` if a Konkan Railway (or other rail) station gives a sensible approach. Name the station and any onward connection in `notes`.
- `tripType`: quick (< 2h round trip plus visit), day, overnight, long-ride (very long rides like Coorg).
- `vegFoodNearby`: array of short strings like "Hotel X (pure veg, 2 km): try the goli baje". Only with a source.
- `mustDo`: always false. The lead picks the 10 must-dos.
- `images`: always []. Images come in a later part.
- `confidence`: verified = all key facts sourced from 2+ sources or an official source. partial = some fields null or single-source. verify-locally = core facts (open/closed status, access) unconfirmed.
- If a place combines several things (e.g. "Kemmannu hanging bridge & Hoode backwaters"), you may make one entry or split it into two. Split when they're genuinely different trips.

## Output
1. Write a JSON array of place objects to `research/raw/<your-region-slug>.json` (UTF-8, valid JSON, 2-space indent). Validate it with `node -e "JSON.parse(require('fs').readFileSync('<file>','utf8'))"`.
2. Write `research/raw/<your-region-slug>-notes.md` with: places you added beyond the list and why; every field you set to null / verify locally; any closures, bans or season issues found; and 1–3 candidates you'd nominate as must-dos for Dec–Jan, with reasons.
3. Do NOT touch any other files. Don't commit, don't use git.
4. Final reply: a short summary (count of places, count by confidence, notable issues). Don't paste the JSON.
