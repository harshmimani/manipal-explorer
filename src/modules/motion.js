// Part 5 · motion. Every effect here has a job:
//   intro       → the film opens: letterbox closes on a title card, then parts on the hero.
//   Lenis       → wheel scrolling glides, so scrubbed parallax and pins read as one camera move.
//   splits      → headlines land word by word, so the eye goes to them first.
//   reveals     → photos are revealed, not just shown: an ink curtain lifts, each card a frame being developed.
//   openers     → chapters pin for a beat: the numeral comes forward, the Gods' arch opens like a door.
//   Flip        → filtering moves cards to their new place, so you see what stayed and what went
//                 (laptop; phones get a lighter staggered rise, measured cheaper).
//   cursor      → on laptops it tells you what a click does ("View" over photos).
//   magnetic / tilt → buttons and cards answer the pointer; you can feel what is interactive.
//   swipe bars  → on phones, a thin thumb shows how far through a carousel you are.
//   feedback    → starring or marking "Been there" pops, bursts and (on Android) ticks the motor.
// Under prefers-reduced-motion none of this runs except plain opacity fades.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { Flip } from 'gsap/Flip';
import Lenis from 'lenis';
import { places } from './data.js';
import { setAnimator, onCards, onGridDone } from './explore.js';

const EXPO = 'expo.out';
const FILM = 'power4.inOut';
const html = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const touch = !fine;

const CARD_FADE = '.dish, .eat, .anna__card, .trip, .soon__i, .watch__card, .pr__card, .head > p, .opener__kicker, .opener__row, .sub-lede, .seasons';
const HEADINGS = '.head h2, .opener h2, .sub-h';

export const motion = { lenis: null };

// Called as soon as the header and hero are on the page (they render before the
// data arrives). `rest` resolves once every other section is in the DOM.
// Returns a promise that settles when the intro is over or skipped: on a first
// visit main.js holds the heavy render until then, so the intro runs smoothly.
// Sections below the Top 10 render as the reader nears them (rest.js), so the
// scroll effects are set up per section: addSection(root) wires a new one.
let wire = null;
export function addSection(root) { wire?.(root); }

// Called as soon as the header and hero are on the page (they render before the
// data arrives). `rest` resolves once the first sections are in the DOM.
// Returns a promise that settles when the intro is over or skipped: on a first
// visit main.js holds the heavier render until then, so the intro runs smoothly.
export function initMotion(rest) {
  if (reduce) {
    endIntro(); shaderSlot()?.classList.add('is-static');
    const fades = reducedFades();
    rest.then(() => { fades.add(document); wire = fades.add; });
    return Promise.resolve();
  }
  gsap.registerPlugin(ScrollTrigger, SplitText, Flip);
  // No automatic refresh on window load: it lands mid-intro on slow phones.
  // We refresh once ourselves when the intro ends.
  ScrollTrigger.config({ autoRefreshEvents: 'visibilitychange,DOMContentLoaded,resize' });
  gsap.config({ force3D: true });
  motion.lenis = smoothScroll();
  hero();
  const introDone = new Promise((done) => intro(done));
  // Anything that changes page height above a pin (details opening, map load) re-measures.
  let t = 0;
  const refresh = () => { clearTimeout(t); t = setTimeout(() => ScrollTrigger.refresh(), 160); };
  // Blocks below the map skip layout until near the screen (motion.css);
  // when one first renders at its real height, pins below it re-measure.
  const seen = new WeakSet();
  const ro = new ResizeObserver((es) => { let grew = false; es.forEach((e) => { if (seen.has(e.target)) grew = true; else seen.add(e.target); }); if (grew) refresh(); });
  const CV = '#ch-table > .wrap, #plan > .timeline, #festivals, #practical';
  rest.then(() => {
    // Hidden states are set as sections arrive; observing starts after the intro
    // (scroll is locked during it, and observing hundreds of targets costs main
    // thread on a throttled phone while the intro animates).
    const reveals = cardReveals(), fades = fadeUps(), splits = splitHeadings();
    const setup = (root) => {
      reveals.add(root); fades.add(root); splits.add(root);
      openers(root); swipeTracks(root);
      [root, ...root.querySelectorAll(CV)].filter((el) => el.matches?.(CV)).forEach((el) => ro.observe(el));
    };
    setup(document);
    flipFilters();
    feedback();
    sheetContent();
    if (fine) { cursor(); magnetic(); tilt(); }
    wire = (root) => { setup(root); refresh(); };
    // Headline splits and the shader wait until the intro is done, so neither
    // competes with it for the main thread on a slow phone.
    introDone.then(() => idle(() => {
      reveals.start(); fades.start();
      (document.fonts?.ready ?? Promise.resolve()).then(() => {
        splits.start();
        ScrollTrigger.refresh();
        document.addEventListener('toggle', refresh, true);
        onGridDone(refresh); // the grid's later batches push everything below it down
        addEventListener('load', refresh);
        idle(mountShader);
      });
    }));
  });
  return introDone;
}

