# Uttara Kannada + Goa (Dudhsagar): research notes

Region slug: `uttara-kannada-goa`. 18 entries in `uttara-kannada-goa.json`.
Last checked: 2026-11. Distances are OSRM from Tiger Circle, Manipal. Times are OSRM × 1.2.

Research stopped early because the shared web-search budget for the session ran out (200 calls). Gaps caused by that are marked "verify locally" below. They are mostly veg eateries and some fees.

## Places added beyond the list, and why
1. **Kasarkod Eco Beach & Sharavathi Kandla mangrove boardwalk** (`kasarkod-eco-beach`). Karnataka Tourism lists it as a Blue Flag certified beach, with the mangrove boardwalk across the road. It sits on the same NH66 stretch as Idagunji and Apsarakonda, about 2h from Manipal. That makes Apsarakonda, which is thin in Dec–Jan, worth the ride: the three make one coastal day.
2. **Basavaraj Durga Island Fort** (`basavaraj-durga-island`). This is a real Keladi-era island fort (Wikipedia, Karnataka Tourism Honnavar guide). Access is uncertain: one listing says landing is only allowed at Sankranti with permission. I marked it `verify-locally` so the lead can decide whether to keep it.
- Not added: Kumta/Vanalli beach. I geocoded it (Nominatim: Kumta Beach, Vannalli) but couldn't open any source about it before the search budget ran out.

## Fields set to null or "verify locally"
- **vegFoodNearby is empty** for Idagunji, Karwar, Devbagh, Mirjan, Apsarakonda, Yana, Sathodi, Magod, Vibhuti, Dandeli, Sirsi, Dudhsagar, Kasarkod and Basavaraj Durga. I found no opened source confirming a pure-veg eatery for any of them. Only the temple meals are sourced: Murudeshwar anna prasada, and Gokarna Amrutanna bhojana (official trust site, 12–2 PM and 7:30–8:30 PM).
- **Dandeli veg-friendly stays:** not verified. The safety text says "verify locally".
- **Sirsi Marikamba:** `temple.dressCode` is null. `annadana` reads "Not confirmed online — verify locally". Darshan timings (7 AM–9 PM) come from one source (Bhakti Bharat).
- **Idagunji:** a daily annadana meal is not confirmed. A donor-sponsored Shashwatha Annadana seva exists. The evening start conflicts between sources (3 PM vs 4 PM).
- **Murudeshwar:** the annadana start time is not published. Karnataka Tourism says "afternoon, subject to availability".
- **Dudhsagar:**
  - The official booking portal URL is not confirmed. The GTDC portal is named in news reports, but I couldn't confirm the official URL. Reported third-party sites exist, so the entry warns not to pay unverified sites.
  - The 2026–27 jeep fee is not confirmed. The only figure is about ₹500 per passenger, from Outlook Traveller in 2023, and it is marked as dated.
  - The location of the jeep counter relative to Kulem station is not documented.
  - `guideMandatory` is null.
- **Om Beach drowning record:** I found no dated drowning report specific to Om. Documented incidents are nearby: Kudle/Jatayu Teertha in April 2025 (2 MBBS students dead, Deccan Chronicle), plus Holidify's warning about drownings at Half Moon.
- **Paradise / Half Moon access:** I found no closure or restriction order. Karnataka Tourism says to avoid swimming at Paradise (sharp rocks and undercurrents).
- **Fees that conflict between sources:** Yana (₹20–50, Karnataka Tourism; blogs say ₹5–20), Vibhuti (~₹10, 2020 blog), Sathodi (₹5, Trawell), Magod (no official fee), Apsarakonda (free vs ₹10), INS Chapal museum (₹15–50), Mirjan hours (9–5 per Karnataka Tourism vs 8–6 elsewhere).
- **Train approaches:** Idagunji (whether Honnavar or Murdeshwar station is closer), Kasarkod and Basavaraj Durga onward distances are not verified. Sathodi, Magod, Dandeli, Sirsi and Vibhuti are set to `train.available: false`, because the nearest railhead is Hubballi.
- **Waterfall flow in Dec–Jan:**
  - Sathodi and Dudhsagar: flow volume is not documented online.
  - Apsarakonda: blogs doubt it lasts into January.
  - Magod: Karnataka Tourism's best window is July–December.

