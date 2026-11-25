// Place detail: right-hand overlay on laptop, draggable bottom sheet on phone.
// Deep link: #place-<id>.
import {
  place, esc, picture, gradientArt, creditLine, credit, monthStrip, monthRange, chapterLabel, isGoodNow,
  host, readerSources, verifyTag, needsVerify, rideHtml, kmHtml, STAR, CHECK,
} from './util.js';
import { syncButtons } from './state.js';
import { spring } from './spring.js';

const TRIP = { quick: 'Quick trip', day: 'Day trip', overnight: 'Overnight', 'long-ride': 'Long ride' };
const gmaps = (p) => `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`;
const v = (s) => (needsVerify(s) ? ` ${verifyTag}` : '');
// Trailing "verify locally" in the data becomes the tag, so it isn't said twice.
const trim = (s) => String(s).replace(/[\s,;:.—-]*\(?verify locally\)?\.?\s*$/i, '.').replace(/\.\.$/, '.');
const val = (s) => (s == null ? `Not confirmed ${verifyTag}` : esc(needsVerify(s) ? trim(s) : s) + v(s));

let root, panel, scrim, scrollBox, lastFocus, current;

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
  root.innerHTML = '<div class="detail__scrim" data-close></div><div class="detail__bg" aria-hidden="true"></div><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="detail-h" tabindex="-1"></div>';
  document.body.append(root);
  panel = root.querySelector('.sheet');
  scrim = root.querySelector('.detail__scrim');

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

// Phone bottom sheet: the sheet's position is driven by a spring, so it lands
// with a little give and, when flicked, leaves at the speed of the finger.
const isSheet = () => !matchMedia('(min-width: 1000px)').matches;
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
let y = 0, stopSpring = null;
function setY(v) {
  y = v;
  panel.style.transform = `translate3d(0,${v}px,0)`;
  scrim.style.opacity = String(Math.max(0, Math.min(1, 1 - v / (panel.offsetHeight || 1))));
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
  stopSpring?.();
  if (isSheet() && !reducedMotion()) {
    panel.classList.add('is-spring');
    root.classList.add('is-open');
    if (!panel.style.transform) setY(panel.offsetHeight);
    stopSpring = spring({ from: y, to: 0, stiffness: 380, damping: 30, onUpdate: setY });
  } else {
    requestAnimationFrame(() => root.classList.add('is-open'));
  }
  if (location.hash !== `#place-${id}`) history.pushState(null, '', `#place-${id}`);
  panel.focus({ preventScroll: true });
  document.dispatchEvent(new CustomEvent('detail:open', { detail: panel }));
}

export function close(updateHash = true, velocity = 0) {
  if (root.hidden) return;
  root.classList.remove('is-open');
  document.documentElement.classList.remove('has-detail');
  current = null;
  const done = () => {
    if (current) return; // reopened meanwhile
    root.hidden = true; panel.style.transform = ''; scrim.style.opacity = ''; panel.classList.remove('is-spring'); y = 0;
  };
  stopSpring?.();
  if (reducedMotion()) done();
  else if (panel.classList.contains('is-spring')) stopSpring = spring({ from: y, to: panel.offsetHeight + 24, velocity, stiffness: 300, damping: 30, onUpdate: setY, onDone: done });
  else setTimeout(done, 380);
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

// Drag the handle, or pull down on the sheet when it's scrolled to the top.
// The sheet follows the finger (rubber-banding upwards); on release it either
// springs home or closes, carrying the release velocity into the spring.
function dragToClose() {
  let dragging = false, offset = 0, samples = [], t = null;
  const begin = (cy) => {
    stopSpring?.();
    dragging = true; offset = cy - y; samples = [];
    panel.classList.add('is-spring', 'is-dragging');
  };
  const move = (cy) => {
    let ny = cy - offset;
    if (ny < 0) ny = -Math.sqrt(-ny) * 3; // resist pulling past the top
    setY(ny);
    samples.push([performance.now(), ny]);
    if (samples.length > 5) samples.shift();
  };
  const end = () => {
    dragging = false;
    panel.classList.remove('is-dragging');
    const a = samples[0], b = samples[samples.length - 1];
    const v = a && b && b[0] - a[0] > 0 ? ((b[1] - a[1]) / (b[0] - a[0])) * 1000 : 0; // px/s
    if (y > panel.offsetHeight * 0.28 || (v > 900 && y > 24)) close(true, v);
    else if (reducedMotion()) setY(0);
    else stopSpring = spring({ from: y, to: 0, velocity: v, stiffness: 420, damping: 30, onUpdate: setY });
  };
  panel.addEventListener('touchstart', (e) => {
    if (!isSheet() || e.touches.length > 1) { t = null; return; }
    const p = e.touches[0];
    t = { x: p.clientX, y: p.clientY, grab: !!e.target.closest('[data-grab]'), gal: !!e.target.closest('.gal') };
  }, { passive: true });
  panel.addEventListener('touchmove', (e) => {
    if (!t) return;
    const p = e.touches[0];
    if (!dragging) {
      const dy = p.clientY - t.y, dx = p.clientX - t.x;
      const pull = scrollBox && scrollBox.scrollTop <= 0 && dy > 6 && dy > Math.abs(dx) && !t.gal;
      if (!(t.grab || pull)) { if (Math.abs(dx) > 8 || dy < -6) t = null; return; }
      begin(t.y);
    }
    e.preventDefault();
    move(p.clientY);
  }, { passive: false });
  const tend = () => { t = null; if (dragging) end(); };
  panel.addEventListener('touchend', tend);
  panel.addEventListener('touchcancel', tend);
  // Mouse on the handle (narrow desktop windows).
  panel.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || !isSheet() || !e.target.closest('[data-grab]')) return;
    begin(e.clientY);
    const mv = (ev) => move(ev.clientY);
    const up = () => { removeEventListener('pointermove', mv); removeEventListener('pointerup', up); end(); };
    addEventListener('pointermove', mv);
    addEventListener('pointerup', up);
  });
}