const shaderSlot = () => document.querySelector('[data-shader-slot]');
const idle = (fn) => ('requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 1500 }) : setTimeout(fn, 300));
function mountShader() {
  const slot = shaderSlot();
  if (!slot) return;
  import('./shader.js').then((m) => m.mountShader(slot, { fine })).catch(() => slot.classList.add('is-static'));
}

// ── Smooth scroll ─────────────────────────────────────────────────────
function smoothScroll() {
  const lenis = new Lenis({
    lerp: 0.1, smoothWheel: true, syncTouch: false, // phones keep native momentum
    prevent: (node) => !!node.closest?.('.detail, .filters, .map, .leaflet-container, [data-lenis-prevent]'),
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  // A long frame (first layout on a slow phone) counts as 33 ms, so no animation jumps to its end.
  gsap.ticker.lagSmoothing(500, 33);
  // Sheets and the intro hold the page still.
  const sync = () => {
    const c = html.classList;
    (c.contains('has-detail') || c.contains('has-filters') || c.contains('is-intro')) ? lenis.stop() : lenis.start();
  };
  new MutationObserver(sync).observe(html, { attributes: true, attributeFilter: ['class'] });
  sync();
  // In-page links glide to their section (the skip link keeps native jump + focus).
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented || a.hasAttribute('data-open') || a.classList.contains('skip')) return;
    const id = decodeURIComponent(a.getAttribute('href').slice(1));
    if (!id || id.startsWith('place-')) return;
    // Sections render as the reader nears them (rest.js): bring in everything up to the target first.
    document.dispatchEvent(new CustomEvent('me:need', { detail: id }));
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    // Blocks below the map skip layout until near the screen (content-visibility),
    // so their real height can change mid-glide; land, then correct (twice at most).
    const offset = id === 'top' ? 0 : -64;
    const settle = (n) => () => {
      const off = el.getBoundingClientRect().top + offset;
      if (n && Math.abs(off) > 4) lenis.scrollTo(el, { offset, duration: 0.45, onComplete: settle(n - 1) });
    };
    lenis.scrollTo(el, { offset, duration: 1.5, easing: (x) => 1 - Math.pow(1 - x, 4), onComplete: settle(2) });
    history.pushState(null, '', `#${id}`);
  });
  return lenis;
}

// ── Intro: first visit per session only, ≤ 2.5 s, skippable ───────────
function endIntro() {
  document.querySelector('[data-intro]')?.remove();
  html.classList.remove('is-intro');
}

