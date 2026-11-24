# Part 3: art-direction explorations

Open with `npx vite`, then `/manipal-explorer/review/direction-a.html` (and -b, -c).
Screenshots: `node scripts/shoot-directions.mjs` → `review/screenshots/direction-{a,b,c}-{390,1440}.png`
(full page, reduced motion so every reveal is in its final state).

Every page shows the same specimens, from real data and images: hero (St Mary's Island),
place card (Agumbe Ghat & Sunset Point), chapter opener (II. The Gods, Udupi Krishna Matha),
place detail (Kollur Mookambika, bottom sheet on phone, panel on laptop).
"Good now", the month strip and the counts are computed from `bestMonths` and today's date.

## A · Konkan Chronicles (the brief, exactly)
Instrument Serif (condensed, high-contrast) + Hanken Grotesk. Ink black, saffron as the only accent, film grain and letterbox bars.
Left-aligned editorial grid; huge serif titles with line-by-line rises, outlined roman numerals, clip-path reveals.
Reads like a title sequence: moody and cinematic, and the darkest of the three for long reading on a phone.

## B · Route Card
Big Shoulders Display (condensed grotesk, all caps) + IBM Plex Mono. Sand paper, ink rules, laterite blocks, teal for in-season.
Layout logic is a timetable: hard 2px rules, distance as the headline, cards as ticket stubs, chapters as departure boards listing the nearest shrines.
Practical and loud, the most "useful at a glance" on a bike stop; the least cinematic, and mono body text is slower for long temple notes.

## C · Monsoon Almanac
Fraunces (soft, optical-size serif with italics) + Figtree. Deep monsoon teal with saffron glow, a light bone sheet for details.
Centred, symmetrical layout built on arches (temple doorways) and concentric rings; the month dial leads the hero, so season comes first.
Warm and devotional, the calmest to read; risks feeling soft next to the "Awwwards" bar unless the motion is strong.

## Chosen: A, pushed further (review/direction-final.html)
Built only on `src/styles/tokens.css`. Bigger, tighter Instrument Serif; light leaks, deeper shadows and a letterbox intro.
From C: the season line in the hero and the month strip. The arch appears only in II. The Gods.
From B: bold distance and ride time on the cards. B and C no longer have their own fonts (removed).
