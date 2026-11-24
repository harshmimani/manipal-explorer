# Festivals year-round + Worth Watching: research notes (24 Nov 2026)

Files: `festivals-year.json` (40 entries, all 12 months), `worthWatching.json` (15 entries, 5 dontMiss).
Both were checked with JSON.parse. Every `festivalIds` entry resolves, there are no duplicate ids, no `upcoming` dates fall before 24 Nov 2026, and none of the banned words appear.
All 29 entries from `festivals.json` were reused. The 11 kambala fixtures are merged into `kambala-season`, plus the Kadandale final on 1 May 2027 (taken from the V4 News revised-schedule headline). Yakshagana is one `yakshagana-season` entry.

## Date sourcing
- "panchang-derived" 2027 dates come from Drik Panchang's 2027 Hindu calendar set to Mangaluru (geoname 1263780):
  Maha Shivaratri 6 Mar, Ugadi 7 Apr, Nag Panchami 6 Aug, Ganesh Chaturthi 4 Sep, Navaratri 30 Sep to Vijayadashami 9 Oct, Tula Sankranti 18 Oct, Naraka Chaturdashi/Diwali/Govardhan 28-30 Oct, Kartik Purnima 14 Nov.
- Krishna Janmashtami 2027 was left out on purpose. Drik gives 25 Aug 2027 (lunar), but Udupi follows the solar Simha masa and its date can differ. Check with the Matha.

## Unconfirmed / check locally
- **Udupi Saptotsava 2027**: dates not announced. If Sankranti is 15 Jan, it runs roughly 10-16 Jan.
- **Kadri jatre, Saligrama rathotsava, Mandarthi festival, Kollur Maharathotsava, Polali Chendu, Kateel jatre/Thootedhara, Bisu, Dharmasthala Padabhisheka**: no 2027 dates found. Only months and the basis are given.
- **Mandarthi**: the schedule rests on one blog (hindu-blog.com). Treat it as low confidence.
- **Koteshwara Kodi Habba 2026**: no date found. The Vrischika full-moon rule suggests it may fall around now (late Nov).
- **Udupi Laksha Deepotsava**: the 2026 edition likely started before 24 Nov. The 2027 start (Utthana Dwadashi) has no source yet.
- **Sirsi Marikamba**: the last jatre ran 24 Feb-4 Mar 2026. 2028 is the next by the two-year cycle, but no dates are announced.
- **Karavali Utsav 2026-27**: no dates for Mangaluru or Karwar.
- **Datta Jayanti at Baba Budangiri**: the main day is 23 Dec 2026 (Drik). The multi-day programme dates were not found. The site is disputed, with heavy policing.
- **Talacauvery**: the Theerthodbhava clock time is announced by the temple only shortly before the day.
- **Gokarna**: the Shivaratri rathotsava date for 2027 was not found. Only Shivaratri itself is dated.
- **Aati amavasya 2027**: not found in the Drik year view.
- **Bhoota Kola**: no public calendar exists. The season (Deepavali to Pattanaje) is sourced, and individual kolas are fixed locally.
- **Udupi Paryaya 18 Jan 2028**: falls outside the 12-month window. It is kept because the date is fixed by tradition and sourced. The Sodhe Matha seer's name is not confirmed.
- Dress codes, darshan timings and festival-day annadana timings are mostly still "verify locally".
- Some `watchRespectfully` and `bestSpot` lines are common-sense etiquette, not sourced rules. Examples are footwear off, no flash and keeping back from tracks. No women-only or men-only norms were found, so none are stated.

## Bahubali Mahamastakabhisheka: next dates
| Site | Last | Next | Source |
|---|---|---|---|
| Karkala | 21-31 Jan 2015 | **18-28 Feb 2027** (confirmed) | Wikipedia "Gommateshwara statue, Karkala", citing The Hindu, 21 Aug 2026; Hans India (10 days from 18 Feb 2027) |
| Venur | 22 Feb-1 Mar 2024 | Not announced (a 12-year cycle would point to ~2036; this is inference, not a published date) | Deccan Herald 2024 coverage; Hans India notes Venur has not kept strictly to 12 years |
| Dharmasthala (Ratnagiri) | 9-18 Feb 2019 | Not announced. Earlier: 1982, 1995, 2007. A yearly Padabhisheka is held around early Feb | Wikipedia "Mahamastakabhisheka"; Udayavani |
| Shravanabelagola | 17-25 Feb 2018 | **2030** (year only, no dates) | Deccan Herald 2018; Karnataka Tourism |

## dontMiss picks (exactly 5), and why
1. **Kambala**: the coast's signature spectacle. Races run every weekend from late Nov to May across a dozen venues, and entry is free, so it is the easiest one to catch.
2. **Yakshagana season**: some mela is playing somewhere most nights for six months, and the shows are free. It is the best way into the region's culture.
3. **Krishna Janmashtami + Vittal Pindi with Pili Vesha (Udupi)**: it happens in Manipal's own backyard, in daylight, and is the most photogenic street festival here.
4. **Mangaluru Dasara at Kudroli**: the biggest public procession on the coast. It is open to all and reachable by train or bike.
5. **Bahubali Mahamastakabhisheka (Karkala, 18-28 Feb 2027)**: a once-in-12-years event, under an hour from Manipal and less than three months away. Without this timing it would not be on the list.

Not picked: Paryaya (biennial, pre-dawn, next is 2028), Bhoota Kola (needs an invite and quiet behaviour, so it is the least accessible), and Kukke, Kollur and Gokarna (big crowds, long ghat or highway rides). Laksha Deepotsava was a close sixth.

## Search budget
About 33 web searches plus 4 page fetches.