function intro(after) {
  const overlay = document.querySelector('[data-intro]');
  const lines = gsap.utils.toArray('.hero h1 .ln > span');
  const rest = gsap.utils.toArray('.hero .kicker, .hero__row > :not(.hero__sub), .hero .chips, .rail');
  // The sub line lifts without a fade: it is the page's largest text, and a
  // paragraph painted at opacity 0 would not count as painted (LCP) until it fades in.
  const sub = '.hero__sub';
  if (!html.classList.contains('is-intro') || !overlay) {
    // Repeat visit: no title card. The headline still lands, but in CSS
    // (motion.css .hero-rise) from the first paint, without waiting for this chunk.
    endIntro();
    after();
    return;
  }
  try { sessionStorage.setItem('me:intro', '1'); } catch { /* blocked storage: intro may replay */ }
  const n = overlay.querySelector('[data-intro-n]');
  const counter = { v: 0 };
  const letterbox = document.querySelector('.hero .bars i')?.offsetHeight ?? 0;
  const tl = gsap.timeline({ paused: true, defaults: { ease: EXPO }, onComplete: finish });
  tl.set('.intro__slate', { autoAlpha: 1 }, 0)
    .from('.intro__slate .w', { yPercent: 115, duration: 0.8, stagger: 0.08 }, 0)
    .from('.intro__count', { autoAlpha: 0, y: 10, duration: 0.6 }, 0.25)
    .to(counter, { v: places.length, duration: 0.8, ease: 'power2.out', onUpdate: () => { n.textContent = Math.round(counter.v); } }, 0.25)
    .fromTo('.intro__seam', { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: FILM }, 0.1)
    .to('.intro__slate', { yPercent: -30, autoAlpha: 0, duration: 0.4, ease: 'power2.in' }, 1.0)
    .to('.intro__seam', { autoAlpha: 0, duration: 0.25 }, 1.05)
    .to('.intro__skip', { autoAlpha: 0, duration: 0.3 }, 1.05)
    // scaleY, not height: compositor-only, no layout per frame.
    .to('.intro__bar', { scaleY: letterbox / (innerHeight * 0.505), duration: 1.0, ease: FILM }, 1.05)
    .from(lines, { yPercent: 112, duration: 0.9, stagger: 0.07 }, 1.4)
    .from(rest, { y: 22, opacity: 0, duration: 0.7, stagger: 0.03, clearProps: 'transform,opacity' }, 1.5)
    .from(sub, { y: 22, duration: 0.7, clearProps: 'transform' }, 1.5);
  // Phones get the same choreography at 2.4x speed (about 1 s): a long intro holds
  // a phone's screen while the reader waits to scroll. Laptops keep the full ≈ 2.45 s.
  if (matchMedia('(max-width: 999px)').matches) tl.timeScale(2.4);
  // Built paused (so the hero is already in its start pose) and played after the
  // page's first heavy paint, so a slow phone sees the whole thing.
  afterFirstPaint(() => tl.play());
  // Total ≈ 2.45 s (about 1 s on phones). Any key, click, wheel or touch skips straight to the end.
  const skip = () => tl.progress(1);
  const evs = ['keydown', 'pointerdown', 'wheel', 'touchstart'];
  evs.forEach((ev) => addEventListener(ev, skip, { passive: true }));
  function finish() {
    evs.forEach((ev) => removeEventListener(ev, skip));
    endIntro();
    after();
  }
}

const afterFirstPaint = (fn) => requestAnimationFrame(() => requestAnimationFrame(fn));

// ── Hero depth ────────────────────────────────────────────────────────
function hero() {
  const st = () => ({ trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true });
  gsap.to('.hero__media picture', { yPercent: 14, ease: 'none', scrollTrigger: st() });
  gsap.to('.hero__shader', { yPercent: 8, ease: 'none', scrollTrigger: st() });
  gsap.to('.hero__body', { yPercent: -16, opacity: 0.25, ease: 'none', scrollTrigger: st() });
  gsap.to('.leak--sun', { xPercent: -20, yPercent: 30, ease: 'none', scrollTrigger: st() });
  gsap.to('.leak--sea', { xPercent: 18, yPercent: -12, ease: 'none', scrollTrigger: st() });
}

// Reveal in batches as things enter: one IntersectionObserver, staggered per frame.
function batcher(onBatch, rootMargin = '0px 0px -8% 0px') {
  let queue = [], raf = 0;
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { io.unobserve(e.target); queue.push(e.target); }
    if (queue.length && !raf) raf = requestAnimationFrame(() => {
      raf = 0;
      const b = queue.sort((a, c) => (a.compareDocumentPosition(c) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
      queue = [];
      onBatch(b);
    });
  }, { rootMargin });
  return io;
}

