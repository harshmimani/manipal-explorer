// Part 6 accessibility checks: axe-core on every section plus the detail panel and
// the filter sheet, then a keyboard walk.
// Usage: start Vite, then: BASE=http://localhost:5173/manipal-explorer/ node scripts/a11y.mjs [390 1440]
// Exit code 1 if axe finds any serious/critical violation or the keyboard walk fails.
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const BASE = process.env.BASE || 'http://localhost:5173/manipal-explorer/';
const VPS = {
  390: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  1440: { viewport: { width: 1440, height: 900 } },
};
const want = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(VPS);
const SECTIONS = ['.site-head', '#top', '#must-do', '#ch-coast', '#ch-gods', '#ch-ghats', '#ch-heritage', '#explore', '#map', '#ch-table', '#plan', '#festivals', '#practical', '#credits'];

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
await mkdir('review/qa', { recursive: true });
let bad = 0;
const report = {};

for (const key of want) {
  const ctx = await browser.newContext({ ...VPS[key], reducedMotion: 'no-preference' });
  await ctx.addInitScript(() => { try { sessionStorage.setItem('me:intro', '1'); } catch {} });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: 'load' });
  await renderAll(page);
  // Walk the page so reveals finish and lazy content (map) mounts, then settle every animation.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += innerHeight * 0.8) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 80)); }
    scrollTo(0, 0);
  });
  await page.waitForTimeout(2500);
  await page.evaluate(() => {
    document.querySelectorAll('.rv, .fu, .rm-wait').forEach((e) => e.classList.remove('rv', 'fu', 'rm-wait'));
    window.gsap?.globalTimeline?.progress?.(1);
  });
  const rows = [];
  const run = async (label, include) => {
    const r = await new AxeBuilder({ page }).include(include).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']).analyze();
    for (const v of r.violations) {
      const serious = v.impact === 'serious' || v.impact === 'critical';
      if (serious) bad++;
      rows.push({ where: label, id: v.id, impact: v.impact, n: v.nodes.length, help: v.help, sample: v.nodes.slice(0, 3).map((n) => `${n.target.join(' ')} :: ${(n.failureSummary || '').split('\n').slice(1, 2).join('')}`) });
    }
  };
  for (const s of SECTIONS) await run(s, s);

  // Place detail.
  await page.evaluate(() => { location.hash = '#place-kollur-mookambika-temple'; });
  await page.waitForTimeout(1200);
  await run('detail', '.detail');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(600);

  // Filter sheet (phone) / filter dropdown (laptop).
  if (key === '390') {
    await page.evaluate(() => document.getElementById('explore').scrollIntoView());
    await page.click('[data-filters-open]');
    await page.waitForTimeout(600);
    await run('filters sheet', '#filters');
    await page.click('[data-filters-close]');
  } else {
    await page.evaluate(() => document.getElementById('explore').scrollIntoView());
    await page.click('[data-fgroup="cat"] summary');
    await page.waitForTimeout(300);
    await run('filter dropdown', '[data-fbar]');
    await page.keyboard.press('Escape');
  }

  // ── Keyboard walk ──────────────────────────────────────────────
  const kb = { issues: [] };
  await page.goto(BASE, { waitUntil: 'load' });
  await page.waitForTimeout(2500);
  // 1. Skip link is the first stop and moves focus to main.
  await page.keyboard.press('Tab');
  const first = await page.evaluate(() => ({ cls: document.activeElement.className, txt: document.activeElement.textContent.trim() }));
  kb.first = first;
  if (!/skip/.test(first.cls)) kb.issues.push(`first Tab stop is "${first.txt}", not the skip link`);
  // 2. Tab through the page: every stop must be visible and show a focus ring.
  const seen = []; let noRing = 0, hiddenStops = 0;
  // Until focus reaches the footer (or wraps back to the top).
  for (let i = 0; i < 2500; i++) {
    await page.keyboard.press('Tab');
    if (await page.evaluate(() => !!document.activeElement.closest('footer') || document.activeElement.classList.contains('skip'))) { seen.push({ sec: 'credits' }); break; }
    const s = await page.evaluate(() => {
      const e = document.activeElement; if (!e || e === document.body) return null;
      const st = getComputedStyle(e); const r = e.getBoundingClientRect();
      const card = e.closest('.card');
      const ring = (st.outlineStyle !== 'none' && parseFloat(st.outlineWidth) > 0) || st.boxShadow !== 'none'
        || (card && getComputedStyle(card.querySelector('.card__media')).outlineStyle !== 'none');
      const vis = r.width > 0 && r.height > 0 && st.visibility !== 'hidden' && !e.closest('[hidden], [inert]');
      return { tag: e.tagName.toLowerCase(), txt: (e.getAttribute('aria-label') || e.textContent).trim().slice(0, 40), ring, vis, sec: e.closest('main > section')?.id || e.closest('header, footer')?.tagName };
    });
    if (!s) continue;
    seen.push(s);
    if (!s.ring) { noRing++; if (noRing < 8) kb.issues.push(`no visible focus ring: ${s.tag} "${s.txt}" in ${s.sec}`); }
    if (!s.vis) { hiddenStops++; if (hiddenStops < 8) kb.issues.push(`focus on an invisible element: ${s.tag} "${s.txt}" in ${s.sec}`); }
  }
  kb.stops = seen.length;
  kb.sections = [...new Set(seen.map((s) => s.sec))];
  // Every section with something tabbable (outside closed <details>) must be reached.
  const want = await page.evaluate(() => [...new Set([...document.querySelectorAll('main > section a[href], main > section button, main > section summary, main > section input, main > section select, main > section [tabindex="0"]')]
    .filter((e) => e.tabIndex >= 0 && !e.closest('[hidden], [inert], .detail, details:not([open]) > :not(summary)') && getComputedStyle(e).display !== 'none' && e.getClientRects().length)
    .map((e) => e.closest('main > section').id))]);
  const missed = want.filter((id) => !kb.sections.includes(id));
  if (missed.length) kb.issues.push(`Tab never reaches: ${missed.join(', ')}`);
  // 3. A card opens its detail with Enter; Escape closes it and focus returns.
  await page.evaluate(() => document.querySelector('#explore .card h3 a').focus());
  const opener = await page.evaluate(() => document.activeElement.textContent.trim());
  await page.keyboard.press('Enter');
  await page.waitForTimeout(900);
  const inDetail = await page.evaluate(() => !!document.activeElement.closest('.detail'));
  if (!inDetail) kb.issues.push('Enter on a card did not move focus into the detail');
  // Focus stays inside the open detail.
  let escaped = false;
  for (let i = 0; i < 60; i++) { await page.keyboard.press('Tab'); if (!(await page.evaluate(() => !!document.activeElement.closest('.detail')))) { escaped = true; break; } }
  if (escaped) kb.issues.push('Tab leaves the open detail (no focus containment)');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(700);
  const back = await page.evaluate(() => document.activeElement.textContent.trim());
  if (back !== opener) kb.issues.push(`after Escape focus is on "${back.slice(0, 40)}", not the card that opened it`);
  // 4. Star toggles with Space.
  await page.evaluate(() => document.querySelector('#explore .card .star').focus());
  await page.keyboard.press('Space');
  const pressed = await page.evaluate(() => document.activeElement.getAttribute('aria-pressed'));
  if (pressed !== 'true') kb.issues.push('Space on a star did not toggle it');
  await page.keyboard.press('Space');
  bad += kb.issues.length;

  report[key] = { axe: rows, keyboard: kb };
  console.log(`\n── ${key} ── axe: ${rows.length} violation groups (${rows.filter((r) => /serious|critical/.test(r.impact)).length} serious/critical)`);
  rows.forEach((r) => console.log(`  [${r.impact}] ${r.where} · ${r.id} ×${r.n}: ${r.help}\n      ${r.sample.join('\n      ')}`));
  console.log(`  keyboard: ${kb.stops} stops across ${kb.sections.join(', ')}; first stop "${kb.first.txt}"`);
  kb.issues.forEach((i) => console.log(`  keyboard issue: ${i}`));
  await ctx.close();
}
await writeFile('review/qa/a11y.json', JSON.stringify(report, null, 2));
await browser.close();
console.log(bad ? `\n${bad} serious/critical or keyboard issues` : '\nno serious/critical axe violations; keyboard walk passed');
process.exitCode = bad ? 1 : 0;
