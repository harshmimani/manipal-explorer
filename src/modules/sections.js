// Static section markup. Every fact comes from src/data; only headlines and
// chapter lines are site copy.
import { places, credits } from './data.js';
import trips from '../data/tripIdeas.json';
import festivals from '../data/festivals.json';
import watching from '../data/worthWatching.json';
import food from '../data/food.json';
import practical from '../data/practical.json';
import {
  CHAPTERS, MONTHS, MONTHS_LONG, thisMonth, today, esc, picture, credit, creditLine, monthStrip, monthRange,
  isGoodNow, place, host, readerSources, verifyTag, needsVerify, kmHtml, BASE,
} from './util.js';
import { placeCard } from './card.js';

const inChapter = (c) => places.filter((p) => p.chapter === c);
// Counts only places with a real season (isGoodNow skips all-year ones).
const goodNowCount = () => places.filter(isGoodNow).length;
const srcLinks = (srcs) => {
  const s = readerSources(srcs);
  return s.length ? `<ul class="src">${s.map((u) => `<li><a href="${esc(u)}" rel="noopener">${esc(host(u))}</a></li>`).join('')}</ul>` : '';
};
const vt = (s) => (s == null ? `Not listed ${verifyTag}` : needsVerify(s) ? `${esc(String(s).replace(/[\s,;:.—-]*\(?verify locally\)?\.?\s*$/i, '.').replace(/\.\.$/, '.'))} ${verifyTag}` : esc(s));
const gmaps = (lat, lng) => `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

// ── 2. Top 10 must-dos ────────────────────────────────────────────────
export function mustDo() {
  const list = places.filter((p) => p.mustDo);
  return `
<section class="mustdo" id="must-do" aria-labelledby="must-h" data-pin-gallery>
  <div class="mustdo__pin">
    <div class="head">
      <h2 id="must-h">The ten you <em>can't skip</em></h2>
      <p>If you only do ten things from Manipal, make it these. Swipe through, tap one for the full story.</p>
    </div>
    <div class="mustdo__track" data-track tabindex="0" aria-label="Top 10 places, scrolls sideways">
      ${list.map((p, i) => placeCard(p, { rank: i + 1, cls: 'card--big', sizes: '(min-width:1000px) 34vw, 82vw' })).join('')}
      <div class="mustdo__end" aria-hidden="true"><span>${places.length - 10} more below</span></div>
    </div>
  </div>
</section>`;
}

// ── 3. Chapters I–IV ──────────────────────────────────────────────────
const OPENERS = {
  coast: { img: 'st-marys-island/73902011', fill: 'gokarna-beach-trail', head: 'The <em>Coast</em>',
    line: 'Basalt islands, river mouths, blue-flag sand and a sea that changes mood with the month. Most of it is under an hour from Tiger Circle.' },
  gods: { img: 'udupi-sri-krishna-matha/23255985', fill: 'udupi-sri-krishna-matha', head: 'The <em>Gods</em>',
    line: "From Krishna's matha in Udupi to Sharada's peetha in Sringeri. Each shrine comes with its dress code, darshan hours and where the free meal is served." },
  ghats: { img: null, fill: 'kudremukh-peak-trek', head: 'The <em>Ghats</em>',
    line: 'Hairpins up to Agumbe, rain-fed falls, and peaks you earn on foot. Ride them in daylight; the safety notes are not decoration.' },
  heritage: { img: null, fill: 'bekal-fort', head: 'The Old <em>Stones</em>',
    line: 'Jain colossi carved from single rocks, sea forts, a thousand-pillar basadi and the old Alupa capital. History you can walk through.' },
};

export function chapter(id) {
  const c = CHAPTERS.find((x) => x.id === id), o = OPENERS[id], list = inChapter(id);
  const fillImg = place(o.fill).images;
  const fill = credit(fillImg[fillImg.length > 1 ? 1 : 0]);
  const nearest = Math.min(...list.filter((p) => p.distanceKmFromManipal != null).map((p) => p.distanceKmFromManipal));
  const good = list.filter(isGoodNow).length;
  const arch = id === 'gods'
    ? `<div class="arch" aria-hidden="true"><div class="arch__img">${picture(o.img, { sizes: '(min-width:1000px) 28vw, 62vw', alt: '' })}</div></div>`
    : '';
  return `
