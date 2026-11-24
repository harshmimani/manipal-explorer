// Hand-checked patches applied on top of the regional research by scripts/build-data.mjs.
// `addSources` appends URLs; object fields (temple, trek, transport) merge one level deep.
// Patches to research/raw/food.json entries, by section and id (from the verification pass).
export const foodPatches = {
  places: {
    'ideal-cafe': { operatingStatus: 'temporarily closed per Wanderlog; verify locally' },
    pabbas: { order: "Gadbad first, then come back another day for the Dilkhush. Pure-veg status isn't confirmed, so stick to the ice cream and clearly veg items. Weekday afternoons skip the token queue." },
    'diana-udupi': { order: "Come for the gadbad and the Horlicks ice cream. Pure-veg status isn't confirmed, so order only clearly veg items such as the veg cutlet." },
  },
  dishes: {
    'veg-ghee-roast': { whatItIs: 'VEG VERSION of a famous non-veg dish. The original ghee roast is chicken, from Kundapura. Veg kitchens toss paneer (or mushroom) in the same ghee-rich roast masala. Ideal Cafe in Mangaluru serves a green paneer ghee roast with neer dosa (temporarily closed per Wanderlog; verify locally).' },
  },
};

export default {
  // Evergreen rewording of bestTime lines that referred to the old Dec–Jan window.
  'kudroli-gokarnanatha-temple': { bestTime: 'Morning or evening puja. Navaratri (Mangaluru Dasara, September–October) is the spectacle; any other time is calm.' },
  'mangaladevi-temple': { bestTime: 'Morning or evening darshan. Navaratri and the annual Rathotsava are the crowded times.' },
  'mangaluru-city-by-train-bike': { bestTime: 'Weekdays, any season; start early, because temples break at midday.' },
  'talacauvery-bhagamandala': { bestTime: 'Early morning, as part of a Coorg overnight. Tula Sankramana (mid-October) is the big festival day.' },
  'sirsi-marikamba-temple': { bestTime: 'October to February. The Marikamba Jatre is held every two years: it last ran 24 Feb–4 Mar 2026, and the next is due in 2028 (Wikipedia).' },

  // ---- Gap fills: veg food near the 10 must-dos (Part 1, lean search pass, Nov 2026) ----
  'st-marys-island': {
    vegFoodNearby: [
      'No pure-veg eatery at the Malpe jetty could be confirmed online, so eat in Udupi town (~6 km) before or after: verify locally if you find one on the beach.',
      'Mitra Samaj, Car Street, Udupi (pure veg, ~6 km): Goli baje straight from the oil and a plate of buns.',
      'Carry water and a snack on the boat: there is no food on the island.',
    ],
    addSources: ['https://wanderlog.com/place/details/531817/mitra-samaj', 'https://www.happycow.net/reviews/santrupti-karnataka-196590'],
  },
  'bekal-fort': {
    vegFoodNearby: [
      'Vrindavan Pure Veg Restaurant & Ice Cream, Pallikkara, Bekal (pure veg per listings): a lunch stop near the fort. Hours and status: verify locally.',
      'Udupi Sree Krishna Veg Restaurant, Kasaragod–Bekal road (pure veg per listings): reliable meals on the way in. Verify locally.',
    ],
    addSources: ['https://www.holidify.com/places/bekal/restaurants-places-to-eat-local-cuisine.html', 'https://wanderlog.com/explore/4211/bekal'],
  },
  'agumbe-sunset-point-and-ghat': {
    vegFoodNearby: [
      'Hotel Sri Krishna Bhavan, Agumbe (vegetarian per listing): idli, vada and masala dosa before the ghat. Status: verify locally.',
      'Dodda Mane homestay, Agumbe (home-cooked vegetarian, at fixed times; book ahead): the source is old, so verify locally.',
    ],
    addSources: ['https://www.booked.ai/restaurants/hotel-sri-krishna-bhavan', 'https://www.beontheroad.com/2010/12/dodda-mane-at-agumbe-great-hospitality.html'],
  },
  'sringeri-sharada-peetham': {
    vegFoodNearby: [
      'Sharada Peetham annadana (free prasada meal; lunch about 12:15–2:30 PM, dinner about 7:15–8:30 PM per sringeri.net).',
      'Akshaya Mess (pure veg): idli-vada before darshan; it\'s slightly off the main road. Status: verify locally.',
      'Maruthi Tiffin Centre (pure veg, no onion or garlic): poori-saagu and a Malnad coffee. Status: verify locally.',
    ],
    addSources: ['https://wanderlog.com/place/details/6222306', 'https://eatwithachar.blogspot.com/2022/11/maruthi-tiffin-center-sringeri.html'],
  },
  'kudremukh-peak-trek': {
    vegFoodNearby: [
      'Mullodi homestays at the trailhead, e.g. Bella Homestay (its listing mentions packed lunches for treks). Kitchens may also cook non-veg, so confirm a veg-only meal when you book.',
      'Carry your own snacks: there is no food on the trail.',
    ],
    addSources: ['https://wanderlog.com/place/details/4882233/bella-homestay-kudremukh', 'https://www.indiahikes.com/documented-trek/kudremukh-trek'],
    // Verification fix: the 50/day cap in the cited blog is for Netravati.
    textFix: [['trek.howToBook', 'One blog reports a 2026 cap of 50 trekkers a day, but other reports conflict, so check the portal.', 'A 2026 blog about Netravati reports a 50-a-day cap there and a separate cap for Kudremukh; check the portal for current numbers.']],
  },

  // ---- Fixes from the independent verification pass (Part 1) ----
  'kadri-manjunatha-temple': {
    temple: { darshanTimings: 'Not officially published; listings give about 6:30 AM–2 PM and 4–8:30 PM (hindu-blog.com) or 6:30 AM–8:30 PM (Holidify). Puja times reportedly change mid-Dec to mid-Jan. Verify locally.' },
  },
  'udupi-anantheshwara-chandramouleeshwara': {
    temple: { darshanTimings: 'Not confirmed online; verify locally. Both temples sit across the square from the Krishna Matha, so visit them on the same morning.' },
  },
  'idagunji-maha-ganapathi': {
    temple: { darshanTimings: '6:00 AM–1:00 PM and 3:00 PM–8:30 PM (Yatradham); verify locally.' },
  },
  'bandaje-falls-ballalarayana-durga': {
    textFix: [['bikeTips', 'Sources say jeeps can go about 1 km past the temple and other vehicles should park at it. ', '']],
    addSources: ['https://trekentrip.com/karnataka-treks-closed-2026/'],
  },
  'hidlumane-falls': {
    trek: { guideMandatory: true },
    textFix: [['trek.howToBook', 'Current status — verify locally.', 'Explurger reports a certified nature guide is mandatory, one per 10 trekkers. Current status — verify locally.']],
  },
  'gokarna-mahabaleshwar-temple': {
    bestTime: 'October–February (Karnataka Tourism). Maha Shivaratri is the big festival; book early if you go then.',
  },
  'dudhsagar-falls-overnight': {
    vegFoodNearby: [
      'Krishna, Borda, Margao (pure veg, ~0.6 km from Madgaon Jn per listing): pav bhaji or a South Indian breakfast before the Kulem train. Verify locally.',
      'Pai Palace, Vidya Nagar, Margao (pure veg family restaurant per listings, ~0.6 km from the station). Verify locally.',
      'Avoid the station\'s Benjoe Rail Restaurant if you want strictly veg: it serves both.',
      'Carry food for the jeep day: options at Collem are limited (verify locally).',
    ],
    addSources: ['https://yappe.in/goa/margao/krishna/759914', 'https://yappe.in/goa/margao/pai-palace/1255662'],
  },
  'gokarna-beach-trail': {
    vegFoodNearby: [
      'Mahabaleshwar temple prasada bhojana in town (free, pure veg) before or after the walk.',
      'Pai Restaurant, Gokarna town (pure veg): a thali after the beach walk; don\'t confuse it with Pai Hotel around the corner. Status: verify locally.',
      'Beach shacks on Kudle and Om mostly serve seafood too: stick to veg plates or carry food.',
    ],
    addSources: ['https://www.happycow.net/reviews/pai-restaurant-karnataka-445324'],
  },

  // ---- Gap fills: darshan timings ----
  'kukke-subramanya-temple': {
    temple: { darshanTimings: 'Darshan 6:00 AM–1:30 PM and 3:30–8:30 PM; temple closes at 9:00 PM; general darshan is free (kukkedevasthanam.org.in, which appears to be the devasthanam site, updated April 2026). Other guides list 6:30 AM starts or 8 PM closing, and timings change on festival and eclipse days, so verify locally.' },
    addSources: ['https://kukkedevasthanam.org.in/temple-timings'],
  },
};
