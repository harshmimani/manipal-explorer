// Everything after the hero (lazy chunk, loaded in parallel with the data).
// Sections render one per task, so no single task blocks the phone for long.
import { places } from './data.js';
import { mustDo, chapter, explore, mapSection, table, plan, festivalsSection, practicalSection, footer } from './sections.js';
import { syncButtons, subscribe, explored, count, has } from './state.js';
import { initDetail } from './detail.js';
import { initExplore } from './explore.js';
import { initMap } from './map.js';
import { initPinGallery } from './gallery.js';

const nextTask = () => new Promise((r) => setTimeout(r, 0));

export async function renderRest(app, main, restDone) {
  const parts = [mustDo, () => chapter('coast'), () => chapter('gods'), () => chapter('ghats'), () => chapter('heritage'),
    explore, mapSection, table, plan, festivalsSection, practicalSection];
  for (const part of parts) {
    main.insertAdjacentHTML('beforeend', part());
    await nextTask();
  }
  app.insertAdjacentHTML('beforeend', footer());

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

  syncButtons();
  syncExplored();
  subscribe(syncExplored);
  initDetail();
  initExplore();
  initMap();
  initPinGallery();
  restDone();

  // A section link (#festivals) followed from elsewhere: the target only exists now.
  const id = decodeURIComponent(location.hash.slice(1));
  if (id && !id.startsWith('place-')) document.getElementById(id)?.scrollIntoView();
}