// ── Cards: an ink curtain lifts off the photo, the photo settles from 1.3×,
// the text follows. All CSS transitions on transform/opacity (motion.css .rv),
// so they run on the compositor: a GSAP clip-path wipe measured ~50 % dropped
// frames while fast-scrolling the 107-card grid; this measured near zero.
function cardReveals() {
  const io = batcher((cards) => cards.forEach((c, i) => {
    c.style.setProperty('--rv-d', `${Math.min(i, 6) * 0.09}s`);
    c.classList.remove('rv');
    setTimeout(() => c.style.removeProperty('--rv-d'), 2200); // so later hovers have no delay
  }), '0px 25% -6% 25%');
  // Grid cards arrive in batches (explore.js) and sections as the reader nears
  // them (rest.js): each card joins the same observer as it lands.
  const cards = new Set();
  let live = false;
  const one = (c) => { if (cards.has(c)) return; cards.add(c); c.classList.add('rv'); if (live) io.observe(c); };
  onCards((list) => list.forEach(one));
  return {
    add: (root) => root.querySelectorAll('.card').forEach(one),
    start: () => { live = true; cards.forEach((c) => { if (c.classList.contains('rv')) io.observe(c); }); },
  };
}

function fadeUps() {
  const io = batcher((els) => {
    // Opacity only, never visibility: content waiting to fade in must stay in
    // the tab order (keyboard users reach it before scrolling to it).
    gsap.fromTo(els, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1, ease: EXPO, stagger: 0.06, clearProps: 'transform,opacity' });
    els.forEach((el) => el.classList.remove('fu'));
  });
  const els = new Set();
  let live = false;
  return {
    add: (root) => root.querySelectorAll(CARD_FADE).forEach((el) => { if (els.has(el)) return; els.add(el); el.classList.add('fu'); if (live) io.observe(el); }),
    start: () => { live = true; els.forEach((el) => { if (el.classList.contains('fu')) io.observe(el); }); },
  };
}

// ── Split headlines (after fonts, so line breaks are final) ──────────
function splitHeadings() {
  const io = batcher((els) => els.forEach((el, i) => gsap.to(el._words, { yPercent: 0, duration: 1.1, ease: EXPO, stagger: 0.06, delay: i * 0.1 })), '0px 0px -10% 0px');
  // Split each headline about a screen before it arrives, not all ~30 at once
  // (that measured ~430 ms on a throttled phone, right as the intro ends).
  const pre = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    const el = e.target;
    pre.unobserve(el);
    const s = SplitText.create(el, { type: 'words', mask: 'words', ignore: '.vh' });
    el._words = s.words;
    gsap.set(s.words, { yPercent: 110 });
    io.observe(el);
  }), { rootMargin: '0px 0px 120% 0px' });
  const els = new Set();
  let live = false;
  return {
    add: (root) => root.querySelectorAll(HEADINGS).forEach((el) => { if (els.has(el)) return; els.add(el); if (live) pre.observe(el); }),
    start: () => { live = true; els.forEach((el) => pre.observe(el)); },
  };
}

