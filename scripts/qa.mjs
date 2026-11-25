// Part 6 QA sweep: layout checks across six viewports.
// Usage: start Vite (dev or preview), then:
//   BASE=http://localhost:5173/manipal-explorer/ node scripts/qa.mjs [375 390 430 768 1440 1920 800]
// Reports per viewport: horizontal overflow, card text spilling out of its photo,
// clipped text, broken images, tap targets under 44 px, console errors.
// Writes review/qa/<vp>.json and a full-page JPEG per viewport.
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const BASE = process.env.BASE || 'http://localhost:5173/manipal-explorer/';
const phone = { deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const ALL = {
  375: { width: 375, height: 667, ...phone },
  390: { width: 390, height: 844, ...phone },
  430: { width: 430, height: 932, ...phone },
  768: { width: 768, height: 1024, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  800: { width: 800, height: 900, deviceScaleFactor: 1 },
  1440: { width: 1440, height: 900, deviceScaleFactor: 1 },
  1920: { width: 1920, height: 1080, deviceScaleFactor: 1 },
};
const want = process.argv.slice(2).length ? process.argv.slice(2) : ['375', '390', '430', '768', '1440', '1920'];

function audit() {
  const vw = document.documentElement.clientWidth;
  const visible = (e) => { const s = getComputedStyle(e); if (s.visibility === 'hidden' || s.display === 'none') return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
  const hiddenUp = (e) => e.closest('[hidden], [aria-hidden="true"], .detail:not(.is-open), .vh, .leaflet-container');
  const name = (e) => `${e.tagName.toLowerCase()}${e.getAttribute('href') ? `[href=${e.getAttribute('href').slice(0, 40)}]` : ''}${e.id ? '#' + e.id : ''}${e.classList.length ? '.' + [...e.classList].slice(0, 3).join('.') : ''}${e.closest('[data-place]') ? ` [${e.closest('[data-place]').dataset.place}]` : ''}`;
  // Judge the settled layout, not mid-reveal transforms.
  document.querySelectorAll('.rv').forEach((e) => e.classList.remove('rv'));
  const st = document.createElement('style'); st.textContent = '*,*::before,*::after{transition:none!important}'; document.head.append(st);
  const out = { docOverflow: document.documentElement.scrollWidth - vw, overflow: [], spill: [], clipped: [], broken: [], small: [] };

  for (const e of document.querySelectorAll('body *')) {
    if (hiddenUp(e)) continue;
    let clipped = false;
    for (let a = e.parentElement; a && a !== document.body; a = a.parentElement) if (/auto|scroll|hidden|clip/.test(getComputedStyle(a).overflowX)) { clipped = true; break; }
    if (clipped) continue;
    const r = e.getBoundingClientRect();
    if (r.width && r.right > vw + 1) out.overflow.push(`${name(e)} +${Math.round(r.right - vw)}px`);
  }
  // Card text must stay inside its photo (the 800 px long-name bug).
  for (const c of document.querySelectorAll('.card')) {
    if (hiddenUp(c) || !visible(c)) continue;
    const m = c.querySelector('.card__media').getBoundingClientRect();
    const b = c.querySelector('.card__body').getBoundingClientRect();
    const t = c.querySelector('.card__top').getBoundingClientRect();
    if (b.top < m.top - 1 || b.bottom > m.bottom + 1) out.spill.push(`${name(c)} body ${Math.round(b.top - m.top)}px from top`);
    else if (b.top < t.bottom - 4) out.spill.push(`${name(c)} body overlaps the star/chip row by ${Math.round(t.bottom - b.top)}px`);
  }
  // Text cut off by overflow hidden (ignores deliberate one-line ellipses and scrollers).
  for (const e of document.querySelectorAll('h1,h2,h3,h4,p,li,a,button,span,b,dd,dt,label,summary')) {
    if (hiddenUp(e) || !visible(e) || !e.textContent.trim()) continue;
    if (e.matches('.hero h1 .ln')) continue; // line masks for the title rise; glyphs checked by eye, only font-metric space is trimmed
    const s = getComputedStyle(e);
    if (!/hidden|clip/.test(s.overflowX + s.overflowY) || s.textOverflow === 'ellipsis' || s.webkitLineClamp !== 'none') continue;
    if (e.scrollWidth > e.clientWidth + 2 || e.scrollHeight > e.clientHeight + 2) out.clipped.push(`${name(e)} "${e.textContent.trim().slice(0, 40)}"`);
  }
  for (const i of document.images) if (i.complete && i.naturalWidth === 0 && i.getAttribute('src')) out.broken.push(i.currentSrc || i.src);
  // Tap targets: interactive, visible, not an inline link inside running text (WCAG 2.5.8 exception).
  for (const e of document.querySelectorAll('a[href], button, summary, input:not([type=hidden]), select, [role=button], label.fchip')) {
    if (hiddenUp(e) || !visible(e)) continue;
    if (e.matches('.card h3 a')) continue; // its ::after stretches over the whole card
    if (e.matches('input[type=checkbox], input[type=radio]') && e.closest('label')) continue; // the label is the target
        if (e.matches('summary[tabindex="-1"]')) continue; // a label on phones, not a control
    const r = e.getBoundingClientRect();
    // Touch: 44 px (the brief). Fine pointer: WCAG 2.5.8's 24 px. Credit links inside a
    // sentence use the inline exception but must still reach 24 px.
    const min = e.closest('.credit, .credits') || !matchMedia('(pointer: coarse)').matches ? 23.5 : 43.5;
    if (r.width < min || r.height < min) out.small.push(`${name(e)} ${Math.round(r.width)}×${Math.round(r.height)}`);
  }
  for (const k of ['overflow', 'spill', 'clipped', 'broken', 'small']) out[k] = [...new Set(out[k])];
  return out;
}

const browser = await chromium.launch();
await mkdir('review/qa', { recursive: true });
let total = 0;
for (const key of want) {
  const vp = ALL[key];
  const ctx = await browser.newContext({ ...vp, viewport: { width: vp.width, height: vp.height } });
  await ctx.addInitScript(() => { try { sessionStorage.setItem('me:intro', '1'); } catch {} });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('requestfailed', (r) => { if (!/ERR_ABORTED/.test(r.failure()?.errorText)) errors.push(`failed: ${r.url()} ${r.failure()?.errorText}`); });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !document.querySelector('[data-intro]'), null, { timeout: 15000 });
  await page.evaluate(async () => {
    await document.fonts.ready;
    document.querySelectorAll('img[loading="lazy"]').forEach((i) => { i.loading = 'eager'; });
    for (let pass = 0; pass < 8 && (pass === 0 || document.querySelector("[data-lazy]")); pass++) for (let y = 0; y < document.body.scrollHeight; y += innerHeight * 0.8) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 90)); } // sections render as they near the screen
    // Bounded: an image inside content that is still skipped (content-visibility) may not load until it nears the screen.
    await Promise.race([Promise.all([...document.images].map((i) => (i.complete ? 0 : new Promise((r) => { i.onload = i.onerror = r; })))), new Promise((r) => setTimeout(r, 15000))]);
  });
  await page.waitForTimeout(1500);
  await page.evaluate(() => document.querySelectorAll('main details, footer details').forEach((d) => { d.open = true; }));
  await page.waitForTimeout(300);
  const res = await page.evaluate(audit);
  // Place detail (sheet on phones, side panel on laptops), with its sources open.
  await page.evaluate(() => { location.hash = '#place-kollur-mookambika-temple'; });
  await page.waitForTimeout(1200);
  await page.evaluate(() => document.querySelectorAll('.detail details').forEach((d) => { d.open = true; }));
  await page.waitForTimeout(300);
  const det = await page.evaluate(() => {
    const out = [];
    const panel = document.querySelector('.detail');
    const vw = document.documentElement.clientWidth;
    for (const e of panel.querySelectorAll('a[href], button, summary, select, input')) {
      const r = e.getBoundingClientRect(); if (!r.width) continue;
      const min = !matchMedia('(pointer: coarse)').matches || e.closest('.credit, .credits') ? 23.5 : 43.5;
      if (r.width < min || r.height < min) out.push(`detail ${e.tagName.toLowerCase()}.${[...e.classList].join('.')} "${e.textContent.trim().slice(0, 30)}" ${Math.round(r.width)}×${Math.round(r.height)}`);
      let sc = false; for (let a = e.parentElement; a && a !== panel; a = a.parentElement) if (/auto|scroll|hidden|clip/.test(getComputedStyle(a).overflowX)) { sc = true; break; }
      if (!sc && r.right > vw + 1) out.push(`detail overflow ${e.tagName}.${[...e.classList].join('.')} +${Math.round(r.right - vw)}`);
    }
    return out;
  });
  res.small.push(...det);
  res.errors = errors;
  await writeFile(`review/qa/${key}.json`, JSON.stringify(res, null, 2));
  const n = res.overflow.length + res.spill.length + res.clipped.length + res.broken.length + res.small.length + errors.length + (res.docOverflow > 0 ? 1 : 0);
  total += n;
  console.log(`\n${key}: docOverflow=${res.docOverflow} overflow=${res.overflow.length} spill=${res.spill.length} clipped=${res.clipped.length} broken=${res.broken.length} small=${res.small.length} errors=${errors.length}`);
  for (const k of ['overflow', 'spill', 'clipped', 'broken', 'small', 'errors']) res[k].slice(0, 12).forEach((s) => console.log(`  ${k}: ${s}`));
  await ctx.close();
}
await browser.close();
console.log(`\n${total ? total + ' issues' : 'clean'}`);
process.exitCode = total ? 1 : 0;
