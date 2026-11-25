// Section-by-section Playwright screenshots of the real site (Part 4 review).
// Usage: start Vite, then: BASE=http://localhost:5173/manipal-explorer/ node scripts/shoot-site.mjs [390 375 1440]
// Output: review/screenshots/site/<viewport>/<nn>-<section>.png, plus a report of
// horizontal overflow and console errors per viewport.
import { chromium } from 'playwright';
import { mkdir, rm } from 'node:fs/promises';

const BASE = process.env.BASE || 'http://localhost:5173/manipal-explorer/';
const ALL = {
  390: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  375: { width: 375, height: 667, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  1440: { width: 1440, height: 900, deviceScaleFactor: 1 },
};
const want = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(ALL);

const SECTIONS = [
  ['01-hero', '#top'], ['02-must-do', '#must-do'], ['03-coast', '#ch-coast'], ['04-gods', '#ch-gods'], ['05-ghats', '#ch-ghats'],
  ['06-heritage', '#ch-heritage'], ['07-explore', '#explore'], ['08-map', '#map'], ['09-table', '#ch-table'], ['10-plan', '#plan'],
  ['11-festivals', '#festivals'], ['12-practical', '#practical'], ['13-footer', '#credits'],
];
const MAX_H = 5200; // long sections are cropped to their top part

const overflowCheck = () => {
  const vw = document.documentElement.clientWidth;
  const bad = [];
  for (const e of document.querySelectorAll('body *')) {
    if (e.closest('[aria-hidden="true"], .leaflet-container, .detail[hidden]')) continue;
    let clipped = false;
    for (let a = e.parentElement; a && a !== document.body; a = a.parentElement) {
      if (/auto|scroll|hidden|clip/.test(getComputedStyle(a).overflowX)) { clipped = true; break; }
    }
    if (clipped) continue;
    const r = e.getBoundingClientRect();
    if (r.width && r.right > vw + 1) bad.push(`${e.tagName.toLowerCase()}.${[...e.classList].join('.')} → ${Math.round(r.right - vw)}px`);
  }
  return { docOverflow: document.documentElement.scrollWidth - vw, bad: bad.slice(0, 8) };
};

const browser = await chromium.launch();
for (const name of want) {
  const vp = ALL[name];
  const dir = `review/screenshots/site/${name}`;
  await rm(dir, { recursive: true, force: true });
  await mkdir(dir, { recursive: true });
  const ctx = await browser.newContext({ ...vp, viewport: { width: vp.width, height: vp.height } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.addInitScript(() => addEventListener('DOMContentLoaded', () => { document.documentElement.style.scrollBehavior = 'auto'; }));
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  // Part 5: wait for the intro to finish (scroll is locked during it).
  await page.waitForFunction(() => !document.querySelector('[data-intro]'), null, { timeout: 15000 });
  await page.waitForTimeout(600);
  // Load every lazy image (and the map) by walking the page; the walk also fires
  // the scroll reveals, which only play as things enter the viewport.
  await page.evaluate(async () => {
    document.querySelectorAll('img[loading="lazy"]').forEach((i) => { i.loading = 'eager'; });
    for (let y = 0; y < document.body.scrollHeight; y += innerHeight * 0.8) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 140)); }
    await Promise.all([...document.images].map((i) => (i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; }))));
    scrollTo(0, 0);
  });
  await page.waitForTimeout(2600); // map tiles + reveal transitions

  for (const [file, sel] of SECTIONS) {
    const el = page.locator(sel).first();
    if (file === '01-hero') { await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(250); await page.screenshot({ path: `${dir}/${file}.png` }); continue; }
    if (file === '02-must-do' && vp.width >= 1000) {
      // Pinned gallery: capture the viewport at the start and two-thirds through the pin.
      for (const [suffix, frac] of [['a', 0], ['b', 0.66]]) {
        await page.evaluate(([s, f]) => { const x = document.querySelector(s); scrollTo({ top: x.offsetTop + f * (x.offsetHeight - innerHeight), behavior: 'instant' }); }, [sel, frac]);
        await page.waitForTimeout(250);
        await page.screenshot({ path: `${dir}/${file}-${suffix}.png` });
      }
      continue;
    }
    const box = await el.boundingBox();
    if (!box) continue;
    await page.evaluate((s) => { const x = document.querySelector(s); scrollTo({ top: x.getBoundingClientRect().top + scrollY, behavior: 'instant' }); }, sel);
    await page.waitForTimeout(200);
    const top = await page.evaluate((s) => document.querySelector(s).getBoundingClientRect().top + scrollY, sel);
    const h = Math.min(box.height, MAX_H);
    // Full-page clips repaint fixed layers at odd offsets; hide them for section shots.
    await page.addStyleTag({ content: '.site-head,.skip{visibility:hidden!important}' }).then((t) => t.evaluate((n) => n.setAttribute('data-shot', '')));
    await page.screenshot({ path: `${dir}/${file}.png`, fullPage: true, clip: { x: 0, y: top, width: vp.width, height: h } });
    await page.evaluate(() => document.querySelectorAll('style[data-shot]').forEach((n) => n.remove()));
  }

  // Interactions: detail via deep link, filter sheet (phone), trip expanded, festival calendar.
  await page.goto(`${BASE}#place-kollur-mookambika-temple`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${dir}/14-detail-open.png` });
  await page.evaluate(() => { const s = document.querySelector('[data-scroll]'); s.scrollTop = s.scrollHeight * 0.45; });
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${dir}/15-detail-scrolled.png` });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  await page.evaluate(() => scrollTo({ top: document.querySelector('#explore').offsetTop + 200, behavior: 'instant' }));
  await page.waitForTimeout(200);
  if (vp.width < 1000) {
    await page.click('[data-filters-open]');
    await page.click('.fchip:has(input[value="gods"])');
    await page.click('.fchip:has(input[value="near"])');
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${dir}/16-filters-sheet.png` });
    await page.click('[data-filters-close]');
  } else {
    await page.click('[data-fgroup="chapter"] summary');
    await page.click('.fchip:has(input[value="gods"])');
    await page.click('[data-fgroup="dist"] summary');
    await page.click('.fchip:has(input[value="near"])');
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${dir}/16-filters-bar.png` });
  }
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${dir}/17-filtered-grid.png` });

  await page.evaluate(() => { document.querySelector('#trip-udupi-temple-circuit details').open = true; document.querySelector('#trip-udupi-temple-circuit').scrollIntoView(); scrollBy(0, -80); });
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${dir}/18-trip-open.png` });

  const ov = await page.evaluate(overflowCheck);
  console.log(`${name}: docOverflow=${ov.docOverflow}px`, ov.bad.length ? ov.bad : 'no element overflow', errors.length ? errors : 'no errors');
  await ctx.close();
}
await browser.close();
