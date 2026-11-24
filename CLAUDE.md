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

## Art direction (default; may be refined in Part 3)
- Concept: "Konkan Chronicles". The site reads like a cinematic travel film told in chapters:
  I. The Coast · II. The Gods · III. The Ghats · IV. The Table · V. The Plan
- Palette:
  ink #0B0F0E, deep sea #0E3B3A, monsoon teal #1F6F6B, saffron #F29B38, laterite #B4532A, palm #4F7A3A, sand #EDE3D1, bone #F7F3EA
- Type: one dramatic display face (high-contrast serif or condensed grotesk, self-hosted) + one clean sans for body. Fluid type scale with clamp(). Huge headlines, generous whitespace, editorial grids.
- Motion: purposeful, physical and smooth. Custom easing (no default ease-in-out). Split-text reveals, clip-path image reveals, parallax depth, pinned chapters, GSAP Flip for filtering. Nothing moves without a reason.
- Texture: subtle film grain, soft glows. Glassmorphism only where it earns its place.
- Desktop extras: custom cursor that morphs over media, magnetic buttons, subtle card tilt.
- Mobile: no custom cursor, swipe carousels, bottom-sheet details, thumb-reachable controls.
- Quality bar: Active Theory, Locomotive, Resn, Awwwards Site of the Day. Designed by someone with 20+ years of experience.

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
- Part 2 (images): DONE (awaiting review of weak/missing list).
  - 131 Wikimedia Commons images (CC0 / PD / CC BY / CC BY-SA only) for 91 of 107 places; all 10 mustDo have 5.
  - Pipeline: `node scripts/fetch-images.mjs [ids]` → `node scripts/optimise-images.mjs` → `node scripts/build-image-review.mjs`.
    Masters cache in `.cache/` (gitignored). Outputs: public/images/places/<id>/<pageid>-{480,960,1600}.{avif,webp}, EXIF stripped.
  - src/data/image-credits.json: author, licence, licence URL, source page, alt, aspect, dominant colour, blur placeholder.
    Each place's `images` = ordered credit ids (hero first); build-data.mjs now keeps them on rebuild.
  - Swap an image: edit research/raw/image-queries.mjs (`reject` / `pick` / `exclude` / `review` notes), rerun the pipeline.
  - Every pick was checked by eye; filters reject fish/seafood subjects, foreign namesakes, signboards, 3D pairs, flora/fauna close-ups.
  - 16 places have no acceptable image (site uses the typographic gradient card): see review/images.html (red).
  - Contact sheet: `npx vite` → http://localhost:5173/manipal-explorer/review/images.html
