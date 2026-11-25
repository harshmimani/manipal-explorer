// Manipal Explorer · Part 4: every section, laid out with the Konkan Chronicles
// design system. Motion is deliberately minimal here (Part 5 adds GSAP/Lenis).
import './styles/fonts.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/sections.css';

import { places, loadData } from './modules/data.js';
import { header, hero, mustDo, chapter, explore, mapSection, table, plan, festivalsSection, practicalSection, footer } from './modules/sections.js';
import { syncButtons, subscribe, explored, count, has } from './modules/state.js';
import { initDetail } from './modules/detail.js';
import { initExplore } from './modules/explore.js';
import { initMap } from './modules/map.js';
import { initPinGallery } from './modules/gallery.js';

const app = document.getElementById('app');

// Places + image credits load as separate JSON files (kept out of the JS bundle).
loadData().then(render, (err) => {
  console.error(err);
  app.innerHTML = '<p class="load-error" role="alert">The guide couldn’t load its places. Check your connection and refresh.</p>';
});

function render() {
  app.innerHTML = `
  ${header()}
  <main id="main">
    ${hero()}
    ${mustDo()}
    ${chapter('coast')}
    ${chapter('gods')}
    ${chapter('ghats')}
    ${chapter('heritage')}
    ${explore()}
    ${mapSection()}
    ${table()}
    ${plan()}
    ${festivalsSection()}
    ${practicalSection()}
  </main>
  ${footer()}`;

  // "Been there" progress ring + explored %.
  function syncExplored() {
    const pct = explored();
    document.querySelectorAll('[data-explored-pct]').forEach((el) => { el.textContent = `${pct}%`; });
    document.querySelectorAll('[data-been-count]').forEach((el) => { el.textContent = count('been'); });
    document.querySelectorAll('.ring').forEach((r) => r.style.setProperty('--p', Math.max(pct, count('been') ? 1.5 : 0)));
    document.querySelectorAll('[data-explored]').forEach((a) => a.setAttribute('aria-label', `Explored ${pct}%: ${count('been')} of ${places.length} places marked as been there`));
    document.querySelectorAll('.card').forEach((c) => c.classList.toggle('is-been', has('been', c.dataset.place)));
  }

  syncButtons();
  syncExplored();
  subscribe(syncExplored);
  initDetail();
  initExplore();
  initMap();
  initPinGallery();

  // Header turns solid once past the hero.
  const head = document.querySelector('[data-head]');
  const heroEl = document.getElementById('top');
  new IntersectionObserver(([e]) => head.classList.toggle('is-solid', !e.isIntersecting), { rootMargin: '-64px 0px 0px 0px' }).observe(heroEl);
}
