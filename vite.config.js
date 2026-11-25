import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const BASE = '/manipal-explorer/';
// Keep in step with hero() in src/modules/sections.js.
const HERO_IMAGE = 'st-marys-island/73902011';

// The first render waits for places.json, image-credits.json and the motion
// chunk, which main.js only discovers after it has run. Preloading them from the
// HTML starts all four downloads at once. The hero photo is preloaded too, at
// the same srcset/sizes the <picture> uses, so it never waits on the data.
function preloadCritical() {
  return {
    name: 'preload-critical',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        const tags = [];
        // Fonts the hero uses first (Latin subsets): high priority, so the title
        // doesn't wait for the CSS to be parsed to discover them. Data and the
        // motion chunk go at low priority so they don't slow the main bundle.
        for (const f of Object.keys(ctx.bundle ?? {})) {
          if (/^assets\/(instrument-serif-latin-400-(normal|italic)|hanken-grotesk-latin-wght-normal)-[\w-]+\.woff2$/.test(f)) tags.push({ tag: 'link', attrs: { rel: 'preload', as: 'font', type: 'font/woff2', href: BASE + f, crossorigin: 'anonymous' }, injectTo: 'head' });
          if (/^assets\/(places|image-credits)-[\w-]+\.json$/.test(f)) tags.push({ tag: 'link', attrs: { rel: 'preload', as: 'fetch', href: BASE + f, crossorigin: 'anonymous', fetchpriority: 'low' }, injectTo: 'head' });
          if (/^assets\/motion-[\w-]+\.js$/.test(f)) tags.push({ tag: 'link', attrs: { rel: 'modulepreload', href: BASE + f, fetchpriority: 'low' }, injectTo: 'head' });
        }
        const c = JSON.parse(readFileSync(new URL('./src/data/image-credits.json', import.meta.url), 'utf8'))[HERO_IMAGE];
        if (c) {
          tags.push({ tag: 'link', attrs: { rel: 'preload', as: 'image', type: 'image/avif', fetchpriority: 'high', imagesizes: '100vw',
            imagesrcset: c.widths.map((w) => `${BASE}${c.file}-${w}.avif ${w}w`).join(', ') }, injectTo: 'head' });
        }
        return tags;
      },
    },
  };
}

// virtual:hero-data: the few numbers the hero needs (place count, how many are in
// season each month, the hero photo's credit), so the header and hero render
// straight away instead of waiting for places.json.
function heroData() {
  const ID = 'virtual:hero-data', RID = '\0' + ID;
  return {
    name: 'hero-data',
    resolveId: (id) => (id === ID ? RID : null),
    load(id) {
      if (id !== RID) return null;
      const read = (f) => { const u = new URL(`./src/data/${f}`, import.meta.url); this.addWatchFile(fileURLToPath(u)); return JSON.parse(readFileSync(u, 'utf8')); };
      const places = read('places.json');
      const credits = read('image-credits.json');
      // Same rule as isGoodNow(): a real season (not all year) that includes the month.
      const monthCounts = Array.from({ length: 12 }, (_, i) => places.filter((p) => Array.isArray(p.bestMonths) && p.bestMonths.length < 12 && p.bestMonths.includes(i + 1)).length);
      const credit = credits[HERO_IMAGE];
      const placeName = places.find((p) => p.id === credit.placeId)?.name ?? '';
      return `export default ${JSON.stringify({ count: places.length, monthCounts, credit, placeName, trips: read('tripIdeas.json').length, festivals: read('festivals.json').length })};`;
    },
  };
}

export default defineConfig({
  base: BASE,
  plugins: [heroData(), preloadCritical()],
});
