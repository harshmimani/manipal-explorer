// Part 5 · motion performance check with Playwright.
// Usage: start Vite (or `vite preview`), then:
//   BASE=http://localhost:5173/manipal-explorer/ node scripts/measure-motion.mjs [mobile desktop] [--frames]
// Mobile profile: 390×844 @2x, touch, 4× CPU throttle, "fast 4G" network.
// For each scenario it records every requestAnimationFrame interval and reports
// average fps, the share of frames slower than 1.5 vsyncs (dropped), the worst
// frame, and long tasks (> 50 ms). --frames also saves intro frames to
// review/screenshots/motion/.
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const BASE = process.env.BASE || 'http://localhost:5173/manipal-explorer/';
const args = process.argv.slice(2);
const want = args.filter((a) => !a.startsWith('--'));
const SAVE = args.includes('--frames');
const PROFILES = {
  mobile: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, cpu: 4,
    net: { offline: false, latency: 150, downloadThroughput: (9 * 1024 * 1024) / 8, uploadThroughput: (1.5 * 1024 * 1024) / 8 } },
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, cpu: 1, net: null },
};

// Injected before any page script: frame + long-task recorder.
const recorder = () => {
  const rec = { on: false, frames: [], long: [] };
  window.__rec = rec;
  let last = 0;
  const loop = (t) => { if (rec.on && last) rec.frames.push(t - last); last = t; requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
  try { new PerformanceObserver((l) => { if (rec.on) l.getEntries().forEach((e) => rec.long.push(Math.round(e.duration))); }).observe({ type: 'longtask', buffered: false }); } catch { /* unsupported */ }
  rec.start = () => { rec.frames = []; rec.long = []; rec.on = true; };
  rec.stop = () => { rec.on = false; return { frames: rec.frames, long: rec.long }; };
};

const summarise = (name, { frames, long }) => {
  if (!frames.length) return { name, frames: 0 };
  const sorted = [...frames].sort((a, b) => a - b);
  const vsync = sorted[Math.floor(sorted.length * 0.2)] || 16.7; // ~refresh interval
  const dropped = frames.filter((f) => f > vsync * 1.5).length;
  const avg = frames.reduce((a, b) => a + b, 0) / frames.length;
  return {
    name, frames: frames.length, fps: +(1000 / avg).toFixed(1), dropped: `${((dropped / frames.length) * 100).toFixed(1)}%`,
    p95: +sorted[Math.floor(sorted.length * 0.95)].toFixed(1), worst: +sorted[sorted.length - 1].toFixed(1), longTasks: long.length, longMax: long.length ? Math.max(...long) : 0,
  };
};

const browser = await chromium.launch({ args: ['--enable-gpu', '--ignore-gpu-blocklist', '--use-angle=d3d11', '--enable-gpu-rasterization'] });
const out = {};
for (const name of want.length ? want : Object.keys(PROFILES)) {
  const P = PROFILES[name];
  const ctx = await browser.newContext({ viewport: P.viewport, deviceScaleFactor: P.deviceScaleFactor, isMobile: P.isMobile, hasTouch: P.hasTouch, reducedMotion: 'no-preference' });
  await ctx.addInitScript(recorder);
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  if (P.cpu > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: P.cpu });
  if (P.net) { await cdp.send('Network.enable'); await cdp.send('Network.emulateNetworkConditions', P.net); }
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  const res = [];

  // 1 · First visit: intro (fresh session).
  await page.goto(BASE, { waitUntil: 'commit' });
  await page.evaluate(() => window.__rec.start());
  if (SAVE) {
    await mkdir('review/screenshots/motion', { recursive: true });
    const t0 = Date.now();
    for (const t of [300, 700, 1200, 1700, 2300, 3200]) {
      await page.waitForTimeout(Math.max(0, t - (Date.now() - t0)));
      await page.screenshot({ path: `review/screenshots/motion/${name}-intro-${String(t).padStart(4, '0')}.png` });
    }
  } else await page.waitForTimeout(3200);
  res.push(summarise('intro (first 3s)', await page.evaluate(() => window.__rec.stop()))); console.log(name, JSON.stringify(res[res.length - 1]));
  const introGone = await page.evaluate(() => !document.querySelector('[data-intro]') && !document.documentElement.classList.contains('is-intro'));
  await page.waitForLoadState('load');
  await page.waitForTimeout(1500);

  // 2 · Hero idle: shader running.
  await page.evaluate(() => window.__rec.start());
  if (!P.isMobile) for (let i = 0; i < 30; i++) { await page.mouse.move(500 + i * 20, 400 + Math.sin(i / 3) * 120); await page.waitForTimeout(80); }
  else await page.waitForTimeout(2500);
  res.push(summarise('hero + shader', await page.evaluate(() => window.__rec.stop()))); console.log(name, JSON.stringify(res[res.length - 1]));
  const gl = await page.evaluate(() => {
    const c = document.querySelector('[data-shader-slot] canvas'); if (!c) return document.querySelector('[data-shader-slot]').className;
    const g = c.getContext('webgl2') || c.getContext('webgl'); const e = g?.getExtension('WEBGL_debug_renderer_info');
    return `${c.width}×${c.height} · ${e ? g.getParameter(e.UNMASKED_RENDERER_WEBGL) : 'renderer hidden'}`;
  });

  // 3 · Scroll the whole page. Phone: native scroll steps; laptop: wheel (drives Lenis).
  await page.evaluate(() => window.__rec.start());
  const H = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  const explore = await page.evaluate(() => document.getElementById('explore').offsetTop);
  if (P.isMobile) {
    await page.evaluate(async (to) => {
      await new Promise((done) => { const v = 2200; let y = scrollY, last = performance.now();
        const step = (t) => { y += (v * (t - last)) / 1000; last = t; scrollTo(0, y); if (y < to) requestAnimationFrame(step); else done(); };
        requestAnimationFrame(step); });
    }, Math.min(H, explore + 2500));
  } else {
    for (let y = 0; y < Math.min(H, explore + 2500); y += 120) { await page.mouse.wheel(0, 120); await page.waitForTimeout(16); }
    await page.waitForTimeout(800);
  }
  res.push(summarise('scroll page', await page.evaluate(() => window.__rec.stop()))); console.log(name, JSON.stringify(res[res.length - 1]));

  // 4 · Filter change: Flip on the Explore grid.
  await page.evaluate((y) => scrollTo(0, y + 200), explore);
  await page.waitForTimeout(1200);
  await page.evaluate(() => window.__rec.start());
  await page.evaluate(() => { const i = document.querySelector('input[name="chapter"][value="gods"]'); i.checked = true; i.dispatchEvent(new Event('change', { bubbles: true })); });
  await page.waitForTimeout(1300);
  await page.evaluate(() => { const i = document.querySelector('input[name="chapter"][value="gods"]'); i.checked = false; i.dispatchEvent(new Event('change', { bubbles: true })); });
  await page.waitForTimeout(1300);
  res.push(summarise('filter Flip ×2', await page.evaluate(() => window.__rec.stop()))); console.log(name, JSON.stringify(res[res.length - 1]));

  // 5 · Detail sheet open → close.
  await page.evaluate(() => window.__rec.start());
  await page.evaluate(() => document.querySelector('#explore [data-open]:not([hidden])').click());
  await page.waitForTimeout(1300);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(900);
  res.push(summarise('detail open/close', await page.evaluate(() => window.__rec.stop()))); console.log(name, JSON.stringify(res[res.length - 1]));

  out[name] = { gl, introGone, errors: errors.slice(0, 5), res };
  console.log(`\n── ${name} ── shader: ${gl} · intro removed: ${introGone}`);
  console.table(res);
  if (errors.length) console.log('errors:', errors.slice(0, 5));
  await ctx.close();
}
await browser.close();