// ── Chapter openers ───────────────────────────────────────────────────
const ARCH_SHUT = 'inset(100% 0% 0% 0% round 999px 999px 6px 6px)';
const ARCH_OPEN = 'inset(0% 0% 0% 0% round 999px 999px 6px 6px)';
function openers(root) {
  const mm = gsap.matchMedia();
  // Laptop: each opener pins for a beat. The numeral comes forward out of the
  // dark, the Gods' arch opens like a doorway, then everything recedes as the
  // pin lets go and the chapter's cards arrive.
  mm.add('(min-width: 1000px)', () => {
    root.querySelectorAll('.opener').forEach((op) => {
      const num = op.querySelector('.opener__num'), text = op.querySelector('.opener__text'), arch = op.querySelector('.arch__img');
      gsap.fromTo(num, { yPercent: 18 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: op, start: 'top bottom', end: 'top top', scrub: true } });
      const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: op, start: 'top top', end: '+=75%', scrub: 0.6, pin: true, anticipatePin: 1 } });
      tl.fromTo(num, { scale: 1.14, opacity: 0.45 }, { scale: 1, opacity: 1, duration: 0.6 }, 0)
        .fromTo(text, { y: 60 }, { y: 0, duration: 0.6 }, 0)
        .to(num, { scale: 0.92, opacity: 0.2, duration: 0.4 }, 0.6)
        .to(text, { y: -40, opacity: 0.5, duration: 0.4 }, 0.6);
      if (arch) {
        tl.fromTo(arch, { clipPath: ARCH_SHUT }, { clipPath: ARCH_OPEN, duration: 0.55 }, 0)
          .fromTo(arch.firstElementChild, { scale: 1.3 }, { scale: 1, duration: 0.6 }, 0)
          .to(arch.parentElement, { yPercent: -8, duration: 0.4 }, 0.6);
      }
    });
  });
  // Phone: no pinning (it fights thumb scrolling). The numeral drifts against
  // the scroll for depth and the arch opens once as it comes into view.
  mm.add('(max-width: 999px)', () => {
    root.querySelectorAll('.opener__num').forEach((num) => {
      gsap.fromTo(num, { yPercent: -10 }, { yPercent: 12, ease: 'none', scrollTrigger: { trigger: num.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    root.querySelectorAll('.arch__img').forEach((arch) => {
      gsap.fromTo(arch, { clipPath: ARCH_SHUT }, { clipPath: ARCH_OPEN, duration: 1.4, ease: FILM, scrollTrigger: { trigger: arch, start: 'top 85%', once: true } });
    });
  });
}

// ── Filters: cards Flip to their new spots ────────────────────────────
function flipFilters() {
  let tl = null, t = 0;
  const narrow = matchMedia('(max-width: 999px)');
  const refresh = () => { clearTimeout(t); t = setTimeout(() => ScrollTrigger.refresh(), 120); };
  setAnimator((cards, mutate) => {
    const vh = innerHeight;
    // Only cards near the viewport animate; the rest just move (keeps a 107-card grid cheap).
    const near = (c) => { if (c.hidden) return false; const r = c.getBoundingClientRect(); return r.bottom > -vh * 0.25 && r.top < vh * 1.25; };
    tl?.progress(1);
    // Phones (one column): Flip measured at 27 % dropped frames on a 4× throttled
    // CPU, so there the newly shown cards just rise in, staggered.
    if (narrow.matches) {
      const was = new Set(cards.filter((c) => !c.hidden));
      mutate();
      const fresh = cards.filter((c) => !was.has(c) && near(c));
      if (fresh.length) tl = gsap.fromTo(fresh, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.55, ease: EXPO, stagger: 0.05, clearProps: 'transform,opacity' });
      return refresh();
    }
    const before = cards.filter(near);
    const state = Flip.getState(before);
    mutate();
    const after = cards.filter(near);
    const targets = [...new Set([...before, ...after])];
    if (!targets.length) return refresh();
    tl = Flip.from(state, {
      targets, duration: 0.7, ease: EXPO, absolute: true, prune: true, stagger: 0.012,
      onEnter: (els) => gsap.fromTo(els, { autoAlpha: 0, scale: 0.92 }, { autoAlpha: 1, scale: 1, duration: 0.6, ease: EXPO, stagger: 0.025, delay: 0.08 }),
      onLeave: (els) => gsap.to(els, { autoAlpha: 0, scale: 0.92, duration: 0.28, ease: 'power2.in' }),
      onComplete: refresh,
    });
  });
}

// ── Swipe carousels: thumb + photo parallax inside each card ─────────
export function swipeTracks(root) {
  if (reduce) return;
  root.querySelectorAll('.track--chapter, .mustdo__track, .gal').forEach((track) => {
    if (track.dataset.swipe) return;
    track.dataset.swipe = '1';
    const bar = document.createElement('div');
    bar.className = 'swipe-bar'; bar.setAttribute('aria-hidden', 'true'); bar.innerHTML = '<i></i>';
    track.after(bar);
    const thumb = bar.firstChild;
    const items = [...track.querySelectorAll(':scope > .card, :scope > .gal__i')];
    const imgs = items.map((it) => it.querySelector('img'));
    let raf = 0, live = false;
    const update = () => {
      raf = 0;
      const max = track.scrollWidth - track.clientWidth;
      const on = max > 4 && !track.closest('.is-pinned');
      bar.hidden = !on;
      if (!on) { if (live) imgs.forEach((im) => im && (im.style.transform = '')); live = false; return; }
      live = true;
      const w = track.clientWidth / track.scrollWidth, p = track.scrollLeft / max;
      thumb.style.width = `${w * 100}%`;
      thumb.style.transform = `translate3d(${(p * (1 - w)) / w * 100}%,0,0)`;
      // Reads first, then writes.
      const sl = track.scrollLeft, cw = track.clientWidth;
      const offs = items.map((it) => (it.offsetLeft - sl + it.offsetWidth / 2 - cw / 2) / cw);
      offs.forEach((o, i) => { const im = imgs[i]; if (im) im.style.transform = `translate3d(${Math.max(-1, Math.min(1, o)) * -5}%,0,0) scale(1.12)`; });
    };
    const tick = () => { if (!raf) raf = requestAnimationFrame(update); };
    track.addEventListener('scroll', tick, { passive: true });
    addEventListener('resize', tick);
    update();
  });
}

// ── Toggle micro-feedback ─────────────────────────────────────────────
const POP = [{ transform: 'scale(1)' }, { transform: 'scale(.78)', offset: 0.25 }, { transform: 'scale(1.18)', offset: 0.6 }, { transform: 'scale(1)' }];
function burst(el) {
  const r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  const wrap = document.createElement('div');
  wrap.className = 'burst'; wrap.setAttribute('aria-hidden', 'true');
  wrap.style.cssText = `left:${cx}px;top:${cy}px`;
  document.body.append(wrap);
  for (let i = 0; i < 8; i++) {
    const dot = document.createElement('i');
    wrap.append(dot);
    const a = (i / 8) * Math.PI * 2 + 0.3, d = 26 + (i % 2) * 8;
    dot.animate([{ transform: 'translate(-50%,-50%) scale(1)', opacity: 1 }, { transform: `translate(calc(-50% + ${Math.cos(a) * d}px), calc(-50% + ${Math.sin(a) * d}px)) scale(.2)`, opacity: 0 }],
      { duration: 560, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'forwards' });
  }
  setTimeout(() => wrap.remove(), 620);
}
function feedback() {
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-toggle]');
    if (!b) return;
    requestAnimationFrame(() => {
      const on = b.getAttribute('aria-pressed') === 'true';
      (b.querySelector('svg') || b).animate(POP, { duration: on ? 560 : 320, easing: 'cubic-bezier(.34,1.36,.64,1)' });
      if (on && b.classList.contains('star')) burst(b);
      if (on && b.dataset.toggle === 'been') {
        const path = b.querySelector('path');
        path?.animate([{ strokeDasharray: '24', strokeDashoffset: '24' }, { strokeDasharray: '24', strokeDashoffset: '0' }], { duration: 420, easing: 'cubic-bezier(.16,1,.3,1)' });
        document.querySelectorAll('.explored .ring').forEach((ring) => ring.animate(POP, { duration: 600, easing: 'cubic-bezier(.34,1.36,.64,1)' }));
      }
      if (on && touch) navigator.vibrate?.(8);
    });
  });
  // Filter chips give under the thumb; the count rolls to its new number.
  document.addEventListener('change', (e) => {
    const chip = e.target.closest?.('.fchip');
    if (chip) chip.querySelector('span').animate([{ transform: 'scale(.92)' }, { transform: 'scale(1.04)' }, { transform: 'scale(1)' }], { duration: 360, easing: 'cubic-bezier(.34,1.36,.64,1)' });
  });
  const count = document.querySelector('[data-count]');
  if (count) {
    // Our own writes are discarded with takeRecords(); records are delivered
    // asynchronously, so a flag alone would let them echo back forever.
    let shown = Number(count.textContent);
    const roll = { v: shown };
    const write = (v) => { count.textContent = v; mo.takeRecords(); };
    const mo = new MutationObserver(() => {
      const next = Number(count.textContent);
      if (next === shown) return;
      write(Math.round(roll.v));
      shown = next;
      gsap.to(roll, { v: next, duration: 0.5, ease: 'power3.out', overwrite: true, onUpdate: () => write(Math.round(roll.v)) });
    });
    mo.observe(count, { childList: true, characterData: true, subtree: true });
  }
}

