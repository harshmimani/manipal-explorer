# Part 1 Research Report

Manipal Explorer is an evergreen, vegetarian guide to Manipal, Udupi and the coast and ghats around them. This report covers the content data in `src/data/`. Raw research and per-region notes are in `research/raw/`.

## What's in the data

| File | Contents |
|---|---|
| `places.json` | **107 places**: 29 temples (gods), 22 coast, 31 hills/falls/treks (ghats), 25 heritage. 678 source URLs. |
| `tripIdeas.json` | **15 undated trips**: 11 by bike, 3 by train, 1 bike + train option inside Dudhsagar. Each has stops in order, veg meal stops, best months, a pack-this line and trip safety. |
| `festivals.json` | **40 year-round calendar entries** covering all 12 months; 23 carry sourced upcoming dates. |
| `worthWatching.json` | **15 cultural experiences**, 5 marked *Don't miss*. |
| `food.json` | **14 veg dishes, 16 eateries, 6 temple annadana halls.** |

### Places by confidence

| Confidence | Count |
|---|---|
| verified (official or 2+ sources) | 16 |
| partial (some fields null or single-source) | 83 |
| verify-locally (core access or status unconfirmed) | 8 |

The 8 marked verify-locally:
- **Arasinagundi Falls:** treat as closed (forest order 2024, death in 2023).
- **Ermai Falls:** access blocked by the landowner, still listed as closed.
- **Kodachadri:** both trekking routes closed in May 2026; no reopening found.
- **Hidlumane Falls:** on the closed Kodachadri route.
- **Kumara Parvatha:** in 2026 only the Beedahalli route reopened; the Kukke route had no date.
- **Kudlu Theertha Falls:** open status rests on a single blog.
- **St Aloysius Chapel:** visiting hours not published.
- **Basavaraj Durga island:** landing permission unclear; may be Sankranti only.

78 of 107 places have at least one field saying "verify locally". By field: temple details 62, veg food 40, safety 25, season notes 21, trek details 14, transport 13, best time 13, bike tips 6.

## How the numbers were made

- **Distances:** road km from Tiger Circle, Manipal (OpenStreetMap), routed with OSRM. Islands route to the Malpe jetty. Dudhsagar uses the distance to the Collem jeep base.
- **Ride times:** the longer of (OSRM car time + 20%) and (distance ÷ 40 km/h). OSRM assumes 65–80 km/h, which isn't realistic on NH-66 or the ghats. Scripts: `scripts/recompute-routes.mjs`, `scripts/build-data.mjs`.
- **Seasons:** `bestMonths` and `seasonNote` come from each place's sourced best-time findings, with monsoon notes added. No new searches were needed except for gaps.
- **Trip best season:** the months that are good for *every* stop on the trip.

## The 10 must-dos

1. Udupi Sri Krishna Matha
2. St Mary's Island
3. Kollur Mookambika
4. Dharmasthala
5. Sringeri Sharada Peetham
6. Agumbe sunset and ghat
7. Kudremukh trek
8. Gokarna beach trail
9. Dudhsagar overnight
10. Bekal Fort

Together that's 4 temples, 3 hills/treks, 2 coast and 1 heritage. Every one now has veg food listed.

## Worth Watching: Don't miss

1. **Kambala:** buffalo races most weekends from late November to May.
2. **Yakshagana season:** a show somewhere most nights for six months.
3. **Krishna Janmashtami, Vittal Pindi and Pili Vesha, Udupi:** the tiger dance, minutes from Manipal.
4. **Mangaluru Dasara at Kudroli:** the coast's biggest procession.
5. **Bahubali Mahamastakabhisheka, Karkala:** **18–28 Feb 2027, confirmed**, and only once every 12 years.
   - Next at the other sites: Shravanabelagola in 2030 (year only). Venur and Dharmasthala are not announced.

## Places added beyond the list, and why

| Added | Why |
|---|---|
| Kunjarugiri Durga Temple | Pairs with Pajaka; it's Madhvacharya's hill. |
| Barkur | Old Alupa capital and Jain ruins; the real reason to stop near Brahmavar. |
| Someshwara Beach, Byndoor | Sits right below Ottinene and was recently upgraded. |
| Gangolli and the Panchagangavalli estuary | Five rivers meet the sea opposite Kodi. |
| Anejhari Butterfly Camp | An official Jungle Lodges base for Kollur and Kodachadri. |
| Sultan Battery | Tipu's watchtower and the ferry jetty for Tannirbhavi. |
| St Aloysius Chapel | Moscheni's frescoes; an indoor stop in any weather. |
| Chandragiri Fort, Madhur temple | Make a Kasaragod day with Ananthapura and Bekal. |
| Venur Bahubali | The third of the coast's Bahubalis. |
| Shishila Matsya temple | Sacred fish in the Kapila river. |
| Baba Budangiri / Dattapeetha | Uses the same vehicle pass as Mullayanagiri. |
| Ayyanakere | A dawn add-on from Chikkamagaluru. |
| Kasarkod Eco Beach | Blue Flag beach on the Honnavar day. |
| Basavaraj Durga island | Island fort off Honnavar. |
| Dharmasthala museums, Talacauvery–Bhagamandala | Split out as their own entries. |

## Verification

A separate agent that never saw the research spot-checked 10 random places against their own sources.
- **Contradicted:** none.
- **Unsupported claims:** 5, plus 2 timing variants. All fixed:
  - Kadri, Anantheshwara and Idagunji timings
  - a jeep claim at Bandaje
  - the Kudremukh daily cap, which was actually about Netravati
  - the Bella Homestay veg claim
  - the Hidlumane guide rule
- **Vegetarian audit:** **zero non-veg recommendations** across places, food and trips. Veg caveats were added to Pabbas and Diana, whose pure-veg status is unconfirmed. Ideal Cafe is now shown as "temporarily closed per Wanderlog". The non-veg restaurant name was removed from the ghee roast entry.
- **Places with no sources:** none.

## Known gaps (honest list)

1. **Veg food near places:** 72 of 107 places still have an empty `vegFoodNearby`. Temple towns are covered by annadana. Elsewhere the advice is to pick a pure-veg hotel on the spot. The web-search allowance ran out during the first research pass, and this was the main casualty.
2. **Temple timings:** sources often conflict. Where they do, both ranges are shown with "verify locally". Official sites for Kollur and Kukke are hijacked or unofficial.
3. **Festival dates without sources:**
   - Udupi Saptotsava 2027
   - Kadri jatre
   - Saligrama rathotsava
   - Mandarthi
   - Kollur Rathotsava
   - Polali Chendu
   - Kateel
   - Karavali Utsav
   - Gokarna's 2027 chariot day
   - Aati amavasya 2027
   - Udupi Janmashtami 2027 (Udupi follows the solar month, so the pan-India date may not apply)
4. **Forest treks:** whether this winter's fire-season closure repeats (in 2026 it began 14 Jan) isn't online yet. Trip notes say to plan treks for October–December.
5. **Train timings:** sourced only for Dudhsagar. Other train trips say to check NTES/IRCTC.

## Open questions for you

1. **Kodachadri and Kumara Parvatha (Kukke route):** if you hear locally that either has reopened, tell me and I'll update both.
2. **Diana (Udupi):** it's kept in with a veg-only caveat. Drop it entirely if you know it serves non-veg.
3. **Veg food:** I can run a focused pass on the 72 places with no veg eatery listed. It would mostly use Google-Maps-style listings, so expect "verify locally" on many.
4. **Must-dos:** happy with the 10? A common swap would be Kateel with an evening Yakshagana show in place of Bekal Fort.
