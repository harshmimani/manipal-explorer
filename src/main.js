// Manipal Explorer: every section, laid out with the Konkan Chronicles design
// system (Part 4), brought to life by src/modules/motion.js (Part 5).
//
// Render order (Part 6, measured on a 4× throttled phone):
//   1. header + hero, straight away. They read only a build-time summary
//      (virtual:hero-data), not places.json, so the headline paints early.
//   2. Motion starts (intro or title rise) as soon as its chunk is in.
//   3. Once the data is in (and, on a first visit, the intro is over) every
//      other section renders, one per task, so no single task blocks for long.
import './styles/fonts.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/sections.css';
import './styles/motion.css';

import { loadData } from './modules/data.js';
import { header, hero } from './modules/hero.js';

const html = document.documentElement;
const app = document.getElementById('app');
const firstVisit = html.classList.contains('is-intro');

const dropIntro = () => { document.querySelector('[data-intro]')?.remove(); html.classList.remove('is-intro'); };

// 1 · Header and hero now.
app.innerHTML = `${header()}<main id="main">${hero()}</main>`;
const main = document.getElementById('main');
const head = document.querySelector('[data-head]');
new IntersectionObserver(([e]) => head.classList.toggle('is-solid', !e.isIntersecting), { rootMargin: '-64px 0px 0px 0px' }).observe(document.getElementById('top'));

// 2 · Motion. Its chunk (GSAP, Lenis) is preloaded from the HTML. If it fails,
// the site still works without motion.
let restDone;
const rest = new Promise((r) => { restDone = r; });
const data = loadData();
const restChunk = import('./modules/rest.js');
import('./modules/motion.js')
  .then((m) => m.initMotion(rest))
  .catch((err) => { console.warn(err); dropIntro(); })
  .then((introOver) => (firstVisit ? introOver : null))
  // 3 · Everything else, once the data is in and the intro has finished.
  .then(() => Promise.all([restChunk, data]))
  .then(([m]) => m.renderRest(app, main, restDone), (err) => {
    console.error(err);
    dropIntro();
    main.insertAdjacentHTML('beforeend', '<p class="load-error" role="alert">The guide couldn’t load its places. Check your connection and refresh.</p>');
  });
