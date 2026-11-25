# Manipal Explorer 🌊🛕⛰️

Everything worth a ride from Manipal, in one place. Beaches, temples, waterfalls, forts and a lot of very good vegetarian food, told like a film in six chapters.

**👉 Open it: [harshmimani.github.io/manipal-explorer](https://harshmimani.github.io/manipal-explorer/)**

Works on a phone, works on a laptop, works any month of the year.

---

## What's inside

**107 places**, sorted into chapters. *I. The Coast* (sand, sunsets, the odd island). *II. The Gods* (temples, with darshan timings, dress code and where the free meal is). *III. The Ghats* (waterfalls, treks, hairpin bends). *IV. The Old Stones* (forts, Jain basadis, carved pillars).

**🍛 V. The Table.** A proudly vegetarian food guide. 14 dishes, 16 places to eat them, and 6 temples that will feed you lunch for nothing. Famous ghee roast? You get the paneer and mushroom versions, and we say so.

**🏍️ VI. The Plan.** 15 ready-made trips, from a lazy beach afternoon to a three-day ride-and-trek up Kumara Parvatha. Each one says bike or train, the stops in order, where to eat, the best season, and what to pack.

**🥁 Festivals.** A year-round calendar that starts from *this* month. Plus 15 spectacles **Worth Watching**, like the Kambala buffalo races and a Bahubali statue that gets bathed in milk once every 12 years.

**And a few handy tricks:**

- ⭐ **My List**: star places to build your own shortlist.
- ✅ **Been There**: tick off where you've already been.
- 🌦️ **Good Right Now**: shows what's in its best season today. In the monsoon the waterfalls roar and the sea turns rough. The site knows.
- 🗺️ A map of everything, and a safety note wherever a road, rock or rip current deserves one.

Everything is saved on your own device. No sign-up, no ads.

---

## How it was built 🎬

It started with one rule: **no guessing.** Every timing, distance and date comes with a source link. If it couldn't be confirmed, it says *Verify locally* rather than making something up.

**1. The research.** 107 places, each one checked against temple websites, forest department portals, railway timetables and news reports. That's 700-odd source links. Distances are real road kilometres from Tiger Circle, worked out by a routing engine, not a ruler on a map.

**2. Hunting the photos.** Every picture is free-licensed from Wikimedia Commons and credited to the person who took it. Finding the right ones was half the fun:

- 🇨🇦 A search for *Delta Beach* kept serving up a lake beach in Manitoba, Canada. Wrong Delta.
- 🇱🇻 *Barkana* falls, near Agumbe, came back as a street in Latvia.
- 🐟 One photo came with a side of mackerel. This is a vegetarian guide. The mackerel had to go.

The fix: filters that turn away foreign namesakes, fish, signboards and close-ups of spiders. Then every survivor got checked by eye. Final count: **128 photos by 101 photographers**, covering 88 places. The rest get a clean typographic card instead of a bad photo.

**3. Picking the look.** Three designs went head to head: a cinematic film, a route card, and a monsoon almanac. The film won and took the best bits of the other two. Dark ink, saffron and teal, a serif with attitude. Temple arches appear only in the temples chapter, because that's where they belong.

**4. Building it.** Every section, every filter, every card. Tap a place and its details slide up from the bottom on a phone, or in from the side on a laptop.

**5. Making it move.** 🌊 The hero isn't a video. It's a live WebGL ocean, painted in the site's own colours, that ripples under your cursor (or swells as you scroll on a phone). Chapter titles rise word by word, photos wipe in, and the whole thing opens with letterbox bars like the start of a film. All of it switches off if your phone asks for reduced motion.

**6. Testing it hard.** Six screen sizes, a full keyboard-only walkthrough, accessibility scans, and Lighthouse runs on a deliberately slowed-down phone. Phone score: **98** for speed and **100** for accessibility. An independent review found 19 issues. All 19 got fixed.

The whole thing was built with [Claude Code](https://claude.com/claude-code), one part at a time, with a human reviewing every step.

---

## Credits 🙏

**Created by Harsh Mimani.** Say hi on [LinkedIn](https://www.linkedin.com/in/harsh-mimani/).

**Photos:** 101 Wikimedia Commons photographers, under CC0, public domain, CC BY and CC BY-SA licences. Each photo is credited by name, with a link to the original, in the site footer and in [`src/data/image-credits.json`](src/data/image-credits.json).

**Data:** temple and forest department websites, Konkan Railway, Karnataka tourism, local news and more. Every fact links to its source in the site footer and in [`src/data/`](src/data/). Maps and routing by OpenStreetMap contributors, OSRM and Nominatim.

**Type:** Instrument Serif and Hanken Grotesk (SIL Open Font License).

Timings change and temples have their own calendars. If something's out of date, the site tells you to verify locally. Please do. 🙂

---

## For developers 🛠️

Stack: Vite + vanilla JS modules, GSAP (ScrollTrigger, SplitText, Flip), Lenis, three.js (the hero shader only), Leaflet. All content lives in `src/data/*.json`. The full brief and build log are in [CLAUDE.md](CLAUDE.md); research notes are in [research/report.md](research/report.md).

### Run it locally

You need Node 20 or newer.

```powershell
npm install
npm run dev
```

Open http://localhost:5173/manipal-explorer/ (the `/manipal-explorer/` base path matches GitHub Pages).

To check the production build:

```powershell
npm run build
npx vite preview
```

Then open http://localhost:4173/manipal-explorer/.

### Add or edit a place

Every place is one object in `src/data/places.json`. The site reads it at runtime, so an edit there shows up on the next reload. That file is generated, though: `node scripts/build-data.mjs` rebuilds it from `research/raw/`. Pick the route that fits.

**Quick fix (a typo, a new timing):** edit `src/data/places.json` directly. Make the same change in `research/raw/` too, or the next rebuild undoes it.

**Lasting change (the normal way):**

1. Find the place in its region file, `research/raw/<region>.json`. The regions are `udupi-manipal`, `kundapura-byndoor`, `mangaluru-kasaragod`, `dharmasthala-kukke`, `malnad` and `uttara-kannada-goa`. To add a place, copy an existing object and change `id` (kebab-case, unique), `name`, `chapter` (`coast`, `gods`, `ghats` or `heritage`), and the rest.
2. Season goes in `research/raw/seasons.mjs`: `'<id>': [[best months 1–12], 'season note, including the monsoon']`. Every place needs an entry, or the build stops.
3. Small corrections to a place you didn't research yourself go in `research/raw/overrides.mjs`. That covers whole fields, `textFix` (exact text replacement) and `addSources`.
4. Rebuild:

   ```powershell
   node scripts/recompute-routes.mjs
   ```

   ```powershell
   node scripts/build-data.mjs
   ```

   ```powershell
   node scripts/build-trips.mjs
   ```

   `recompute-routes` asks the public OSRM server for road km and ride time from Tiger Circle; skip it if no coordinates changed. `build-trips` re-routes the trip loops and gathers each trip's sources.

Rules for every fact (from the brief):

- **Sources:** every timing, price, distance, permit or date needs a source URL in `sources`. If you can't confirm something, write `null` or say "verify locally". Never guess.
- **Veg only:** no meat, fish or egg dishes, and no non-veg-focused restaurants. For a dish that is famous in non-veg form, list only the veg version and say so.
- **Temples:** fill in `temple.darshanTimings`, `temple.dressCode` and `temple.annadana`.
- **Safety:** say what's risky (ghat roads, night riding, wet rocks, rip currents, anything prohibited) in `safety`.

Other content files, all in `src/data/`: `food.json` (dishes, eateries, temple meals), `tripIdeas.json` (built from `research/raw/trips.mjs`), `festivals.json` (built from `research/raw/festivals-year.json`), `worthWatching.json`, `practical.json` (hand-written), and `image-credits.json` (generated, see below).

### Images

Photos come only from Wikimedia Commons under CC0, public domain, CC BY or CC BY-SA. They are downloaded, re-encoded and stored in the repo with credits. Nothing is hotlinked.

```powershell
node scripts/fetch-images.mjs
```

```powershell
node scripts/optimise-images.mjs
```

```powershell
node scripts/build-image-review.mjs
```

- `fetch-images` searches Commons, checks each licence and writes `src/data/image-credits.json`. The full-size originals are cached in `.cache/`, which is gitignored. Pass place ids to redo only those places, for example `node scripts/fetch-images.mjs bekal-fort st-marys-island`.
- `optimise-images` writes `public/images/places/<id>/<pageid>-{480,960,1600}.{avif,webp}` and strips the EXIF data.
- `build-image-review` builds a contact sheet at `/manipal-explorer/review/images.html` (open it with `npm run dev` running).
- To swap or drop an image, edit that place's entry in `research/raw/image-queries.mjs`. Use `reject` to drop a file, `pick` to force one, `exclude` to block words, or `gradient: true` for the typographic card. Then rerun the three scripts and `node scripts/build-data.mjs`, which keeps the image links.
- The hero photo is set by `HERO_IMAGE` in `vite.config.js` and `hero()` in `src/modules/hero.js`. Change both together.

### Quality checks

Start `npx vite preview` (or `npm run dev`) first, and set `BASE` to its URL, for example `$env:BASE='http://localhost:4173/manipal-explorer/'` in PowerShell.

| Script | What it checks |
| --- | --- |
| `node scripts/qa.mjs` | Six viewports (375 to 1920 px): horizontal overflow, card text spilling off its photo, clipped text, broken images, tap targets (44 px on touch), the place detail panel |
| `node scripts/a11y.mjs` | axe-core on every section, the detail panel and the filters, plus a full keyboard walk |
| `node scripts/modes.mjs` | Reduced motion and WebGL turned off |
| `node scripts/lighthouse.mjs 3` | Lighthouse on mobile and desktop; keeps the median of 3 runs in `review/lighthouse/` |
| `node scripts/measure-motion.mjs` | Frame rate and long tasks on a throttled phone and on a laptop |
| `node scripts/shoot-site.mjs` | Section-by-section screenshots in `review/screenshots/site/` |

Reports go to `review/qa/` and `review/lighthouse/`.

### Deployment

Every push to `main` deploys to GitHub Pages through [.github/workflows/deploy.yml](.github/workflows/deploy.yml). The workflow runs `npm ci` and `npm run build`, then publishes `dist/`. A deploy takes about a minute; follow it with `gh run watch`. The Vite `base` is `/manipal-explorer/`, so if the repo is renamed, change `BASE` in `vite.config.js` to match.

### How the page loads

The header and hero render straight away from a small summary built at compile time (`virtual:hero-data` in `vite.config.js`), so the headline doesn't wait for the place data. The place data and image credits are hashed JSON files, preloaded from the HTML. Once the data is in (after the intro on a first visit, about 1 s on phones), the Top 10 renders; every section below it starts as a screen-tall placeholder with the section's id and renders when you scroll within about a screen and a half of it, always in page order (`src/modules/rest.js`). Links to a section, keyboard focus, Ctrl/Cmd+F and printing render everything they need first. Under `prefers-reduced-motion` there's no intro, smooth scrolling, WebGL or split text: content just fades in.
