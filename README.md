# Manipal Explorer

A cinematic, evergreen, vegetarian travel and food guide to everything around Manipal and Udupi: 107 places in four chapters (Coast, Gods, Ghats, Old Stones), the food, 15 ready-made trips, a year-round festival calendar and the practical bits.

- Live: https://harshmimani.github.io/manipal-explorer/
- Brief and progress log: [CLAUDE.md](CLAUDE.md). Research notes: [research/report.md](research/report.md).

Stack: Vite + vanilla JS modules, GSAP (ScrollTrigger, SplitText, Flip), Lenis, three.js (the hero shader only), Leaflet. All content lives in `src/data/*.json`.

## Run it locally

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

## Add or edit a place

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

## Images

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

## Quality checks

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

## Deployment

Every push to `main` deploys to GitHub Pages through [.github/workflows/deploy.yml](.github/workflows/deploy.yml). The workflow runs `npm ci` and `npm run build`, then publishes `dist/`. A deploy takes about a minute; follow it with `gh run watch`. The Vite `base` is `/manipal-explorer/`, so if the repo is renamed, change `BASE` in `vite.config.js` to match.

## How the page loads

The header and hero render straight away from a small summary built at compile time (`virtual:hero-data` in `vite.config.js`), so the headline doesn't wait for the place data. The place data and image credits are hashed JSON files, preloaded from the HTML. Every other section renders one per task once the data is in (after the intro on a first visit). Content below the map skips layout until it nears the screen. Under `prefers-reduced-motion` there's no intro, smooth scrolling, WebGL or split text: content just fades in.
