// Place detail: right-hand overlay on laptop, draggable bottom sheet on phone.
// Deep link: #place-<id>.
import {
  place, esc, picture, gradientArt, creditLine, credit, monthStrip, monthRange, chapterLabel, isGoodNow,
  host, readerSources, verifyTag, needsVerify, rideHtml, kmHtml, STAR, CHECK,
} from './util.js';
import { syncButtons } from './state.js';

const TRIP = { quick: 'Quick trip', day: 'Day trip', overnight: 'Overnight', 'long-ride': 'Long ride' };
const gmaps = (p) => `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`;
const v = (s) => (needsVerify(s) ? ` ${verifyTag}` : '');
// Trailing "verify locally" in the data becomes the tag, so it isn't said twice.
const trim = (s) => String(s).replace(/[\s,;:.—-]*\(?verify locally\)?\.?\s*$/i, '.').replace(/\.\.$/, '.');
const val = (s) => (s == null ? `Not confirmed ${verifyTag}` : esc(needsVerify(s) ? trim(s) : s) + v(s));

let root, panel, scrollBox, lastFocus, current;

function render(p) {
  const imgs = p.images || [];
  const t = p.temple, k = p.trek, tr = p.transport?.train;
  const gallery = imgs.length
    ? `<div class="gal" tabindex="0" aria-label="Photos of ${esc(p.name)}${imgs.length > 1 ? ', scrolls sideways' : ''}">${imgs.map((id, i) => `<figure class="gal__i">${picture(id, { sizes: '(min-width:1000px) 600px, 100vw', eager: i === 0 })}<figcaption class="credit">${creditLine(id)}</figcaption></figure>`).join('')}</div>`
    : `<div class="gal gal--none">${gradientArt(p)}<p class="credit">No licensed photo found for this place yet.</p></div>`;
  return `
  <div class="grab" data-grab aria-hidden="true"><i></i></div>
  <button class="sheet__close" type="button" data-close aria-label="Close">×</button>
  <div class="sheet__scroll" data-scroll>
    ${gallery}
    <div class="sheet__in">
      <div class="sheet__top">
        <div>
          <span class="cap sheet__ch">${chapterLabel(p.chapter)}${p.mustDo ? ' · Top 10' : ''}${isGoodNow(p) ? ' · <span class="good">Good now</span>' : ''}</span>
          <h2 id="detail-h">${esc(p.name)}</h2>
        </div>
        <button class="star" type="button" data-toggle="list" data-id="${p.id}" aria-pressed="false" aria-label="Add ${esc(p.name)} to my list">${STAR}</button>
      </div>
      <p class="lede">${esc(p.hook)}</p>
      <div class="acts">
        <a class="btn btn--accent" href="${gmaps(p)}" target="_blank" rel="noopener">Open in Google Maps</a>
        <button class="btn btn--been" type="button" data-toggle="been" data-id="${p.id}" aria-pressed="false">${CHECK}<span data-label data-on="Been there" data-off="Mark as been there">Mark as been there</span></button>
      </div>
      <dl class="facts num">
        <div><dt class="cap">Distance</dt><dd>${kmHtml(p.distanceKmFromManipal)}<span class="sub">by road from Manipal${p.distanceKmFromManipal == null ? ' · verify locally' : ''}</span></dd></div>
        <div><dt class="cap">Ride</dt><dd>${rideHtml(p.rideTimeFromManipal)}<span class="sub">by motorcycle${p.transport?.bike === false ? ' · not a bike trip' : ''}</span></dd></div>
        <div><dt class="cap">Train</dt><dd class="sm">${tr?.available ? esc(tr.station) : 'No useful station'}${tr?.notes ? `<span class="sub">${esc(tr.notes)}</span>` : ''}</dd></div>
        <div><dt class="cap">Go</dt><dd class="sm">${TRIP[p.tripType] ?? esc(p.tripType)}<span class="sub">${val(p.bestTime)}</span></dd></div>
      </dl>
      <div class="block"><h3 class="cap">When to go · ${monthRange(p.bestMonths)}</h3>${monthStrip(p.bestMonths)}<p class="note">${esc(p.seasonNote)}</p></div>
      <div class="block"><h3 class="cap">Why go</h3><p>${esc(p.why)}</p></div>
      ${t ? `<div class="block block--temple"><h3 class="cap">At the temple</h3><dl>
        <div><dt>Darshan</dt><dd>${val(t.darshanTimings)}</dd></div>
        <div><dt>Dress code</dt><dd>${val(t.dressCode)}</dd></div>
        <div><dt>Anna prasada</dt><dd>${val(t.annadana)}</dd></div>
      </dl></div>` : ''}
      ${k ? `<div class="block"><h3 class="cap">The trek</h3><dl class="kv">
        <div><dt>Difficulty</dt><dd class="cap-first">${esc(k.difficulty ?? 'Not rated')}</dd></div>
        <div><dt>Duration</dt><dd>${val(k.duration)}</dd></div>
        <div><dt>Permit</dt><dd>${k.permitRequired == null ? `Not confirmed ${verifyTag}` : k.permitRequired ? 'Required' : 'Not required'}</dd></div>
        <div><dt>Guide</dt><dd>${k.guideMandatory == null ? `Not confirmed ${verifyTag}` : k.guideMandatory ? 'Mandatory' : 'Not mandatory'}</dd></div>
        ${k.howToBook ? `<div class="kv__wide"><dt>How to book</dt><dd>${val(k.howToBook)}</dd></div>` : ''}
      </dl></div>` : ''}
      ${p.vegFoodNearby?.length ? `<div class="block"><h3 class="cap">Veg food nearby</h3><ul class="bul">${p.vegFoodNearby.map((f) => `<li>${esc(needsVerify(f) ? trim(f) : f)}${v(f)}</li>`).join('')}</ul></div>`
        : `<div class="block"><h3 class="cap">Veg food nearby</h3><p>No pure-veg place confirmed online near here. Pack a meal or ask locally. ${verifyTag}</p></div>`}
      ${p.bikeTips ? `<div class="block"><h3 class="cap">The ride</h3><p>${val(p.bikeTips)}</p></div>` : ''}
      ${p.safety ? `<div class="warn"><h3 class="cap">Safety</h3><p>${esc(p.safety)}</p></div>` : ''}
      <div class="block"><h3 class="cap">Sources</h3>
        <ul class="src">${readerSources(p.sources).map((u) => `<li><a href="${esc(u)}" target="_blank" rel="noopener">${esc(host(u))}</a></li>`).join('')}</ul>
        <p class="credit">${p.confidence === 'verified' ? 'Verified' : p.confidence === 'partial' ? 'Partly verified' : 'Mostly unverified, check locally'} · checked ${esc(p.lastChecked)} · distance via OpenStreetMap routing</p>
      </div>
    </div>
  </div>`;
}