// Detail panel: blocks follow the sheet in; its gallery gets the swipe thumb.
function sheetContent() {
  document.addEventListener('detail:open', (e) => {
    const panel = e.detail;
    swipeTracks(panel);
    const first = panel.querySelector('.gal__i picture, .gal--none .gradart');
    if (first) gsap.fromTo(first, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1, ease: 'power4.out', delay: 0.12, clearProps: 'clipPath' });
    gsap.from(panel.querySelectorAll('.sheet__in > *'), { y: 26, autoAlpha: 0, duration: 0.8, ease: EXPO, stagger: 0.04, delay: 0.18, clearProps: 'transform,opacity,visibility' });
  });
}

// ── Desktop pointer extras ────────────────────────────────────────────
function cursor() {
  const cur = document.createElement('div');
  cur.className = 'cursor'; cur.setAttribute('aria-hidden', 'true');
  cur.innerHTML = '<span>View</span>';
  document.body.append(cur);
  html.classList.add('has-cursor');
  const xTo = gsap.quickTo(cur, 'x', { duration: 0.35, ease: 'power3' });
  const yTo = gsap.quickTo(cur, 'y', { duration: 0.35, ease: 'power3' });
  let seen = false;
  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    if (!seen) { gsap.set(cur, { x: e.clientX, y: e.clientY }); seen = true; }
    cur.classList.add('is-on');
    xTo(e.clientX); yTo(e.clientY);
  }, { passive: true });
  document.addEventListener('pointerover', (e) => {
    const t = e.target;
    const ctrl = t.closest('button, select, input, summary, label, .leaflet-control, .leaflet-marker-icon, .leaflet-popup');
    const card = !ctrl && t.closest('.card');
    const media = (card && card.querySelector('[data-cursor="media"]')) || (!ctrl && t.closest('[data-cursor="media"], .gal__i picture'));
    const link = !media && (ctrl || t.closest('a'));
    cur.classList.toggle('is-media', !!media);
    cur.classList.toggle('is-link', !!link);
  });
  document.addEventListener('pointerout', (e) => { if (!e.relatedTarget) cur.classList.remove('is-on'); });
  addEventListener('pointerdown', () => cur.classList.add('is-down'));
  addEventListener('pointerup', () => cur.classList.remove('is-down'));
}

