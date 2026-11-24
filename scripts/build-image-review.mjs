// Builds review/images.html: a contact sheet of every place, its images and credits.
// Run: node scripts/build-image-review.mjs   then open review/images.html in a browser
// (or `npx vite` and visit http://localhost:5173/review/images.html).
// Red = missing or weak (automatic flags + visual-review notes from research/raw/image-queries.mjs).
import fs from 'node:fs';
import path from 'node:path';
import hints from '../research/raw/image-queries.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const read = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const places = read('src/data/places.json');
const credits = read('src/data/image-credits.json');
const report = read('research/image-report.json');
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const rows = places.map((p) => {
  const r = report[p.id] ?? { got: 0, wanted: p.mustDo ? 5 : 1, rejects: {}, candidates: 0, passed: 0 };
  const imgs = p.images.map((id) => credits[id]).filter(Boolean);
  const notes = hints[p.id]?.review ?? {}; // { '<pageid>': 'why it is weak' , place: 'note' }
  const reasons = [];
  if (!imgs.length) reasons.push('No acceptable image: site will use the typographic gradient card.');
  else if (imgs.length < r.wanted) reasons.push(`Only ${imgs.length} of ${r.wanted} images found.`);
  if (notes.place) reasons.push(notes.place);
  const cards = imgs.map((c) => {
    const pid = c.id.split('/')[1];
    const flags = [...(c.flags ?? []), ...(notes[pid] ? [notes[pid]] : [])];
    const weak = flags.length > 0;
    return `<figure class="${weak ? 'weak' : ''}">
      <a href="${esc(c.sourcePage)}" target="_blank" rel="noopener"><img loading="lazy" src="../public/${esc(c.file)}-960.webp" alt="${esc(c.alt)}" width="480" height="${Math.round(480 / (c.aspect ?? 1.5))}" style="background:${esc(c.dominant ?? '#333')} url('${c.placeholder ?? ''}') center/cover"></a>
      <figcaption>
        <b>${c.role === 'hero' ? 'HERO' : 'gallery'}</b> · ${esc(c.title.replace(/^File:/, ''))}<br>
        © ${c.authorUrl ? `<a href="${esc(c.authorUrl)}" target="_blank" rel="noopener">${esc(c.author)}</a>` : esc(c.author)} ·
        ${c.licenceUrl ? `<a href="${esc(c.licenceUrl)}" target="_blank" rel="noopener">${esc(c.licence)}</a>` : esc(c.licence)} ·
        <a href="${esc(c.sourcePage)}" target="_blank" rel="noopener">source</a><br>
        <span class="meta">${c.original.width}×${c.original.height} orig · sharpness ${c.sharpness} · score ${c.score}${c.distanceKm != null ? ` · ${c.distanceKm} km from pin` : ''}</span>
        ${flags.map((f) => `<span class="flag">⚠ ${esc(f)}</span>`).join('')}
      </figcaption>
    </figure>`;
  });
  const bad = !imgs.length || imgs.length < r.wanted || notes.place || imgs.some((c) => (c.flags ?? []).length || notes[c.id.split('/')[1]]);
  const rej = Object.entries(r.rejects ?? {}).map(([k, v]) => `${k} ${v}`).join(', ');
  return {
    bad,
    missing: !imgs.length,
    html: `<section id="${p.id}" class="${!imgs.length ? 'missing' : bad ? 'bad' : ''}">
    <header><h2>${esc(p.name)}</h2>${p.mustDo ? '<span class="must">mustDo</span>' : ''}<code>${p.id}</code>
      <span class="count">${imgs.length}/${r.wanted}</span></header>
    ${reasons.map((x) => `<p class="flag">⚠ ${esc(x)}</p>`).join('')}
    <div class="grid">${cards.join('') || '<div class="fallback"><span>' + esc(p.name) + '</span></div>'}</div>
    <p class="meta">Commons candidates ${r.candidates} · passed filters ${r.passed}${rej ? ` · rejected: ${esc(rej)}` : ''}</p>
  </section>`,
  };
});

const nImg = Object.keys(credits).length;
const nMissing = rows.filter((r) => r.missing).length;
const nBad = rows.filter((r) => r.bad && !r.missing).length;
const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Image review · Manipal Explorer</title>
<style>
  :root{--ink:#0B0F0E;--bone:#F7F3EA;--sand:#EDE3D1;--red:#d62828;--teal:#1F6F6B;--saffron:#F29B38}
  *{box-sizing:border-box}body{margin:0;font:14px/1.45 system-ui,sans-serif;background:var(--bone);color:var(--ink)}
  .top{position:sticky;top:0;z-index:2;background:var(--ink);color:var(--bone);padding:12px 16px;display:flex;flex-wrap:wrap;gap:12px;align-items:center}
  .top h1{font-size:16px;margin:0 12px 0 0}.top label{cursor:pointer;min-height:44px;display:flex;align-items:center;gap:6px}
  .top .stat{opacity:.8}.top .stat b{color:var(--saffron)}
  main{padding:16px;max-width:1800px;margin:auto}
  section{background:#fff;border:1px solid #ddd;border-left:6px solid var(--teal);border-radius:6px;padding:12px 14px;margin:0 0 14px}
  section.bad{border-left-color:var(--red)}section.missing{border-left-color:var(--red);background:#fff2f2}
  header{display:flex;flex-wrap:wrap;gap:10px;align-items:baseline}h2{font-size:18px;margin:0}
  code{color:#666}.must{background:var(--saffron);border-radius:3px;padding:1px 6px;font-size:12px;font-weight:600}
  .count{margin-left:auto;font-weight:700}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:10px;margin-top:8px}
  figure{margin:0;border:3px solid transparent;border-radius:4px}figure.weak{border-color:var(--red)}
  figure img{display:block;width:100%;height:auto;aspect-ratio:3/2;object-fit:cover}
  figcaption{font-size:12px;padding:6px 4px;word-break:break-word}figcaption a{color:var(--teal)}
  .meta{color:#777;font-size:12px}.flag{display:block;color:var(--red);font-weight:600;margin:4px 0}
  .fallback{aspect-ratio:3/2;display:grid;place-items:center;border-radius:4px;background:linear-gradient(135deg,#0E3B3A,#1F6F6B 55%,#F29B38);color:#F7F3EA;font:700 22px/1.1 Georgia,serif;padding:16px;text-align:center}
  body.only-bad section:not(.bad):not(.missing){display:none}
</style></head><body>
<div class="top"><h1>Image review</h1>
  <span class="stat"><b>${nImg}</b> images · <b>${places.length}</b> places · <b>${nMissing}</b> missing · <b>${nBad}</b> weak</span>
  <label><input type="checkbox" id="onlyBad"> Show only weak / missing</label>
  <span class="stat">Click an image for its Commons page. Gradient card = site fallback.</span></div>
<main>${rows.map((r) => r.html).join('\n')}</main>
<script>document.getElementById('onlyBad').addEventListener('change',e=>document.body.classList.toggle('only-bad',e.target.checked))</script>
</body></html>
`;
fs.mkdirSync(path.join(ROOT, 'review'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'review/images.html'), html);
console.log(`review/images.html: ${nImg} images, ${nMissing} missing, ${nBad} weak`);
