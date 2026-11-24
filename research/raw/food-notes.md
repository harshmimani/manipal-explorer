# Food research notes (food.json)

Checked: Nov 2026. Output: 14 dishes, 16 places, 6 annadana entries.
Note: the web-search budget ran out partway through. Later checks used direct page fetches (Wikipedia, Wikivoyage, Wanderlog, temple pages) and OSM Nominatim only. A follow-up pass with fresh searches could fill the gaps below.

## Flags: veg status

- **Diana, Udupi: `pureVeg: null`. FLAG.** No source shows an actual non-veg menu, and every dish named across sources is veg (gadbad, Horlicks ice cream, cutlets, banana bonda, puri korma, channa pathora). But one review surfaced in search results said it "also serves tasty non-veg food". I couldn't open that review, and no source explicitly says "pure veg". The entry tells the user to order only the gadbad/veg items. **Ask at the counter whether there's a non-veg kitchen before eating anything beyond the ice cream.** Two OSM nodes named "Hotel Diana" exist ~600 m apart, so the lat/lng (Kavi Muddana Marg node) is best-guess. Hours are null because the Yappe listing (8am–1pm) conflicts with its own FAQ and with Diana's evening ice-cream trade.
- **Pabbas: `pureVeg: null`.** Everything reviewed is veg (ice creams, veg cutlet, paneer pizza/sandwich), but no source states "pure veg". Low risk; still verify.
- **Gadbad / ice cream:** no source states whether Ideal or Diana ice creams or jellies contain egg or gelatin. Ask at the counter.
- **Neer dosa / ghee roast:** both are commonly non-veg on this coast (neer dosa with chicken/fish curries; ghee roast is chicken by default, and Shetty Lunch Home, Kundapura, claims to have invented it). The entries say to order veg sides or paneer ghee roast at pure-veg kitchens only. Shetty Lunch Home is deliberately NOT listed as a place.
- **Excluded for veg uncertainty:**
  - Laxmi Cream Parlour, Karkala (gadbad, 1940s roots). The EazyDiner FAQ says it serves "both veg and non-veg".
  - Mantapa Hotel & Ice Cream Parlour, Saligrama on NH66 (gadbad, ~50 yrs old, 2025–26 reviews). Veg status not stated. Good candidate if confirmed veg locally.
  - Kollur (Kairali/Mahalakshmi Residency), Murudeshwar (Udupi Upachar, Annapurna) and Agumbe (Sri Krishna Bhavan) veg options. The sources were thin or aggregator-only.

## Operating status issues
- **Ideal Cafe, Hampankatta:** Wanderlog marks it "Temporarily Closed", yet shows reviews dated Dec 2025–Jul 2026. Set to "verify locally".
- **Taj Mahal Café:** the famous one is **New Taj Mahal Café**, which moved from Car Street to the Hotel Panchmahal complex in Kodialbail in March 2009. The "Hotel Taj Mahal" at Hampankatta (opp. Wenlock Hospital) is a different veg restaurant with weaker reviews, and it's not listed. Founding date is conflicting (1926 / 1932 / 1951 across sources), so it's not used in copy. No reliable OSM node, so lat/lng is null.
- **Mitra Samaj:** two address listings (Car Street per Wanderlog/OSM; "KM Marg, near Mitra Hospital" per district.in). One source mentioned "both outlets". Hours also conflict (Wanderlog: closed Wed, split shifts; district.in: 7:30am–10pm). The ₹700-for-two price from district.in looks high, so verify.
- Wanderlog review dates (2026) were used as evidence of operation for Mitra Samaj, Woodlands Udupi, Pabbas, New Taj Mahal Café, Indra Bhavan and Woodlands Mangaluru. Wanderlog itself carries a "© 2025" footer, so treat those dates with mild caution.
- Pai Tiffins, Madhuvan Veg, Janatha Deluxe, Akshaya Mess, Pai Restaurant (Gokarna): listed with hours but no dated 2025–26 reviews found, so status is "verify locally".
- Kushi (Santhekatte), Parijatha (Kundapura), Maruthi Tiffin (Sringeri): single, older sources only, so status is "verify locally".

## Places added beyond the required six (and why)
1. **Pai Tiffins, Manipal:** pure-veg dosa and coffee stop nearest Tiger Circle.
2. **Madhuvan Veg, Manipal:** pure-veg North Indian option in Manipal.
3. **Hotel Kushi, Santhekatte:** veg highway stop on NH66 with goli baje and ice cream (Wikivoyage).
4. **Hotel Parijatha, Kundapura:** Wikivoyage lists it as pure veg. Useful in a ghee-roast town. Wikivoyage also lists Hotel Sharon (Shastri Circle), Maiya Canteen and Venkateshwara Bhavan as veg, not added.
5. **Hotel Indra Bhavan, Mangaluru:** 60+ yr breakfast institution; buns, kotte, uppit-avalakki.
6. **Woodlands Hotel, Mangaluru:** goli baje plus banana-leaf red-rice meals.
7. **Hotel Janatha Deluxe (Pathumudi Soudha), Mangaluru:** buns, neer dosa, evening patrode.
8. **Akshaya Mess, Sringeri:** sattvik breakfast by the Peetham.
9. **Maruthi Tiffin Centre (Holla's), Sringeri:** no onion/garlic, yards from the Peetham gate.
10. **Pai Restaurant, Gokarna:** HappyCow-listed pure-veg. Not the same as Pai Hotel.

No pure-veg restaurant could be adequately verified for Kollur, Murudeshwar, Agumbe, Kukke, Dharmasthala or Karkala. For the temple towns, the annadana entries cover food.

## Null / "verify locally" fields
- **Dishes:**
  - kannadaOrTuluName is null for kotte kadubu, thambuli, banana-leaf meal and veg ghee roast.
  - Kadle manoli: recipe not sourced (only that "manoli" is Tulu for ivy gourd); whereToTry is empty; confidence is verify-locally.
  - Thambuli and pickles/chips: no specific outlet sourced. Chips are entirely unsourced.
  - Mushroom ghee roast: no outlet sourced.
  - Mangalore buns egg-free: inferred from ingredient lists only.
- **Places:**
  - lat/lng null for New Taj Mahal Café, Kushi, Parijatha, Indra Bhavan, Janatha Deluxe (OSM node found was a different outlet at Kudroli), Akshaya Mess, Maruthi Tiffin and Pai Restaurant Gokarna (OSM has only "Pai Hotel").
  - Woodlands Mangaluru OSM node is on "Bridge Road, Bendoor", close to but not exactly the Bunts Hostel Rd address. Pai Tiffins OSM node is near Tiger Circle (Indrali). Confirm both.
  - hours null: Diana, Ideal Cafe, Kushi, Parijatha, Maruthi.
  - priceBand null for most places.
- **Annadana:**
  - Kollur: dinner, menu and most etiquette null (only lunch 12–1:30 from one third-party guide).
  - Sringeri: dress code null.
  - All temples: right-hand eating, whether you clear your own leaf, and donation norms are mostly unsourced. Exceptions: Kollur "Anna Santharpana" seva; Udupi plate-washing per a 2026 review.
  - Udupi and Dharmasthala timings conflict across sources (ranges given).
  - Kukke figures come from kukkedevasthanam.org.in, which describes itself as an independent guide, not the official site.
  - shridharmasthala.org/annaprasadam returned 403.
  - Udupi Krishna Matha: a March 2026 review says meals are now plates and buffet, not banana leaf. Confirm locally.