<section class="chapter chapter--${id}" id="ch-${id}" aria-labelledby="ch-${id}-h">
  <div class="opener opener--${id}" style="--numfill:url('${BASE}${fill.file}-960.webp')">
    <p class="opener__num" aria-hidden="true">${c.num}</p>
    ${arch}
    <div class="opener__text">
      <p class="cap opener__kicker">Chapter ${c.num}</p>
      <h2 id="ch-${id}-h"><span class="vh">Chapter ${c.num}: </span>${o.head}</h2>
      <div class="opener__row">
        <p>${o.line}</p>
        <dl class="num">
          <div><dt class="cap">Places</dt><dd>${list.length}</dd></div>
          <div><dt class="cap">Nearest</dt><dd>${nearest}<small> km</small></dd></div>
          <div><dt class="cap">Good now</dt><dd>${good}</dd></div>
        </dl>
      </div>
      <p class="credit opener__credit">Numeral: ${creditLine(fill.id, '')}${arch ? ` · Arch: ${creditLine(o.img, '')}` : ''}</p>
    </div>
  </div>
  <div class="track track--chapter" tabindex="0" aria-label="${c.title}: ${list.length} places, scrolls sideways on phones">
    ${list.map((p) => placeCard(p)).join('')}
  </div>
</section>`;
}

// ── 4. Explore everything (filters wired in explore.js) ───────────────
export const CATEGORY = [
  ['beach', 'Beaches & islands', (p) => p.tags.some((t) => ['beach', 'island', 'estuary', 'backwaters', 'river-mouth', 'kayaking'].includes(t))],
  ['temple', 'Temples', (p) => !!p.temple || p.tags.includes('temple')],
  ['waterfall', 'Waterfalls', (p) => p.tags.includes('waterfall')],
  ['trek', 'Treks & peaks', (p) => !!p.trek || p.tags.some((t) => ['trek', 'peak', 'hilltop'].includes(t))],
  ['view', 'Viewpoints', (p) => p.tags.some((t) => ['viewpoint', 'sunset', 'sunrise'].includes(t))],
  ['fort', 'Forts & history', (p) => p.tags.some((t) => ['fort', 'history', 'ruins', 'museum', 'heritage', 'jain', 'monolith', 'architecture'].includes(t))],
  ['lake', 'Lakes & rivers', (p) => p.tags.some((t) => ['lake', 'river', 'boat', 'mangroves'].includes(t))],
];
const TRIP = [['quick', 'Quick (under half a day)'], ['day', 'Day trip'], ['overnight', 'Overnight'], ['long-ride', 'Long ride']];
const group = (name, legend, inner) => `
<details class="fgroup" data-fgroup="${name}" open><summary><span class="cap">${legend}</span><b class="fgroup__n num" hidden></b></summary>
<div class="fchips" role="group" aria-label="${legend}">${inner}</div></details>`;
const chipGroup = (name, legend, opts, type = 'checkbox') => group(name, legend,
  opts.map(([v, l]) => `<label class="fchip"><input type="${type}" name="${name}" value="${v}"><span>${l}</span></label>`).join(''));

// The Explore grid renders its first cards with the page; explore.js adds the
// rest in small idle-time batches, so a phone's first render stays short.
export const GRID_FIRST = 8;
export const gridCard = (p) => placeCard(p, { compact: true, sizes: '(min-width:1440px) 22vw, (min-width:1000px) 30vw, (min-width:560px) 45vw, 92vw' });

export function explore() {
  return `
