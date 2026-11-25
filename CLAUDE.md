# Manipal Explorer: Project Brief

## What this is
A cinematic, award-level travel and food guide to everything around Manipal / Udupi, Karnataka. It is an EVERGREEN guide that anyone can use at any time of year and share with friends, not a personal schedule. It must work perfectly on iPhone and laptop.

## Direction (overrides anything earlier or later that conflicts)
- Evergreen: no fixed travel window. Nothing is framed around specific dates of one season.
- Trip Ideas, not a weekend planner: 12–15 ready-made, undated trips in src/data/tripIdeas.json. Each has duration, route, bike/train, stops in order, veg meal stops, best season, and a "pack this" line.
- Seasons: every place has `bestMonths` (array of month numbers 1–12) and `seasonNote` (incl. monsoon notes) instead of decJanVerdict/decJanNote. The site has a "Good right now" filter driven by today's date.
- Festivals: a year-round calendar by month (src/data/festivals.json). The site highlights upcoming ones based on today's date. Never guess dates; recurring events carry their usual month(s) and lunar-calendar basis, and confirmed dates only where sourced.
- My List: visitors can star places to build their own list (localStorage, try/catch), next to "Been there".
- Worth Watching: a section (src/data/worthWatching.json) on the region's most spectacular festivals and cultural experiences: what it is, why it's special, month(s), where, how often (yearly / every 2 years / every 12 years), how to watch respectfully, best spot. "Don't miss" on the top 5.
- Present the food proudly as a vegetarian guide. Everything else in this brief still stands (veg-only, distances from Manipal, temple details, safety notes, design brief).

## About me (personalise everything)
- I live in Manipal. I ride a motorcycle and can take trains (Udupi station is on the Konkan Railway).
- Strict vegetarian. NEVER recommend seafood, meat or egg dishes, or non-veg-focused restaurants. For dishes famous in non-veg form (e.g. ghee roast), only suggest the veg/paneer/mushroom version and say so. Onion and garlic are fine.
- Hindu: temples matter a lot to me. Always include dress code, darshan timings, and annadana/prasada meal details where relevant.
- I want to explore EVERYTHING: beaches, temples, waterfalls, treks, hills, islands, forts, backwaters, culture, food.

## Hard rules
1. No fabrication. Every factual field (timings, distances, permits, prices, dates, operating status) comes from web research with source URLs stored in the data. If you can't verify something, set it to null and mark it "verify locally". Never guess.
2. Never shrink scope to save effort. If a place is in the list, it gets full treatment.
3. No lorem ipsum, no placeholder copy, no travel clichés ("hidden gem", "paradise", "nestled", "breathtaking").
4. Copy voice: a well-travelled local friend. Specific, sensory, a bit witty, short sentences.
5. Images: only downloaded, licence-checked images stored in the repo with credits. Never hotlink, never invent URLs.
6. Safety first: clearly flag ghat-road risks, night riding, slippery waterfall rocks, rip currents on beaches, and anything prohibited (e.g. walking railway tracks to Dudhsagar).

## Art direction (locked in Part 3: Direction A "Konkan Chronicles", pushed further)
- Source of truth: src/styles/tokens.css (colour, type scale, spacing, radii, depth, easing, durations, z-index). Components use semantic tokens only; never raw hex.
  Reference build: review/direction-final.html (screenshots in review/screenshots/direction-final-*.png).
- Concept: a cinematic travel film told in chapters: I. The Coast · II. The Gods · III. The Ghats · IV. The Old Stones (heritage) · V. The Table · VI. The Plan. Dark ink stage, letterbox bars, film grain, light leaks. Aim: Active Theory / Awwwards Site of the Day. Bold type, real depth, drama with a reason.
- Palette: ink #0B0F0E, deep sea #0E3B3A, monsoon teal #1F6F6B, saffron #F29B38, laterite #B4532A, palm #4F7A3A, sand #EDE3D1, bone #F7F3EA.
  Saffron is the single accent: one saffron mark per view. Teal means "in season". Laterite is a fill only (never text on ink; use --warn-text). All text tokens pass WCAG AA on ink and on the sheet surface.
