// Lighthouse, mobile and desktop, N runs each; reports the median run per profile.
// Usage: npm run build && npx vite preview, then:
//   BASE=http://localhost:4173/manipal-explorer/ node scripts/lighthouse.mjs [runs=3]
// Uses Playwright's Chromium. Writes review/lighthouse/<profile>.json (median run) and summary.txt.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const BASE = process.env.BASE || 'http://localhost:4173/manipal-explorer/';
const RUNS = Number(process.argv[2] || 3);
mkdirSync('review/lighthouse', { recursive: true });
const env = { ...process.env, CHROME_PATH: chromium.executablePath() };
const lines = [];
for (const profile of (process.env.PROFILES || 'mobile,desktop').split(',')) {
  const runs = [];
  for (let i = 0; i < RUNS; i++) {
    const out = `review/lighthouse/${profile}-${i}.json`;
    execFileSync(process.execPath, ['node_modules/lighthouse/cli/index.js', BASE, ...(profile === 'desktop' ? ['--preset=desktop'] : []),
      '--only-categories=performance,accessibility,best-practices,seo', '--output=json', `--output-path=${out}`, '--chrome-flags=--headless=new', '--quiet'], { env, stdio: 'inherit' });
    const r = JSON.parse(readFileSync(out, 'utf8'));
    const a = r.audits;
    runs.push({ out, r, perf: r.categories.performance.score, s: Object.fromEntries(Object.entries(r.categories).map(([k, c]) => [k, Math.round(c.score * 100)])),
      m: ['first-contentful-paint', 'largest-contentful-paint', 'total-blocking-time', 'cumulative-layout-shift', 'speed-index'].map((k) => `${k.replace(/-/g, ' ')} ${a[k].displayValue}`).join(' · ') });
    console.log(profile, i, runs.at(-1).s, runs.at(-1).m);
  }
  runs.sort((a, b) => a.perf - b.perf);
  const med = runs[Math.floor(runs.length / 2)];
  writeFileSync(`review/lighthouse/${profile}.json`, JSON.stringify(med.r));
  lines.push(`${profile} (median of ${RUNS}): performance ${med.s.performance} · accessibility ${med.s.accessibility} · best practices ${med.s['best-practices']} · seo ${med.s.seo}\n  ${med.m}\n  all runs: ${runs.map((x) => x.s.performance).join(', ')}`);
}
const txt = `Lighthouse ${new Date().toISOString().slice(0, 10)} · ${BASE}\n${lines.join('\n')}\n`;
writeFileSync('review/lighthouse/summary.txt', txt);
console.log(`\n${txt}`);