## Closures, bans and season issues found
- **Dudhsagar railway tracks: walking is prohibited.**
  - South Western Railway bars public access to the falls via the railway route.
  - RPF Hubballi Division (Castle Rock post) fined 32 tourists ₹500 each under Section 147 of the Railways Act. The Goan reported this on 7 July 2026.
  - A South Goa Collector order under the Disaster Management Act (July 2023) bans entry on foot along the track or by train, and has RPF stop people getting off near Dudhsagar.
- **Dudhsagar jeep safari 2026–27: running.**
  - The forest department order reopened the circuit in early October 2026 (Curly Tales, 5 Oct 2026). The exact day isn't given.
  - Gate hours are 8 AM–3 PM, in batches of 30–40 per hour, with a cap of 240 trips a day and 7 adults per jeep.
  - Only Forest Dept-registered vehicles may enter. Two-wheelers and private cars are banned inside the circuit.
  - Life jackets are mandatory. Plastic and alcohol are not allowed.
  - Trips can be suspended on orange or red weather alerts.
  - There was a GTDC vs jeep-operators dispute over online booking in 2023–24. The current booking channel should be confirmed.
- **Murudeshwar beach:** closed after 4 schoolgirls drowned on 10 Dec 2024. It reopened around 26 Dec 2024 with shoreline safety ropes.
- **Murudeshwar temple dress code:** notified in June 2025. No western wear (jeans, shorts, T-shirts, skirts) in the inner areas.
- **Gokarna Mahabaleshwar dress code:** set in October 2018. Men wear a dhoti only, with no shirt, T-shirt or vest. Women wear a saree or salwar suit.
- **Netrani:**
  - Landing on the island is prohibited. Karnataka Tourism calls it a "restricted naval area". Older reports say coastal police permission is needed.
  - The diving season is November–May per Karnataka Tourism. Reports say district rules allow October–April.
  - No 2026-specific operator list was found. Karnataka Tourism's indicative prices are ₹3,500–4,500 for diving and ₹1,500–2,000 for snorkelling. I left these out of the JSON fields and only cite them here.
- **Dandeli long rafting:** the licence is under Forest Dept challenge. The CCF asked the Karwar DC to cancel it, and as of 13 Jan 2026 it was still running (Green Minute). The long run may be unavailable, so check before riding 5 hours.
- **Sathodi:** the Forest Dept restricted entry in June 2025 when the Kali rose. I found no source on whether that restriction was lifted. Treat it as post-monsoon-only, and verify locally.
- **Sirsi Marikamba Jatre:** it is biennial. The last one ran 24 Feb–4 Mar 2026 (Wikipedia, citing Udayavani), and the next is due in 2028. **There is no jatre in 2027, and none in the Dec 2026–Jan 2027 window.**
- **Yana:** footwear comes off at the base counter before the cave passage. A plastic deposit system is in force. Wikipedia says GSI declared it a National Geological Monument in 2026 (single source).

## Must-do nominations for Dec–Jan
1. **Dudhsagar overnight by Konkan Railway.** The season is confirmed open. The night train works well: the 00:22 Netravati gets to Madgaon at 04:35, the 08:10 passenger reaches Kulem by 09:15, and the 22:42 Netravati brings you back to Udupi at 03:00. Being legally strict here protects you from the track-walking trap.
2. **Gokarna temple + beach trail (overnight).** You get shirtless darshan at the Atmalinga, free Amrutanna bhojana twice a day, and a four-cove cliff walk. The temple is officially sourced and Dec–Jan is the best weather for it.
3. **Yana Rocks.** The trail is dry in Dec–Jan, it is newly a GSI geo-monument, it's officially sourced (Karnataka Tourism), and it does not depend on waterfall flow.
