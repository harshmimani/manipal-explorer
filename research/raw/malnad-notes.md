# Malnad: research notes

Region slug: `malnad`. 20 entries in `malnad.json`. Last checked 2026-11.

Research caveat: the shared web-search budget ran out partway through. After that, facts came only from pages opened directly (official sites, Karnataka Tourism, Wikipedia/Wikidata, news articles already found, IndiaHikes, visitor blogs). A few items below are therefore thinner than they would otherwise be.

## Structure decisions
- **Agumbe**: one entry for the ghat ride and Sunset Point (`agumbe-sunset-point-and-ghat`), with Barkana viewpoint and Jogi Gundi as separate entries. The Agumbe Rainforest Research Station only appears in `safety`/`why` context. Its site (agumberainforest.org) and Wikipedia give no public visiting info, so it is described as a research station, not an attraction.
- **Kemmanagundi**: one entry covering Z-Point and Hebbe Falls.
- **Mullayanagiri**: Seethalayanagiri and the Sarpadhari trail are folded into this entry.
- **Kuppalli**: Kavimane museum and Kavishaila in one entry.

## Places added beyond the list, and why
1. **Baba Budangiri / Inam Dattatreya Peetha** (`baba-budangiri-dattapeetha`). It shares the same online vehicle-slot pass as Mullayanagiri (Deccan Herald, Aug 2025), so it costs nothing extra on that trip. It's a significant shrine for a Hindu traveller, and the coffee-origin story is a strong hook. Sourced from Wikipedia and DH.
2. **Ayyanakere Lake** (`ayyanakere-lake`). A Hoysala-era tank 18 km from Chikkamagaluru, a natural dawn add-on to the Mullayanagiri overnight. Single source (Wikipedia), so the entry is marked partial and verdict "ok". Recommended only as an add-on.
- Considered but not added: **Bhadra Wildlife Sanctuary** (the Karnataka Tourism page had no safari timings, fees or booking info, and a Jungle Lodges URL 404'd, so it couldn't be sourced). **Onake Abbi** and **Kodige Falls** couldn't be sourced either (Karnataka Tourism's Agumbe page only name-checks Onake Abbe).

## Fields set to null / "verify locally"
- **barkana-falls-viewpoint**: `lat`, `lng`, `distanceKmFromManipal` and `rideTimeFromManipal` are null. Neither Nominatim, Wikidata nor Wikipedia had coordinates for the viewpoint or falls. bikeTips gives Jogi Gundi's distance (51 km / 45m) as a proxy. `trek.permitRequired`, `guideMandatory` and `openDecJan` are null. The viewpoint fee is from a 2022 blog only.
- **kudlu-theertha-falls**: `confidence: verify-locally`. Open status, the registration portal and the fee are from a visitor blog updated Nov 2024. Coordinates are for "Kudlu Falls Road" (the OSM access track), not the falls. `trek.guideMandatory` and `openDecJan` are null.
- **jogigundi-falls**: fee and hours are blog-only (some sites say free).
- **varanga-kere-basadi**: `temple.dressCode` and `temple.annadana` are null. Boat timings conflict (3–6 PM vs 4–6 PM afternoon session).
- **sringeri-sharada-peetham**: the official detailed dress-code notice on sringeri.net returns 404. `dressCode` uses Karnataka Tourism ("modest dressing") and Yatradham ("traditional and formal") and says to verify locally. Timings and annadana are official.
- **horanadu-annapoorneshwari-temple**: the official site (srikshetrahoranadu.com) didn't resolve. Dress code (men remove shirts in the darshan line), darshan timings and the Prasada Bhojana window come from third-party listings (Holidify, Trawell, templesinindiainfo), which agree with each other. Karnataka Tourism confirms free meals three times a day.
- **All Kudremukh Wildlife Division treks** (Kudremukh, Netravati, Kurinjal, Narasimha Parvatha): `trek.openDecJan` is null. The daily cap is unconfirmed: one 2026 blog says 50 per peak, but older reports seen in search results gave different numbers that couldn't be opened to confirm. Netravati's distance is from a blog. Narasimha Parvatha's `guideMandatory` is null (the IndiaHikes text was ambiguous, and the TNM SOP explicitly covers only four trails). The official trek fee wasn't found for any of them.
- **kundadri-hill**: `temple` sub-fields are all null (no timings found). Trek permit, guide and openDecJan are null.
- **kemmanagundi**: Hebbe Falls' current access status and jeep fares aren't stated anywhere official. `trek.permitRequired`, `guideMandatory` and `openDecJan` are null.
- **mullayanagiri-peak**: whether the Sept 2025 vehicle-slot system and fees are unchanged in 2026 is unconfirmed. Two portal URLs are in circulation. `trek.permitRequired` is null because the pass is a vehicle pass, not a trek permit.
- **kavaledurga-fort**: fee (₹25 / ₹50 / free) and hours (IndiaHikes says 6 AM–2 PM, Karnataka Tourism says entry closes 5 PM) conflict. `openDecJan` is null. IndiaHikes calls it ASI-protected, but this isn't confirmed elsewhere, so it isn't stated as fact.
- **kuppalli**: museum hours and fee come from Wikipedia only (9 AM–6:30 PM daily, ₹20).
- **sakrebyle-elephant-camp**: timings and fees from karnataka.com (Apr 2024). The Karnataka Tourism page gives only the location.
- **baba-budangiri-dattapeetha**: all `temple` sub-fields are null.
- **vegFoodNearby**: only Horanadu has an entry, because it's the only place where a source explicitly says the food is vegetarian. Sringeri's annadana is in `temple.annadana`, but the official page doesn't say "vegetarian", so it isn't listed in vegFoodNearby. Every other place is `[]`. No sourced pure-veg eateries were found before the search budget ran out.
- **Agumbe "14 hairpins"**: no opened source gave a count (Karnataka Tourism just says "hairpin-bend-filled"), so the number is not used anywhere.