<section class="explore" id="explore" aria-labelledby="explore-h">
  <div class="head">
    <h2 id="explore-h">Explore <em>everything</em></h2>
    <p>All ${places.length} places. Filter by chapter, how you're getting there, how far, and what's good right now. The map below follows the same filters.</p>
  </div>
  <div class="fbar" data-fbar>
      <button class="btn fbar__open" type="button" data-filters-open aria-controls="filters" aria-expanded="false">Filters <span class="fbar__n num" data-active-n hidden></span></button>
      <p class="fbar__count" aria-live="polite"><b class="num" data-count>${places.length}</b> <span data-count-label>places</span></p>
      <button class="btn btn--ghost fbar__reset" type="button" data-reset hidden>Clear</button>
    <div class="filters" id="filters" data-filters role="dialog" aria-modal="false" aria-labelledby="filters-h">
      <div class="filters__sheet">
        <div class="grab" aria-hidden="true"></div>
        <div class="filters__top"><h3 id="filters-h" class="cap">Filters</h3><button class="btn" type="button" data-filters-close>Show <b class="num" data-count2>${places.length}</b></button></div>
        <form class="filters__form" data-filter-form>
          <label class="search"><span class="vh">Search places</span><input type="search" name="q" placeholder="Search: Agumbe, Jain, kayak…" autocomplete="off"></label>
          ${chipGroup('chapter', 'Chapter', CHAPTERS.slice(0, 4).map((c) => [c.id, `${c.num} ${c.short}`]))}
          ${chipGroup('cat', 'Category', CATEGORY.map(([v, l]) => [v, l]))}
          ${chipGroup('how', 'Getting there', [['bike', 'By bike'], ['train', 'Train nearby']])}
          ${chipGroup('dist', 'Distance from Manipal', [['near', '< 30 km'], ['mid', '30–100 km'], ['far', '100+ km']])}
          ${chipGroup('trip', 'Trip type', TRIP)}
          ${chipGroup('diff', 'Trek difficulty', [['easy', 'Easy'], ['moderate', 'Moderate'], ['hard', 'Hard']])}
          ${group('season', 'Season', `<label class="fchip"><input type="checkbox" name="now" value="1"><span>Good right now</span></label>
            <label class="fselect"><span class="vh">Best in month</span><select name="month"><option value="">Best in any month</option>${MONTHS_LONG.map((m, i) => `<option value="${i + 1}">Best in ${m}</option>`).join('')}</select></label>`)}
          ${chipGroup('only', 'Show only', [['temples', 'Temples only'], ['food', 'With veg food listed'], ['annadana', 'Free temple meal'], ['list', 'My list'], ['been', 'Been there'], ['notbeen', 'Not been yet']])}
        </form>
      </div>
    </div>
  </div>
  <div class="grid" data-grid aria-busy="true">
    ${places.slice(0, GRID_FIRST).map(gridCard).join('')}
  </div>
  <p class="empty" data-empty hidden>Nothing matches all of that. Loosen a filter or two.</p>
</section>`;
}

// ── 6. Map ─────────────────────────────────────────────────────────────
export const mapSection = () => `
<section class="mapsec" id="map" aria-labelledby="map-h">
  <div class="head">
    <h2 id="map-h">On the <em>map</em></h2>
    <p>Same filters as above. Tap a pin for the place. <span data-map-count class="num"></span></p>
  </div>
  <div class="legend" aria-hidden="true">${CHAPTERS.slice(0, 4).map((c) => `<span class="legend__i legend__i--${c.id}"><i></i>${c.num} ${c.short}</span>`).join('')}<span class="legend__i legend__i--home"><i></i>Manipal</span></div>
  <div class="map" data-map role="region" aria-label="Map of places. Use the list above for keyboard access."><p class="map__fallback">Map loads when you scroll here.</p></div>
  ${unpinned().length ? `<p class="wrap note map__missing">Not on the map yet, because we couldn't verify their coordinates: ${unpinned().map((p) => `<a href="#place-${p.id}" data-open="${p.id}">${esc(p.name)}</a>`).join(', ')}.</p>` : ''}
</section>`;
const unpinned = () => places.filter((p) => p.lat == null || p.lng == null);

// ── 7. The Table ───────────────────────────────────────────────────────
export function table() {
  const eat = new Map(food.places.map((e) => [e.id, e]));
  const ANNA_PLACE = { 'udupi-krishna-matha': 'udupi-sri-krishna-matha', 'kollur-mookambika': 'kollur-mookambika-temple', dharmasthala: 'dharmasthala-manjunatha-temple', 'kukke-subramanya': 'kukke-subramanya-temple', 'horanadu-annapoorneshwari': 'horanadu-annapoorneshwari-temple', 'sringeri-sharada-peetham': 'sringeri-sharada-peetham' };
  const fillP = place('udupi-car-street-night');
  return `