function magnetic() {
  const SEL = '.btn, .star, .sheet__close, .rail a, .site-head__nav a, [data-magnetic]';
  let cur = null;
  const release = (el) => gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, .45)', overwrite: 'auto' });
  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const el = e.target.closest?.(SEL) || null;
    if (cur && cur !== el) release(cur);
    cur = el;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2 - gsap.getProperty(el, 'x'), cy = r.top + r.height / 2 - gsap.getProperty(el, 'y');
    const k = el.classList.contains('star') ? 0.22 : 0.3;
    gsap.to(el, { x: (e.clientX - cx) * k, y: (e.clientY - cy) * k, duration: 0.5, ease: 'power3.out', overwrite: 'auto' });
  }, { passive: true });
}

function tilt() {
  let card = null;
  const flat = (c) => gsap.to(c, { rotationX: 0, rotationY: 0, duration: 0.9, ease: EXPO, overwrite: 'auto' });
  addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const c = e.target.closest?.('.card') || null;
    if (card && card !== c) flat(card);
    card = c;
    if (!c) return;
    const r = c.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    gsap.to(c, { rotationY: x * 10, rotationX: -y * 8, transformPerspective: 1000, duration: 0.6, ease: 'power3.out', overwrite: 'auto' });
  }, { passive: true });
}

// ── Reduced motion: plain fades, nothing moves ────────────────────────
function reducedFades() {
  const els = new Set();
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    io.unobserve(e.target);
    e.target.classList.remove('rm-wait');
    e.target.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 450, easing: 'linear' });
  }), { rootMargin: '0px 0px -4% 0px' });
  const one = (el) => { if (els.has(el)) return; els.add(el); el.classList.add('rm-wait'); io.observe(el); };
  onCards((list) => list.forEach(one));
  return { add: (root) => root.querySelectorAll(`.card, .opener__text, ${CARD_FADE}`).forEach(one) };
}