export function initDetail() {
  root = document.createElement('div');
  root.className = 'detail';
  root.hidden = true;
  root.innerHTML = '<div class="detail__scrim" data-close></div><div class="detail__bg" aria-hidden="true"></div><article class="sheet" role="dialog" aria-modal="true" aria-labelledby="detail-h" tabindex="-1"></article>';
  document.body.append(root);
  panel = root.querySelector('.sheet');

  root.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) close(); });
  document.addEventListener('keydown', (e) => {
    if (root.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') trapFocus(e);
  });
  // Any link or element with data-open opens the detail without a page jump.
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-open]');
    if (!a || e.metaKey || e.ctrlKey) return;
    e.preventDefault();
    open(a.dataset.open, a);
  });
  addEventListener('hashchange', fromHash);
  fromHash();
  dragToClose();
}

function fromHash() {
  const m = location.hash.match(/^#place-([\w-]+)$/);
  if (m && place(m[1])) { if (current !== m[1]) open(m[1]); }
  else if (!root.hidden) close(false);
}

export function open(id, from) {
  const p = place(id);
  if (!p) return;
  lastFocus = from || document.activeElement;
  current = id;
  panel.innerHTML = render(p);
  const bgImg = p.images?.[1] || p.images?.[0];
  root.querySelector('.detail__bg').innerHTML = bgImg ? picture(bgImg, { sizes: '100vw', alt: '' }) : '';
  syncButtons(panel);
  scrollBox = panel.querySelector('[data-scroll]');
  root.hidden = false;
  document.documentElement.classList.add('has-detail');
  requestAnimationFrame(() => root.classList.add('is-open'));
  if (location.hash !== `#place-${id}`) history.pushState(null, '', `#place-${id}`);
  panel.focus({ preventScroll: true });
}

export function close(updateHash = true) {
  if (root.hidden) return;
  root.classList.remove('is-open');
  document.documentElement.classList.remove('has-detail');
  current = null;
  const done = () => { root.hidden = true; panel.style.transform = ''; };
  matchMedia('(prefers-reduced-motion: reduce)').matches ? done() : setTimeout(done, 380);
  if (updateHash && /^#place-/.test(location.hash)) history.pushState(null, '', location.pathname + location.search);
  lastFocus?.focus?.({ preventScroll: true });
}

function trapFocus(e) {
  const f = [...panel.querySelectorAll('a[href], button, [tabindex="0"], summary')].filter((x) => x.offsetParent !== null);
  if (!f.length) return;
  const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}

// Bottom sheet: drag the handle (or the sheet when scrolled to the top) down to close.
function dragToClose() {
  let y0 = null, dy = 0, t0 = 0;
  const isSheet = () => !matchMedia('(min-width: 1000px)').matches;
  panel.addEventListener('pointerdown', (e) => {
    if (!isSheet()) return;
    const onGrab = e.target.closest('[data-grab]');
    const atTop = scrollBox && scrollBox.scrollTop <= 0;
    if (!onGrab && !(atTop && e.pointerType === 'touch' && !e.target.closest('.gal'))) return;
    y0 = e.clientY; dy = 0; t0 = performance.now();
    panel.classList.add('is-dragging');
  });
  addEventListener('pointermove', (e) => {
    if (y0 == null) return;
    dy = Math.max(0, e.clientY - y0);
    panel.style.transform = `translateY(${dy}px)`;
  }, { passive: true });
  const end = () => {
    if (y0 == null) return;
    panel.classList.remove('is-dragging');
    const fast = dy / Math.max(1, performance.now() - t0) > 0.6;
    if (dy > 140 || (fast && dy > 40)) close(); else panel.style.transform = '';
    y0 = null;
  };
  addEventListener('pointerup', end);
  addEventListener('pointercancel', end);
}