<section class="chapter chapter--table" id="ch-table" aria-labelledby="ch-table-h">
  <div class="opener opener--table opener--short"${fillP.images[0] ? ` style="--numfill:url('${BASE}${credit(fillP.images[0]).file}-960.webp')"` : ''}>
    <p class="opener__num" aria-hidden="true">V</p>
    <div class="opener__text">
      <p class="cap opener__kicker">Chapter V</p>
      <h2 id="ch-table-h"><span class="vh">Chapter V: </span>The <em>Table</em></h2>
      <div class="opener__row">
        <p>A proudly vegetarian guide. Udupi gave the country its dosa; the temples here feed thousands a day for free. Where a dish is famous in a non-veg form, we only point you to the veg one.</p>
        <dl class="num"><div><dt class="cap">Dishes</dt><dd>${food.dishes.length}</dd></div><div><dt class="cap">Veg kitchens</dt><dd>${food.places.length}</dd></div><div><dt class="cap">Temple meals</dt><dd>${food.annadana.length}</dd></div></dl>
      </div>
    </div>
  </div>
  <div class="wrap">
    <h3 class="sub-h">What to <em>order</em></h3>
    <div class="dishes">
      ${food.dishes.map((d) => `
      <article class="dish" id="dish-${d.id}">
        <h4>${esc(d.name)}</h4>
        ${d.kannadaOrTuluName ? `<p class="dish__alt">${esc(d.kannadaOrTuluName)}</p>` : ''}
        <p>${esc(d.whatItIs)}</p>
        ${d.vegNote ? `<p class="dish__veg"><b class="cap">Veg note</b> ${esc(d.vegNote)}</p>` : ''}
        <dl class="mini">
          ${d.whenToEat ? `<div><dt class="cap">When</dt><dd>${esc(d.whenToEat)}</dd></div>` : ''}
          ${d.whereToTry?.length ? `<div><dt class="cap">Where</dt><dd>${d.whereToTry.map((id) => eat.get(id)).filter(Boolean).map((e) => `<a href="#eat-${e.id}">${esc(e.name)}</a>`).join(', ')}</dd></div>` : ''}
        </dl>
        <details class="srcs"><summary class="cap">Sources</summary>${srcLinks(d.sources)}</details>
      </article>`).join('')}
    </div>

    <h3 class="sub-h">Where to <em>eat</em></h3>
    <div class="eats">
      ${food.places.map((e) => `
      <article class="eat" id="eat-${e.id}">
        <div class="eat__top"><h4>${esc(e.name)}</h4><span class="cap eat__veg">${e.pureVeg ? 'Pure veg' : esc(e.vegLabel ?? 'Veg options')}</span></div>
        <p class="eat__where">${esc(e.area ? `${e.area}, ${e.town}` : e.town)}</p>
        <p class="eat__order">${esc(e.order)}</p>
        <dl class="mini">
          <div><dt class="cap">Hours</dt><dd>${vt(e.hours)}</dd></div>
          ${e.priceBand ? `<div><dt class="cap">Price</dt><dd>${esc(e.priceBand)}</dd></div>` : ''}
          ${e.operatingStatus !== 'open' ? `<div><dt class="cap">Status</dt><dd class="warn-text">${esc(e.operatingStatus)}</dd></div>` : ''}
        </dl>
        <div class="eat__acts">${e.lat ? `<a class="btn btn--small" href="${gmaps(e.lat, e.lng)}" target="_blank" rel="noopener">Google Maps</a>` : ''}<details class="srcs"><summary class="cap">Sources</summary>${srcLinks(e.sources)}</details></div>
      </article>`).join('')}
    </div>

    <h3 class="sub-h">Temple <em>annadana</em></h3>
    <p class="sub-lede">Free meals served as prasada. Sit where you're shown, eat what's served, leave nothing on the leaf.</p>
    <div class="anna">
      ${food.annadana.map((a) => { const pid = ANNA_PLACE[a.id]; return `
      <article class="anna__card">
        <h4>${pid ? `<a href="#place-${pid}" data-open="${pid}">${esc(a.temple)}</a>` : esc(a.temple)}</h4>
        <p class="eat__where">${esc(a.town)}</p>
        <dl class="mini">
          <div><dt class="cap">Lunch</dt><dd>${vt(a.lunchTimings)}</dd></div>
          <div><dt class="cap">Dinner</dt><dd>${vt(a.dinnerTimings)}</dd></div>
          <div><dt class="cap">Served</dt><dd>${esc(a.whatsServed)}</dd></div>
          ${a.dressCode ? `<div><dt class="cap">Dress</dt><dd>${esc(a.dressCode)}</dd></div>` : ''}
        </dl>
        ${a.etiquette?.length ? `<details class="srcs"><summary class="cap">Etiquette</summary><ul class="bul">${a.etiquette.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></details>` : ''}
        <details class="srcs"><summary class="cap">Sources</summary>${srcLinks(a.sources)}</details>
      </article>`; }).join('')}
    </div>
  </div>
</section>`;
}

// ── 8. The Plan: trip ideas as a timeline ─────────────────────────────
export function plan() {
  const fillP = place('agumbe-sunset-point-and-ghat');
  return `
<section class="chapter chapter--plan" id="plan" aria-labelledby="plan-h">
  <span id="ch-plan" class="anchor" aria-hidden="true"></span>
  <div class="opener opener--plan opener--short" style="--numfill:url('${BASE}${credit(fillP.images[0]).file}-960.webp')">
    <p class="opener__num" aria-hidden="true">VI</p>
    <div class="opener__text">
      <p class="cap opener__kicker">Chapter VI</p>
      <h2 id="plan-h"><span class="vh">Chapter VI: </span>The <em>Plan</em></h2>
      <div class="opener__row">
        <p>${trips.length} ready-made trips, from a temple morning in Udupi to an overnight train to Dudhsagar. No dates: pick one, check the season, go.</p>
        <dl class="num"><div><dt class="cap">Trips</dt><dd>${trips.length}</dd></div><div><dt class="cap">By train</dt><dd>${trips.filter((t) => t.transport === 'train').length}</dd></div><div><dt class="cap">Good now</dt><dd>${trips.filter((t) => t.bestMonths?.includes(thisMonth)).length}</dd></div></dl>
      </div>
    </div>
  </div>
  <ol class="timeline wrap">
    ${trips.map((t, i) => `
    <li class="trip" id="trip-${t.id}">
      <details>
        <summary>
          <span class="trip__n num">${String(i + 1).padStart(2, '0')}</span>
          <span class="trip__main">
            <h3 class="trip__title">${esc(t.title)}</h3>
            <span class="trip__hook">${esc(t.hook)}</span>
          </span>
          <span class="trip__meta num">
            <span><b>${esc(t.duration)}</b><span class="cap">${t.transport === 'train' ? 'Train' : 'Bike'}</span></span>
            ${t.roadKmRoundTrip != null ? `<span><b>${t.roadKmRoundTrip}<small>km</small></b><span class="cap">Round trip</span></span>` : ''}
            ${t.bestMonths?.includes(thisMonth) ? '<span class="chip chip--teal">In season</span>' : ''}
          </span>
          <span class="trip__toggle" aria-hidden="true"></span>
        </summary>
        <div class="trip__body">
          <p class="trip__route"><b class="cap">Route</b> ${esc(t.route)}</p>
          <div class="trip__cols">
            <ol class="stops">
              ${t.stops.map((s) => `<li class="stop"><span class="stop__when cap">${t.days > 1 ? `Day ${s.day} · ` : ''}${esc(s.time ?? '')}</span>
                <span class="stop__name">${s.placeId ? `<a href="#place-${s.placeId}" data-open="${s.placeId}">${esc(s.name)}</a>` : esc(s.name)}</span>
                ${s.note ? `<span class="stop__note">${esc(s.note)}</span>` : ''}</li>`).join('')}
            </ol>
            <div class="trip__side">
              <div class="block"><h4 class="cap">Best season</h4>${monthStrip(t.bestMonths)}<p class="note">${esc(t.bestSeason)}</p></div>
              ${t.vegMealStops?.length ? `<div class="block"><h4 class="cap">Veg meal stops</h4><ul class="bul">${t.vegMealStops.map((m) => `<li>${esc(m)}</li>`).join('')}</ul></div>` : ''}
              ${t.packThis ? `<div class="block"><h4 class="cap">Pack this</h4><p>${esc(t.packThis)}</p></div>` : ''}
              ${t.safety ? `<div class="warn"><h4 class="cap">Safety</h4><p>${esc(t.safety)}</p></div>` : ''}
              ${t.sources?.length ? `<details class="srcs"><summary class="cap">Sources</summary>${srcLinks(t.sources)}</details>` : ''}
            </div>
          </div>
        </div>
      </details>
    </li>`).join('')}
  </ol>
</section>`;
}

// ── 9. Festivals: year-round calendar strip, upcoming highlighted ─────
const fmtDate = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
export function festivalsSection() {
  const now = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const horizon = new Date(now); horizon.setDate(horizon.getDate() + 75);
  const nextDate = (f) => (f.upcoming || []).map((u) => ({ ...u, d: new Date(`${u.startDate}T00:00:00`), e: u.endDate ? new Date(`${u.endDate}T00:00:00`) : null }))
    .filter((u) => (u.e || u.d) >= now).sort((a, b) => a.d - b.d)[0];
  const soon = festivals.map((f) => ({ f, n: nextDate(f) })).filter((x) => x.n && x.n.d <= horizon).sort((a, b) => a.n.d - b.n.d);
  const soonIds = new Set(soon.map((x) => x.f.id));
  const order = Array.from({ length: 12 }, (_, i) => ((thisMonth - 1 + i) % 12) + 1);
  return `
<section class="fests" id="festivals" aria-labelledby="fest-h">
  <div class="head">
    <h2 id="fest-h">The year in <em>festivals</em></h2>
    <p>${festivals.length} festivals, month by month, starting now. Most follow the lunar calendar, so dates move every year. We only print a date where a source confirms it.</p>
  </div>
  ${soon.length ? `
  <div class="wrap">
    <h3 class="sub-h sub-h--sm">Coming <em>up</em></h3>
    <ol class="soon">
      ${soon.map(({ f, n }) => `<li class="soon__i">
        <span class="soon__d num"><b>${n.d.getDate()}</b><span class="cap">${MONTHS[n.d.getMonth()]}</span></span>
        <span class="soon__t"><span class="soon__name">${f.placeId ? `<a href="#place-${f.placeId}" data-open="${f.placeId}">${esc(f.name)}</a>` : esc(f.name)}</span>
        <span class="soon__meta">${esc(f.place)} · ${n.dateStatus === 'confirmed' ? 'Confirmed' : 'Panchang date, confirm locally'}${n.endDate ? ` · to ${fmtDate(n.endDate)}` : ''}</span></span>
      </li>`).join('')}
    </ol>
  </div>` : ''}
  <div class="cal" tabindex="0" aria-label="Festival calendar by month, scrolls sideways">
    ${order.map((m) => { const fs = festivals.filter((f) => f.months?.includes(m)); return `
    <section class="cal__m${m === thisMonth ? ' is-now' : ''}" aria-label="${MONTHS_LONG[m - 1]}">
      <h3 class="cal__h"><span>${MONTHS_LONG[m - 1]}</span><b class="num">${fs.length}</b></h3>
      <ul>${fs.map((f) => { const n = nextDate(f); return `<li class="fest${soonIds.has(f.id) ? ' is-soon' : ''}">
        <details><summary><span class="fest__name">${esc(f.name)}</span><span class="fest__where">${esc(f.place)}</span>${n ? `<span class="fest__date num">${+n.startDate.slice(5, 7) !== m ? 'Next: ' : ''}${fmtDate(n.startDate)}${n.dateStatus !== 'confirmed' ? ' *' : ''}</span>` : '<span class="fest__date">Date: verify locally</span>'}</summary>
        <div class="fest__body"><p>${esc(f.what)}</p>${f.basis ? `<p class="note"><b>Calendar:</b> ${esc(f.basis)} · ${esc(f.frequency)}</p>` : ''}${f.tips ? `<p class="note">${esc(f.tips)}</p>` : ''}${n?.note ? `<p class="note">${esc(n.note)}</p>` : ''}${f.placeId ? `<a class="btn btn--small" href="#place-${f.placeId}" data-open="${f.placeId}">Open the place</a>` : ''}${srcLinks(f.sources)}</div></details>
      </li>`; }).join('') || '<li class="fest fest--none">No listed festivals.</li>'}</ul>
    </section>`; }).join('')}
  </div>
  <p class="wrap note">* Date worked out from the panchang, not announced by the temple. Confirm before you ride.</p>

  <div class="wrap">
    <h3 class="sub-h">Worth <em>watching</em></h3>
    <p class="sub-lede">The region's most spectacular nights out. Some come round every year, one every twelve.</p>
    <div class="watch">
      ${watching.map((w) => `
      <article class="watch__card${w.dontMiss ? ' is-dontmiss' : ''}">
        ${w.dontMiss ? '<span class="chip chip--outline">Don\'t miss</span>' : ''}
        <h4>${esc(w.name)}</h4>
        <dl class="mini mini--row num">
          <div><dt class="cap">When</dt><dd>${monthRange(w.months)}</dd></div>
          <div><dt class="cap">How often</dt><dd>${esc(w.frequency)}</dd></div>
          <div><dt class="cap">Next</dt><dd>${w.nextDate?.startDate ? `${fmtDate(w.nextDate.startDate)}${w.nextDate.status !== 'confirmed' ? ' *' : ''}` : `Verify locally`}</dd></div>
        </dl>
        <p>${esc(w.what)}</p>
        <p class="watch__why">${esc(w.whySpecial)}</p>
        <details class="srcs"><summary class="cap">Where, best spot, how to watch</summary>
          <dl class="mini">
            <div><dt class="cap">Where</dt><dd>${esc((w.where || []).join(', '))}</dd></div>
            ${w.bestSpot ? `<div><dt class="cap">Best spot</dt><dd>${esc(w.bestSpot)}</dd></div>` : ''}
            ${w.watchRespectfully ? `<div><dt class="cap">Respectfully</dt><dd>${esc(w.watchRespectfully)}</dd></div>` : ''}
          </dl>
          ${(w.placeIds || []).length ? `<p class="links">${w.placeIds.map((id) => place(id) && `<a href="#place-${id}" data-open="${id}">${esc(place(id).name)}</a>`).filter(Boolean).join(' · ')}</p>` : ''}
          ${srcLinks(w.sources)}
        </details>
      </article>`).join('')}
    </div>
  </div>
</section>`;
}

// ── 10. Practical notes ────────────────────────────────────────────────
export function practicalSection() {
  const { weather, rail, riding, packing } = practical;
  const s = (arr) => (arr?.length ? `<span class="pr__src">${arr.map((u) => `<a href="${esc(u)}" rel="noopener">${esc(host(u))}</a>`).join(' · ')}</span>` : '');
  return `
<section class="practical" id="practical" aria-labelledby="pr-h">
  <div class="head">
    <h2 id="pr-h">Before you <em>go</em></h2>
    <p>Weather, trains, the rules of the road and what goes in the bag.</p>
  </div>
  <div class="wrap pr">
    <article class="pr__card pr__card--wide">
      <h3 class="cap">${esc(weather.title)}</h3><p class="pr__lede">${esc(weather.lede)}</p>
      <div class="seasons">${weather.seasons.map((x) => `<div class="seasons__i"><h4>${esc(x.name)}</h4>${monthStrip(x.months, { label: x.name })}<p>${esc(x.text)}</p>${s(x.sources)}</div>`).join('')}</div>
    </article>
    <article class="pr__card">
      <h3 class="cap">${esc(rail.title)}</h3><p class="pr__lede">${esc(rail.lede)}</p>
      <ul class="pr__list">${rail.tips.map((t) => `<li>${esc(t.text)}${s(t.sources)}</li>`).join('')}</ul>
    </article>
    <article class="pr__card pr__card--warn">
      <h3 class="cap">${esc(riding.title)}</h3><p class="pr__lede">${esc(riding.lede)}</p>
      <dl class="pr__dl">${riding.items.map((t) => `<div><dt>${esc(t.head)}</dt><dd>${esc(t.text)}${s(t.sources)}</dd></div>`).join('')}</dl>
    </article>
    ${packing.map((p) => `<article class="pr__card"><h3 class="cap">${esc(p.title)}</h3><ul class="checks">${p.items.map((i) => `<li>${esc(i)}</li>`).join('')}</ul></article>`).join('')}
  </div>
</section>`;
}

// ── 11. Footer: every image credit and every data source ──────────────
export function footer() {
  const byPlace = new Map();
  Object.values(credits).forEach((c) => { if (!byPlace.has(c.placeId)) byPlace.set(c.placeId, []); byPlace.get(c.placeId).push(c); });
  const allSrc = new Set();
  [...places, ...trips, ...festivals, ...watching, ...food.dishes, ...food.places, ...food.annadana].forEach((x) => readerSources(x.sources || []).forEach((u) => allSrc.add(u)));
  festivals.forEach((f) => (f.upcoming || []).forEach((u) => u.source && allSrc.add(u.source)));
  const hosts = new Map(); // host → its URLs (each URL parsed once)
  [...allSrc].forEach((u) => { const h = host(u); if (!hosts.has(h)) hosts.set(h, []); hosts.get(h).push(u); });
  return `
<footer class="foot" id="credits" aria-labelledby="foot-h">
  <div class="wrap">
    <p class="foot__brand">Manipal <i>Explorer</i></p>
    <h2 id="foot-h" class="vh">Credits and sources</h2>
    <p class="foot__lede">Researched from public sources, last checked November 2026. Timings change: anything marked <span class="verify">Verify locally</span> is exactly that. Distances are road kilometres from Manipal (Tiger Circle), via OpenStreetMap routing.</p>
    <details class="foot__d">
      <summary><span class="cap">Image credits</span><b class="num">${Object.keys(credits).length}</b></summary>
      <p class="note">All photos from Wikimedia Commons under CC0, public domain, CC BY or CC BY-SA, resized and re-encoded. Click through for each original.</p>
      <ul class="credits">${[...byPlace].map(([pid, cs]) => `<li><b>${esc(place(pid)?.name ?? pid)}</b>${cs.map((c) => `<span>${creditLine(c.id, '')}</span>`).join('')}</li>`).join('')}</ul>
    </details>
    <details class="foot__d">
      <summary><span class="cap">Data sources</span><b class="num">${allSrc.size}</b></summary>
      <p class="note">Every source cited anywhere in the guide, grouped by site. Routing and geocoding via OSRM and Nominatim (OpenStreetMap). Map tiles © OpenStreetMap contributors.</p>
      <ul class="sources">${[...hosts].sort((a, b) => b[1].length - a[1].length).map(([h, us]) => `<li><b>${esc(h)}</b>${us.map((u) => `<a href="${esc(u)}" rel="noopener">${esc(decodeURIComponent(u.replace(/^https?:\/\/(www\.)?/, '')).slice(h.length, h.length + 90) || '/')}</a>`).join('')}</li>`).join('')}</ul>
    </details>
    <p class="foot__small">Built in Manipal. Strictly vegetarian recommendations. Type: Instrument Serif and Hanken Grotesk (OFL).</p>
    <p class="foot__by">Created by <span class="foot__name">Harsh Mimani</span><a class="foot__in" href="https://www.linkedin.com/in/harsh-mimani/" rel="noopener" target="_blank" aria-label="Harsh Mimani on LinkedIn (opens in a new tab)">LinkedIn <span aria-hidden="true">↗</span></a></p>
  </div>
</footer>`;
}
