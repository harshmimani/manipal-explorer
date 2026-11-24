// Full-page Playwright screenshots of the Part 3 art-direction explorations.
// Usage: start Vite (npx vite), then: node scripts/shoot-directions.mjs [a b c]
// Output: review/screenshots/direction-<x>-<390|1440>.png
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const BASE = process.env.BASE || 'http://localhost:5173/manipal-explorer/review';
const ids = process.argv.slice(2).length ? process.argv.slice(2) : ['a', 'b', 'c'];
const viewports = [
  { name: '390', width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  { name: '1440', width: 1440, height: 900, deviceScaleFactor: 1 },
];

await mkdir('review/screenshots', { recursive: true });
const browser = await chromium.launch();
for (const vp of viewports) {
  // Reduced motion so every reveal is in its final state when captured.
  const ctx = await browser.newContext({ ...vp, viewport: { width: vp.width, height: vp.height }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  for (const id of ids) {
    await page.goto(`${BASE}/direction-${id}.html`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    // Scroll the page through so lazy images load, then wait for every image.
    await page.evaluate(async () => {
      document.querySelectorAll('img[loading="lazy"]').forEach((i) => { i.loading = 'eager'; });
      for (let y = 0; y < document.body.scrollHeight; y += innerHeight / 2) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
      scrollTo(0, 0);
      await Promise.all([...document.images].map((i) => i.complete && i.naturalWidth ? 0 : new Promise((r) => { i.onload = i.onerror = r; })));
    });
    const overflow = await page.evaluate(() => Math.max(...[...document.querySelectorAll("body *")].filter((e) => !e.closest("[aria-hidden=true]")).map((e) => e.getBoundingClientRect().right)) - window.innerWidth);
    const file = `review/screenshots/direction-${id}-${vp.name}.png`;
    await page.screenshot({ path: file, fullPage: true });
    console.log(file, overflow > 0 ? `HORIZONTAL OVERFLOW ${overflow}px` : 'no overflow', errors.length ? errors : '');
    errors.length = 0;
  }
  await ctx.close();
}
await browser.close();