- Type: Instrument Serif (display; italic for one accent word per headline) + Hanken Grotesk Variable (body, labels, numerals). Self-hosted via @fontsource, imported in src/styles/fonts.css. No other families.
  Fluid scale --step--2 … --step-7 (360 → 1920px). Hero headline --step-6, chapter titles --step-5, chapter numerals --step-7 or larger, sized to the viewport.
  Numbers that matter (distance, ride time, counts) are Hanken at --weight-black, tabular, so they scan in a glance.
- Hero: full-bleed photo with slow drift, scroll parallax, saffron and teal light leaks, letterbox intro (bars open from the centre), line-by-line title rise. Chapter rail on desktop, chapter chips on mobile.
  Season line under the title, computed from today's date: "In <Month>, N places are in their best season." (N counts places with a real season, not all-year ones), plus a 12-month strip with the current month marked.
- Place cards: 4:5 portrait, name in Instrument Serif over a dark gradient, "Good now" saffron chip only when in season, star (My List) top right.
  Stat bar (borrowed from B): distance in km and ride time in bold Hanken numerals with tiny caps labels, plus the best-months range. Swipe carousel with scroll-snap on mobile; staggered 3-up grid on desktop.
- Month strip (borrowed from C): 12 cells, teal = in season, saffron ring + dot = this month. Used in the hero and in place detail.
- Arch / temple-doorway motif (borrowed from C): only in II. The Gods (chapter opener and Gods-only modules). --radius-arch, thin saffron outlines; the arch opens like a doorway on scroll. Never elsewhere.
- Chapter openers: viewport-high numeral filled with a photo (background-clip: text), faded out behind the text, chapter title in --step-5, a short line, and big counts. Pinned with a scrubbed reveal on desktop.
- Place detail: bottom sheet on phone (grab handle, rounded top), right-hand panel on laptop over a dimmed photo. Bold fact grid, month strip, temple block (darshan, dress code, anna prasada), ride notes, a laterite-tinted safety box, "Verify locally" tags, sources and photo credits.
- Motion: GSAP + ScrollTrigger + SplitText, Lenis smooth scroll. Easing from tokens (--ease-out ≈ expo.out for reveals, --ease-film for wipes, --ease-spring for magnetic/star). Clip-path wipes for images, word-masked split text for titles, parallax depth, pinned chapters, GSAP Flip for filtering. Nothing moves without a reason.
- Desktop extras (pointer: fine only): cursor that becomes a saffron "View" disc over media, magnetic buttons, subtle card tilt (≤ 6°).
- Mobile: no custom cursor, swipe carousels, bottom-sheet details, thumb-reachable controls, 44px targets.
- Glass (--surface-glass + --blur-glass) only for controls floating over photos.
- Reduced motion: tokens collapse durations and grain; JS skips Lenis, ScrollTrigger, intro and cursor. Content is complete with no JS motion.