## Closures, bans, season issues
- **Agumbe ghat heavy-vehicle ban**: in 2026 the Shivamogga DC banned heavy goods/gravel vehicles on the NH 169A ghat from 15 June "until the end of the monsoon season" (Hans India, 12 Jun 2026). In 2025 the ban ran 15 June–30 Sept, and only light vehicles were allowed. No Dec–Jan ban was reported. A 2014 precedent shows full closures for repair works do happen.
- **Kudremukh Wildlife Division fire-season ban**: from **14 Jan 2026** all trekking routes in Kudremukh NP, Someshwara WLS and Mookambika WLS were closed "until further notice" (DH, 15 Jan 2026). This named Netravathi, Kudremukha, Kodachadri and Narasimha Parvatha, and it also covers Kudlu Theertha (Someshwara). Expect a repeat in mid-January 2027, so book these for **December**.
- **2026 trekking SOP** (TNM, 4 Jul 2026): 8 of 16 trails reopened (Netravathi, Kudremukh, Kurinjal, Gangadikal, Kodachadri ×2, Narasimha Parvatha ×2). A guide is compulsory per 10 trekkers, and flash photography and single-use plastic are banned.
- **Aranya Vihaara rules** (effective 15 Jul 2026): book 30 days ahead at most and 1 day ahead at least. 50% refund for cancellations 8+ days out, nothing within 7 days. Original ID required. A 2026 blog's "zero refund" claim contradicts the portal, so the portal wins.
- **Jog Falls**: the main entrance was closed 1 Jan–30 Apr 2025 for development works (new gate, viewing tower, parking). Alternative viewpoints stayed open. Since reopening there's a 2-hour visit cap. The 1,400 steps to the base are "often restricted" per Karnataka Tourism (whose own page is inconsistent on this). Winter flow is "moderate" and depends on Linganamakki releases.
- **Mullayanagiri / Baba Budangiri**: online vehicle slot booking has been mandatory since 1 Sept 2025 (two slots, 600 vehicles per slot).
- **Kavaledurga**: the topmost portion was reported closed to visitors in Aug 2024. No plastic, no drones.
- **Jogi Gundi**: nearly dry by November, so the verdict is "skip" for Dec–Jan.
- **Kudlu Theertha**: closed whenever elephants or wild animals are spotted. Out by 4 PM.

## Must-do nominations for Dec–Jan
1. **Kudremukh Peak Trek (book a December date)**: the signature trek of the region, at its best in post-monsoon green with clear winter skies. The 14 Jan fire-ban precedent makes December the window, so book the moment the Aranya Vihaara slots open (30 days ahead).
2. **Agumbe Ghat & Sunset Point (paired with Sringeri)**: a 40-minute ride from Manipal, the best sunset odds of the year in dry winter air, and it combines with Sringeri darshan and annadana (official timings sourced) in one day.
3. **Kavaledurga + Kuppalli + Kundadri loop**: one bike day out of Thirthahalli with a Keladi fort, Kuvempu's house and Kavishaila, and a Jain hilltop. None of it depends on water levels, so it's fully reliable in Dec–Jan.
