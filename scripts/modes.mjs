// Part 6: reduced-motion and WebGL-disabled checks.
// Usage: start Vite, then: BASE=http://localhost:5173/manipal-explorer/ node scripts/modes.mjs
// Reduced motion (390 and 1440): no intro, no smooth scroll, no WebGL, no split
// headlines, nothing left hidden once scrolled past, place detail and filters work.
// WebGL off (Chromium with 3D APIs disabled): the hero falls back to the static
// gradient, the intro still plays and ends, no errors.
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const BASE = process.env.BASE || 'http://localhost:5173/manipal-explorer/';
await mkdir('review/qa', { recursive: true });
const fails = [];
const check = (ok, msg) => { console.log(`${ok ? '  ok ' : '  FAIL'} ${msg}`); if (!ok) fails.push(msg); };

async function visit(browser, label, ctxOpts, fn) {
  console.log(`\n── ${label}`);
  const ctx = await browser.newContext(ctxOpts);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await fn(page);
  check(!errors.length, `no page errors${errors.length ? `: ${errors.slice(0, 3).join(' | ')}` : ''}`);
  await ctx.close();
}

// Scroll the page top to bottom (as a reader would), then report anything still
// invisible that should have been revealed.
const walk = (page) => page.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += innerHeight * 0.7) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); }
  await new Promise((r) => setTimeout(r, 800));
  const isHidden = (e) => {
    if (e.closest('[hidden], [aria-hidden="true"], .detail, .filters, .leaflet-container, details:not([open]) > :not(summary)')) return false;
    const s = getComputedStyle(e); const r = e.getBoundingClientRect();
    let o = 1; for (let a = e; a && a !== document.body; a = a.parentElement) o *= parseFloat(getComputedStyle(a).opacity);
    return r.width > 0 && r.height > 0 && (o < 0.05 || s.visibility === 'hidden') && e.textContent.trim();
  };
  // Anything still hidden is brought into view, as a reader swiping a carousel
  // would, and checked again.
  const left = [];
  for (const e of [...document.querySelectorAll('main *, footer *')].filter(isHidden)) {
    if (!isHidden(e)) continue;
    e.scrollIntoView({ block: 'center', inline: 'center' });
    await new Promise((r) => setTimeout(r, 2600)); // card reveals run up to ~1.9 s with stagger
    if (isHidden(e)) left.push(e);
    if (left.length > 4) break;
  }
  return left.map((e) => `${e.tagName.toLowerCase()}.${[...e.classList].join('.')} [${e.closest('[data-place]')?.dataset.place ?? e.closest('section')?.id}]`);
});

// Sections render as the reader nears them (rest.js): scroll down until all are in.
const renderAll = async (page) => {
  await page.waitForFunction(() => !document.querySelector('[data-intro]') && document.getElementById('must-do'), null, { timeout: 20000 });
  for (let pass = 0; pass < 8 && await page.evaluate(() => !!document.querySelector('[data-lazy]')); pass++) {
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += innerHeight * 0.8) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } });
  }
  await page.waitForFunction(() => document.querySelectorAll('#explore .card').length > 100, null, { timeout: 20000 });
  await page.evaluate(() => scrollTo(0, 0));
};

const browser = await chromium.launch();
for (const [w, h, mobile] of [[390, 844, true], [1440, 900, false]]) {
  await visit(browser, `reduced motion ${w}`, { viewport: { width: w, height: h }, isMobile: mobile, hasTouch: mobile, reducedMotion: 'reduce' }, async (page) => {
    await page.goto(BASE, { waitUntil: 'load' });
    await renderAll(page);
    const st = await page.evaluate(() => ({
      intro: !!document.querySelector('[data-intro]') && getComputedStyle(document.querySelector('[data-intro]')).display !== 'none',
      isIntro: document.documentElement.classList.contains('is-intro'),
      lenis: document.documentElement.classList.contains('lenis'),
      canvas: !!document.querySelector('[data-shader-slot] canvas'),
      staticShader: document.querySelector('[data-shader-slot]').classList.contains('is-static'),
      split: document.querySelectorAll('.head h2 div, .head h2 .word').length,
      titleTf: getComputedStyle(document.querySelector('.hero h1 .ln > span')).transform,
      titleAnim: getComputedStyle(document.querySelector('.hero h1 .ln > span')).animationName,
      cursor: !!document.querySelector('.cursor:not([hidden])') && getComputedStyle(document.querySelector('.cursor')).display !== 'none',
    }));
    check(!st.intro && !st.isIntro, 'no intro');
    check(!st.lenis, 'native scrolling (no Lenis)');
    check(!st.canvas && st.staticShader, 'no WebGL; static hero gradient');
    check(st.split === 0, 'headlines not split');
    check(st.titleTf === 'none' && st.titleAnim === 'none', 'hero title at rest, not animated');
    check(!st.cursor, 'no custom cursor');
    const hidden = await walk(page);
    check(!hidden.length, `everything visible after scrolling${hidden.length ? `: ${hidden.join(', ')}` : ''}`);
    // Detail and filters still work.
    await page.evaluate(() => document.querySelector('#explore .card h3 a').click());
    await page.waitForTimeout(500);
    check(await page.evaluate(() => document.querySelector('.detail')?.classList.contains('is-open') && !!document.activeElement.closest('.detail')), 'card opens the place detail with focus inside');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    await page.evaluate(() => { const i = document.querySelector('input[name="chapter"][value="gods"]'); i.checked = true; i.dispatchEvent(new Event('change', { bubbles: true })); });
    await page.waitForTimeout(300);
    const n = await page.evaluate(() => [document.querySelector('[data-count]').textContent, document.querySelectorAll('#explore .card:not([hidden])').length]);
    check(+n[0] === n[1] && n[1] > 0 && n[1] < 107, `filters work (${n[1]} Gods cards shown, count says ${n[0]})`);
    await page.screenshot({ path: `review/qa/reduced-${w}.png` });
  });
}

// WebGL disabled: the browser reports no WebGL at all.
const noGL = await chromium.launch({ args: ['--disable-webgl', '--disable-webgl2', '--disable-3d-apis'] });
for (const [w, h, mobile] of [[390, 844, true], [1440, 900, false]]) {
  await visit(noGL, `WebGL disabled ${w}`, { viewport: { width: w, height: h }, isMobile: mobile, hasTouch: mobile }, async (page) => {
    const gl = await page.evaluate(() => !!document.createElement('canvas').getContext('webgl'));
    check(!gl, 'WebGL really is unavailable in this browser');
    await page.goto(BASE, { waitUntil: 'load' });
    await page.waitForFunction(() => !document.querySelector('[data-intro]'), null, { timeout: 15000 });
    check(true, 'intro played and ended');
    await page.waitForTimeout(4000); // the shader mounts in idle time after the intro
    const st = await page.evaluate(() => ({ canvas: !!document.querySelector('[data-shader-slot] canvas'), stat: document.querySelector('[data-shader-slot]').classList.contains('is-static') }));
    check(!st.canvas && st.stat, 'hero falls back to the static gradient');
    const hidden = await walk(page);
    check(!hidden.length, `everything revealed after scrolling${hidden.length ? `: ${hidden.join(', ')}` : ''}`);
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(600);
    await page.screenshot({ path: `review/qa/nowebgl-${w}.png` });
  });
}
await noGL.close();
await browser.close();
console.log(fails.length ? `\n${fails.length} failures` : '\nall mode checks passed');
process.exitCode = fails.length ? 1 : 0;