## Technical requirements
- Vite + vanilla JS modules. gsap + ScrollTrigger, lenis, three (hero shader only), leaflet.
- Mobile-first, 360px → 1920px+. Use 100dvh, env(safe-area-inset-*), Safari-safe CSS, 44px minimum tap targets, no hover-only interactions on touch, no horizontal overflow.
- Performance: responsive WebP/AVIF via <picture>, lazy loading, shader paused when off-screen or tab hidden, DPR capped at 2. Targets: 60fps on iPhone, Lighthouse mobile ≥ 90 for Performance, Accessibility and Best Practices.
- prefers-reduced-motion: disable WebGL, smooth scroll and heavy animation; content stays fully usable.
- Accessibility: semantic HTML, alt text, visible focus states, keyboard navigable, WCAG AA contrast.
- localStorage always wrapped in try/catch.
- All content lives in src/data/*.json so I can edit it without touching code.

## Workflow rules
- Work only on the current part. Commit with clear messages after each meaningful step and push.
- When a prompt says STOP, stop and wait for my review.
- Keep the "## Progress" section at the bottom of this file updated: what's done, what's pending, open questions.
- Before finishing any part, check your own output against this brief.

## Progress
- Part 0: scaffold done. Repo: https://github.com/harshmimani/manipal-explorer · Live: https://harshmimani.github.io/manipal-explorer/
- Part 1: DONE (awaiting review). See research/report.md.
  - Data: places.json (107, bestMonths/seasonNote, 10 mustDo), tripIdeas.json (15), festivals.json (40, year-round), worthWatching.json (15, 5 dontMiss), food.json (14 dishes, 16 eateries, 6 annadana).
  - Build: `node scripts/recompute-routes.mjs` (OSRM cache) → `node scripts/build-data.mjs` → `node scripts/build-trips.mjs`. Edit research/raw/*.json, seasons.mjs, overrides.mjs, trips.mjs, then rebuild. Don't hand-edit src/data, or a rebuild overwrites it.
  - Independent verification: 10 places spot-checked, 0 contradictions, 0 non-veg recommendations; all fixes applied.
  - Known gaps: 72 places have no veg eatery listed; several festival dates are "check locally"; temple timings often conflict.
  - Open questions: see the end of research/report.md.
  - Note for Part 2+: Karkala Bahubali Mahamastakabhisheka is 18–28 Feb 2027 (confirmed), and is a Don't-miss.
- Part 2 (images): DONE, review round 1 applied (awaiting review).
  - 128 Wikimedia Commons images (CC0 / PD / CC BY / CC BY-SA only) for 88 of 107 places; all 10 mustDo have 5.
  - Min width: 1600px for mustDo, 1200px for other places (relaxed in review round 1).
  - Pipeline: `node scripts/fetch-images.mjs [ids]` → `node scripts/optimise-images.mjs` → `node scripts/build-image-review.mjs`.
    Masters cache in `.cache/` (gitignored). Outputs: public/images/places/<id>/<pageid>-{480,960,1600}.{avif,webp}, EXIF stripped.
  - src/data/image-credits.json: author, licence, licence URL, source page, alt, aspect, dominant colour, blur placeholder.
    Each place's `images` = ordered credit ids (hero first); build-data.mjs now keeps them on rebuild.
  - Swap an image: edit research/raw/image-queries.mjs (`reject` / `pick` / `exclude` / `review` notes), rerun the pipeline.
  - Every pick was checked by eye; filters reject fish/seafood subjects, foreign namesakes, signboards, 3D pairs, flora/fauna close-ups.
  - 19 places use the typographic gradient card: 16 with no acceptable Commons image, plus Kodi beach,
    Swarna kayaking and Anejhari by review (`gradient: true` in image-queries.mjs). See review/images.html (red).
  - Round 1 replacements: Arasinagundi, Kukke, Kateel, Mangaladevi, Netrani, Sakrebyle, Dharmasthala museums, Jogi Gundi.
    Kept as weak (no better image found): Mandarthi, Horanadu, Karkala, Gokarna Mahabaleshwar, Kemmannu, Gadaikallu, Car Street.
  - Contact sheet: `npx vite` → http://localhost:5173/manipal-explorer/review/images.html
- Part 3 (art direction): DONE (awaiting review).
  - Explorations: review/direction-a.html (Konkan Chronicles), -b.html (Route Card), -c.html (Monsoon Almanac). Rationale: review/directions.md.
    B and C lost their fonts when A was chosen; their screenshots show how they looked.
  - Chosen: A, pushed further, plus C's season line, month strip and Gods-only arch, and B's bold distance/ride on cards.
  - Design system: src/styles/tokens.css + src/styles/fonts.css. Reference page: review/direction-final.html.
  - Screenshots: `node scripts/shoot-directions.mjs [a b c final]` (needs `npx vite` running) → review/screenshots/. It also flags horizontal overflow.
  - Not yet built: the three.js hero shader (the reference uses a photo with CSS/GSAP depth), GSAP Flip filtering, the real site in index.html.
- Part 4 (all sections, layout only): DONE (awaiting review).
  - Real site in index.html + src/main.js; modules in src/modules (sections, card, detail, explore, map, gallery, state, util); styles in base/components/sections.css.
  - Chapters (confirmed in review): I Coast · II Gods · III Ghats · IV The Old Stones (heritage) · V The Table · VI The Plan.
    Numbering lives in CHAPTERS in src/modules/util.js.
  - Brief overrides applied: "Dec–Jan verdict" filter → "Good right now" + best-in-month; weekend planner → the 15 Trip Ideas timeline;
    Dec–Jan festival strip → year-round 12-month calendar starting this month, with "Coming up" (next 75 days) and Worth Watching.
  - Filters: sticky bar of dropdowns on desktop, bottom sheet on phone; apply to grid and map. Deep link /#place-<id>. Been there + My List in localStorage.
  - Map: OSM standard tiles darkened with a CSS filter (CARTO dark tiles now need an API key), leaflet.markercluster, lazy-loaded.
  - New data: src/data/practical.json (hand-authored, sourced: Konkan Railway monsoon timetable, 60-day ARP, Karnataka pillion helmet rule, Udupi rainfall).
  - Screenshots: `BASE=http://localhost:5173/manipal-explorer/ node scripts/shoot-site.mjs [390 375 1440]` → review/screenshots/site/<vp>/. Also reports overflow + console errors.
  - Pending for Part 5/6: motion (GSAP/Lenis/SplitText, pinned openers, Flip), hero WebGL shader in [data-shader-slot], custom cursor;
    remaining perf work (Lighthouse pass, images, fonts).
  - Review round 1: chapter numbering confirmed. places.json + image-credits.json now load as separate hashed JSON files
    (src/modules/data.js, `?url` imports; main.js renders after loadData()). Main JS bundle 593 kB → 183 kB (54 kB gzip).
    The smaller JSON files (trips, festivals, food, worthWatching, practical) are still inlined.
- Part 5 (motion): DONE (awaiting review).
  - src/modules/motion.js (GSAP + ScrollTrigger + SplitText + Flip + Lenis) loads as its own chunk in parallel with the data; site works if it fails.
    src/modules/shader.js (three.js, lazy, after the intro); src/modules/spring.js (phone bottom sheet); src/styles/motion.css.
  - Intro: title card + place counter between letterbox bars, ≈2.45 s, once per session (sessionStorage), skipped on deep links,
    skip button / any key, click, wheel or touch. Inline flag script in index.html.
  - Hero shader: domain-warped sea in the palette over the photo; cursor lens (desktop), scroll swell (phone); paused off-screen/hidden tab;
    DPR ≤ 2 then rendered at 0.4–0.55 scale; static CSS gradient if WebGL fails, context is lost, or reduced motion.
  - Scroll: Lenis (wheel only; phones keep native momentum), split-word headlines, card reveals (ink curtain + photo settle, CSS transform/opacity),
    fade-ups, hero parallax, chapter openers pinned on desktop (numeral forward, Gods arch opens), numeral parallax + arch open on phone.
  - Filters: GSAP Flip on desktop; phones get a staggered rise (Flip measured too heavy there). Count rolls.
  - Desktop: cursor (dot / ring over links / saffron "View" over photos), magnetic buttons, card tilt ≤ 5°. Grain flickers, pauses while scrolling.
  - Phone: spring bottom sheet (drag, rubber band, velocity-carrying release), carousel thumb + photo parallax, star burst, check draw, haptic tick (Android).
  - Reduced motion: no intro, shader, Lenis, ScrollTrigger, splits, cursor; opacity fades only.
  - Perf: `BASE=… node scripts/measure-motion.mjs [mobile desktop] [--frames]` (390 px @2x, 4× CPU, fast 4G). Results: review/screenshots/motion/measure.txt.
    Simplified after measuring: CSS reveal states instead of gsap.set (−1 s), compositor-only card reveal (chapter scroll drops 12 % → 2 %),
    lag smoothing + intro played after first paint, IO observation and splits deferred past the intro, phone Flip → fade,
    content-visibility on phone grid cards, shader 5 → 3 fbm calls + highp/sine hash (no seams), grain paused while scrolling.
  - Known: the Part 4 first render is a ~1.7 s long task on a 4× throttled phone (107 cards built at once); worth chunking in Part 6.
    Headless runs show occasional ~500 ms compositor stalls with no main-thread work; check on a real iPhone.

- Part 6 (QA and ship): DONE (awaiting review).
  - Part 5 open items: Explore grid builds 8 cards with the page, the rest in idle-time batches (filters run on data).
    Header + hero render before places.json from a build-time summary (`virtual:hero-data` in vite.config.js);
    other sections render one per task once data is in (after the intro on a first visit). Entry JS 55 kB → 5 kB gzip.
    Repeat-visit title rise is CSS (`.hero-rise`). content-visibility below the map and on phone carousel cards.
    Long names no longer spill: card photo + text share one grid cell. Desktop grid scroll 56–58 fps (was ~48).
    Throttled phone: first-render long task 2.7 s → 1.0 s; intro 9 → 55 fps; LCP (slow 4G, 4× CPU) ~4 s → 1.3–1.6 s.
  - QA scripts (need `npx vite preview` and BASE): scripts/qa.mjs (6 viewports), a11y.mjs (axe + full keyboard walk),
    modes.mjs (reduced motion, WebGL off), lighthouse.mjs (median of N). Reports in review/qa and review/lighthouse.
  - Fixed: tap targets (44 px touch, ≥24 px inline credits), explored-link accessible name, reveal blocks no longer
    `visibility: hidden` (Tab skipped The Table/The Plan), phone menu (Menu button → section links), nav landing on
    content-visibility sections, header opaque when solid, saffron limited to month marker / Good-now chip / CTA / focus.
  - Independent review (19 issues) fixed: Dharmasthala timings to the official routine (confidence partial); Kukke
    timings relabelled third-party (site says it isn't official) + itms portal; trips now carry sources
    (places + named eateries + OSRM route); Kumara Parvatha / Kudremukh route status made consistent + verify locally;
    Kambala 2026–27 list complete (27 fixtures, v4news 12 Nov 2026); Kollur trip safety; Diana/Pabbas labelled
    "Ice-cream stop · mixed menu"; credit links (null licence URL, &amp; in 49 author URLs); trip titles are h3;
    festival dates outside their month column read "Next: …"; unmapped places listed under the map; gradart/arch tokens.
  - Lighthouse on the live site (median of 3, 25 Nov 2026; review/lighthouse/summary.txt):
    desktop Performance 90 · Accessibility 100 · Best Practices 100 · SEO 100;
    mobile Performance 69 (runs 61/69/80) · Accessibility 100 · Best Practices 100 · SEO 100.
    Mobile misses the ≥ 90 target: LCP is 1.8 s, but Total Blocking Time (~1.2 s) and Speed Index (~6 s, the
    first-visit intro holds the screen ~2.5 s) pull it down. Runs were on a loaded laptop; PageSpeed Insights'
    free quota was used up, so re-check there. OPEN: decide how to reach 90 on mobile (see final report).
  - Not verified on a real iPhone (no notes were given). Open: 4 places lack coordinates; 33 festivals have no
    confirmed date yet; real-device check of the 500 ms compositor stalls seen headless.
