// Everything after the hero (lazy chunk, loaded in parallel with the data).
//
// The Top 10 renders straight away. Every section below it starts as an empty,
// screen-tall placeholder and renders when the reader gets within about a
// screen and a half of it, so a phone only builds what is about to be seen.
// Sections always render in page order (a later one never appears before an
// earlier one), and they also render ahead of:
//   - in-page links and hash links (#festivals, #ch-plan, #trip-…): everything up to the target,
//   - keyboard focus: tabbing into the last rendered section renders the next,
//   - Ctrl/Cmd+F and printing: everything, so find-in-page and print see the whole guide.
import { places } from './data.js';
import { mustDo, chapter, explore, mapSection, table, plan, festivalsSection, practicalSection, footer } from './sections.js';
import { syncButtons, subscribe, explored, count, has } from './state.js';
import { initDetail } from './detail.js';
import { initExplore } from './explore.js';
import { initMap } from './map.js';
import { initPinGallery } from './gallery.js';

// [id, render, ids that live inside it (link targets), after-render hook]
const PARTS = [
  ['ch-coast', () => chapter('coast')],
  ['ch-gods', () => chapter('gods')],
  ['ch-ghats', () => chapter('ghats')],
  ['ch-heritage', () => chapter('heritage')],
  ['explore', explore, [], initExplore],
  ['map', mapSection, [], initMap],
  ['ch-table', table],
  ['plan', plan, ['ch-plan', 'trip-']],
  ['festivals', festivalsSection],
  ['practical', practicalSection],
  ['credits', footer],
];

// "Been there" progress ring + explored %.
function syncExplored() {
  const pct = explored();
  document.querySelectorAll('[data-explored-pct]').forEach((el) => { el.textContent = `${pct}%`; });
  document.querySelectorAll('[data-been-count]').forEach((el) => { el.textContent = count('been'); });
  document.querySelectorAll('.ring').forEach((r) => r.style.setProperty('--p', Math.max(pct, count('been') ? 1.5 : 0)));
  // The accessible name starts with the visible text (WCAG 2.5.3), then explains it.
  document.querySelectorAll('[data-explored]').forEach((a) => a.setAttribute('aria-label', `${pct}% explored${a.hasAttribute('data-explored-full') ? ` · ${count('been')}/${places.length}` : ''}: ${count('been')} of ${places.length} places marked as been there`));
  document.querySelectorAll('.card').forEach((c) => c.classList.toggle('is-been', has('been', c.dataset.place)));
}

export function renderRest(app, main, restDone, motion) {
  main.insertAdjacentHTML('beforeend', mustDo());
  // Placeholders: same ids as the real sections, so links resolve before they render.
  main.insertAdjacentHTML('beforeend', PARTS.slice(0, -1).map(([id]) => `<div class="lazy-sec" id="${id}" data-lazy aria-busy="true"></div>`).join(''));
  app.insertAdjacentHTML('beforeend', `<div class="lazy-sec lazy-sec--foot" id="credits" data-lazy aria-busy="true"></div>`);

  syncButtons();
  syncExplored();
  subscribe(syncExplored);
  initDetail();
  initPinGallery();

  let next = 0; // index of the first part not yet rendered
  const rendered = [document.getElementById('must-do')];
  const io = new IntersectionObserver((entries) => {
    const hit = entries.filter((e) => e.isIntersecting).map((e) => PARTS.findIndex(([id]) => id === e.target.id));
    if (hit.length) renderTo(Math.max(...hit));
  }, { rootMargin: '0px 0px 150% 0px' });

  function renderTo(i) {
    while (next <= i && next < PARTS.length) {
      const [id, html, , init] = PARTS[next++];
      const ph = document.getElementById(id);
      io.unobserve(ph);
      ph.insertAdjacentHTML('afterend', html());
      ph.remove();
      const el = document.getElementById(id);
      rendered.push(el);
      syncButtons(el);
      init?.();
      syncExplored();
      motion?.addSection(el);
    }
  }
  const indexFor = (target) => PARTS.findIndex(([id, , inside = []]) => id === target || inside.some((x) => (x.endsWith('-') ? target.startsWith(x) : x === target)));
  // Render everything up to a link target; unknown targets render the lot.
  const need = (target) => { const i = indexFor(target); renderTo(i < 0 ? PARTS.length - 1 : i); };

  document.addEventListener('me:need', (e) => need(e.detail));
  addEventListener('hashchange', () => {
    const id = decodeURIComponent(location.hash.slice(1));
    if (id && !id.startsWith('place-')) { need(id); document.getElementById(id)?.scrollIntoView(); }
  });
  // Keyboard: focus inside the last rendered section brings in the next one.
  document.addEventListener('focusin', (e) => {
    if (next >= PARTS.length) return;
    const last = rendered.at(-1);
    if (last?.contains(e.target) || e.target === main) renderTo(next);
  });
  addEventListener('keydown', (e) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') renderTo(PARTS.length - 1); });
  addEventListener('beforeprint', () => renderTo(PARTS.length - 1));

  restDone();
  PARTS.forEach(([id]) => io.observe(document.getElementById(id)));

  // A section link (#festivals) followed from elsewhere: render up to it, then go.
  const id = decodeURIComponent(location.hash.slice(1));
  if (id && !id.startsWith('place-')) { need(id); document.getElementById(id)?.scrollIntoView(); }
}
