# kundapura-byndoor: research notes (checked 2026-11)

16 entries: the 13 requested + 3 additions. Confidence: 1 verified, 12 partial, 3 verify-locally.

## Research limits (read first)
- **WebSearch budget ran out partway through** (the 200-search cap is shared by all agents). After that, only pages already found could be fetched directly. Effects:
  - No sourced pure-veg restaurants for any place. `vegFoodNearby` lists only temple meals (Kollur, Anegudde, Hattiangadi, Kamalashile) and is `[]` elsewhere. **A follow-up pass is needed** for pure-veg hotels in Kundapura, Byndoor and Kollur.
  - The current 2026 status of Kodachadri (reopened or not after the May–June 2026 SOP closures) could not be confirmed.
- Several official sites were blocked or compromised:
  - kollurmookambikatemple.org sits behind a bot-check (403), so its facilities-page meal times come from the search-result quote only.
  - **kollurmookambika.org now serves gambling spam**: the domain looks hijacked. Do NOT link to it on the site.
  - Indiahikes (403) and the Aranya Vihaara portal could not be read directly.
- Nominatim and Overpass were heavily rate-limited (other agents share the IP). Missing coordinates are listed below.
- Karnataka Tourism's "Kodi Beach (Kundapura)" page and karnataka.com's Kodi Sea Walk page mix up Kundapura's Kodi beach with **Kodi Bengre** (Udupi, Suvarna river). I did not use them for Kodi facts. Kodi facts come from eNidhi (a Kundapura-based blogger) and Wikipedia (Gangolli/Panchagangavalli).
- Wikipedia's "Someshwar Beach" article is about Ullal (Mangaluru), not Byndoor. I did not use it.

## Places added beyond the list, and why
1. **Someshwara Beach (Paduvari, Byndoor)**: The Hindu (via inkl) describes a ₹15 crore upgrade and calls it one of the safer beaches on the coast (mild wave action, about 1 km between the Byndoor river mouth and Ottinene hillock). It sits directly below the Ottinene viewpoint, so the two make one evening.
2. **Gangolli & Panchagangavalli estuary**: the five-river mouth (Souparnika, Varahi, Kedaka, Chakra, Kubja) plus Portuguese/Keladi history (Wikipedia: Gangolli, Kundapura). It's the heritage counterpart to Kodi beach across the water. Single-source-ish, so partial. No food recommended because the harbour trade is fish.
3. **Anejhari Butterfly Camp (Jungle Lodges, near Kollur)**: official JLR page. It's the legal, organised overnight base inside Mookambika WLS for Kollur and Kodachadri, especially since camping on Kodachadri isn't allowed (see below). Coordinates and distance are null because the camp wasn't findable on OSM. Veg status of package meals not confirmed.
- Considered but **not added** (couldn't source them after the search cap): Kanchugodu beach (only a hotel listing on OSM), Kumbhashi Chandikeshwari temple, Kundapura Panchagangavalli river boating, Kannada Kudru island (one passing mention in eNidhi). Kamalashile's Suparshwa cave was folded into the Kamalashile entry rather than split.

## Fields set to null / "verify locally"
- **lat/lng null**: Arasinagundi Falls, Belkal Theertha, Anejhari camp. Distances for the two falls are to the approach point: Kollur for Arasinagundi, Mudoor trailhead for Belkal.
- **Approximate coordinates**:
  - Ottinene uses the Someshwara beach OSM node at the foot of the hillock; the viewpoint itself wasn't on OSM.
  - Koosalli uses Wikipedia's coordinates, which are 2.8 km from the nearest routable road.
  - Hidlumane uses the OSM trail way, 2 km from a road.
  - Kodachadri's distance and time are to Kollur, the jeep base.
  - Kamalashile uses Wikipedia's village coordinates.
- **Kollur temple**: darshan timings conflict between sources (Karnataka Tourism 5 AM–9 PM vs guides 5–1:30 / 3–9); dress code (shirt removal for men) not on an official page; anna prasada times (12 noon / 8 pm) from the temple facilities page via search quote only.
- **Anegudde**: timings conflict (5:30–8:30, 5:30–9, 7–8); dress code and annadana times unofficial.
- **Hattiangadi**: darshan timings and dress code not found; meal times not found.
- **Kamalashile**: timings from one 2022 blog; dress code not found; annadana times not found.
- **Trek fields**:
  - `openDecJan` is null for all treks, and `guideMandatory` is null for the falls.
  - Koosalli `permitRequired` is null.
  - All entry fees are blog-sourced and dated (2021–2026), so verify locally.
- **Kodi, Gangolli**: distance from Kundapura station not verified. No lifeguard info for any beach.
- **Anejhari**: distance and ride time are null.

## Closures, bans and season issues
- **Arasinagundi Falls: treat as CLOSED.**
  - A July 2024 DCF order barred entry to Arasinagundi (and Bandaje, Kudlu Theertha).
  - Udayavani says Udupi's restrictions began after an incident at Arashina Gundi.
  - triphippies (2026) says it is "permanently closed" after a 2023 death while filming.
  - Older guides still describe permits from the Kollur RFO office.
  - Verdict: skip. Confirm with the Kollur forest office.
- **Kodachadri.**
  - Trekking permits go by route (Hidlumane or Valur) on the Aranya Vihaara portal, with daily caps. Explurger (2026) says a certified guide is mandatory, one per 10 trekkers.
  - A 2026 roundup (trekentrip, citing TNIE and The News Minute) lists Kodachadri–Valur and Kodachadri–Hidlumane among trails temporarily closed in May 2026 pending wildlife-safety SOPs. SOP compliance was "still being checked" in June. **No reopening confirmed.**
  - Jeeps: privately hired in Kollur or Nittur (blog prices roughly ₹2,000 to ₹3,000 per jeep, plus a forest fee at the checkpost). They leave Nittur around 6 AM. Private bikes are reportedly banned on the summit track (eNidhi, 2021).
  - **Overnight at the peak: not confirmed as allowed.** One operator says camping has been banned since 2015, and blogs report no facilities at the top. An "Inspection Bungalow Kodachadri" exists on OSM, but there is no evidence it takes the public.
  - Recommend staying in Kollur, Nittur or Anejhari.
- **Hidlumane**: same 2026 route closure risk as above, since it's on the Kodachadri–Hidlumane route.
- **Koosalli**: eNidhi reports 4 deaths on this trek. No ban found.
- **Belkal Theertha**: forest fee (Rs 100 in 2021). Karnataka Tourism advises a local guide and warns of flash floods.
- **Beaches**: Maravanthe drowning (Udayavani, July 2019). No current swimming bans found for Dec–Jan, but none of these beaches has confirmed lifeguards.
- **Waterfall flow**: Koosalli, Belkal and Hidlumane are "good" in December and thin out through January. Arasinagundi is a skip.

## Must-do nominations for Dec–Jan
1. **Maravanthe Beach**: the coast's signature sea-road-river strip, under an hour from Manipal, perfect at Dec–Jan sunsets. It's the only entry here with fully verified core facts.
2. **Kollur Mookambika Temple**: the region's spiritual anchor, with free anna prasada, and the base for Kodachadri and the Ghats falls. Strong fit for the user.
3. **Ottinene viewpoint + Someshwara Beach** (one evening): a cliff deck over a river mouth plus one of the calmest beaches on the coast, stackable with Maravanthe on the same ride.
