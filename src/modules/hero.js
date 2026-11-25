// Header and hero: the only markup in the first render. They read just the
// build-time summary (virtual:hero-data), never places.json, so they paint
// before the data arrives. Everything else lives in sections.js (lazy chunk).
import { hero as heroData } from './data.js';
import { CHAPTERS, MONTHS_LONG, thisMonth, esc, picture, creditLine, monthStrip } from './util.js';

export const ring = (cls = '') => `<svg class="ring ${cls}" viewBox="0 0 40 40" aria-hidden="true"><circle class="ring__bg" cx="20" cy="20" r="17"/><circle class="ring__fg" cx="20" cy="20" r="17" pathLength="100"/></svg>`;

// ── Header (fixed) ─────────────────────────────────────────────────────
export const header = () => `
<header class="site-head" data-head>
  <a class="brand" href="#top">Manipal <i>Explorer</i></a>
  <nav class="site-head__nav" aria-label="Sections">
    <a href="#must-do">Top 10</a><a href="#explore">Explore</a><a href="#map">Map</a><a href="#plan">Trips</a><a href="#festivals">Festivals</a>
  </nav>
  <a class="explored" href="#explore" data-explored aria-label="0% explored">
    ${ring()}<span class="explored__txt"><b class="num" data-explored-pct>0%</b><span class="cap">explored</span></span>
  </a>
</header>`;

// ── 1. Hero ────────────────────────────────────────────────────────────
// Renders before places.json arrives: it reads only the build-time summary
// (virtual:hero-data). The image id is kept in step with HERO_IMAGE in vite.config.js.
export function hero() {
  const img = heroData.credit.id, total = heroData.count;
  const monthName = MONTHS_LONG[thisMonth - 1];
  return `
<section class="hero" id="top" aria-labelledby="hero-h">
  <div class="hero__media" aria-hidden="true">${picture(img, { eager: true, alt: '' })}</div>
  <div class="hero__shader" data-shader-slot aria-hidden="true"></div>
  <div class="leak leak--sun" aria-hidden="true"></div><div class="leak leak--sea" aria-hidden="true"></div>
  <div class="bars" aria-hidden="true"><i></i><i></i></div>
  <ol class="rail" aria-label="Chapters">
    ${CHAPTERS.map((c) => `<li><a href="#ch-${c.id}"><b>${c.num}</b>${c.title}</a></li>`).join('')}
  </ol>
  <div class="hero__body">
    <p class="kicker cap">A field guide from Manipal</p>
    <h1 id="hero-h"><span class="ln"><span>Sea, gods</span></span><span class="ln"><span><span class="amp">&amp;</span> ghats,</span></span><span class="ln"><span><em>one ride</em> away.</span></span></h1>
    <ol class="chips" aria-label="Chapters">${CHAPTERS.map((c) => `<li><a href="#ch-${c.id}"><b>${c.num}</b>${c.short}</a></li>`).join('')}</ol>
  </div>
  <div class="hero__row">
    <p class="hero__sub">${total} places a bike or a Konkan train from Manipal: beaches, temples, falls, forts and peaks. ${heroData.trips} ready-made trips, ${heroData.festivals} festivals through the year, and every plate vegetarian.</p>
    <div class="season">
      <p>In ${monthName}, <b class="num">${heroData.monthCounts[thisMonth - 1]} places</b> are in their best season.</p>
      ${monthStrip([], { label: 'Months of the year, this month marked' })}
    </div>
    <div class="hero__aside">
      <a class="explored explored--hero" href="#explore" data-explored data-explored-full aria-label="0% explored · 0/${total}">${ring()}<span class="explored__txt"><b class="num" data-explored-pct>0%</b><span class="cap">explored · <span data-been-count>0</span>/${total}</span></span></a>
      <a class="scroll cap" href="#must-do"><i aria-hidden="true"></i>Scroll</a>
    </div>
  </div>
  <p class="hero__credit credit">${creditLine(img)} · ${esc(heroData.placeName)}</p>
</section>`;
}

