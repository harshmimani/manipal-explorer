// Place card: 4:5 portrait, name over gradient, "Good now" chip, star, stat bar.
import { picture, gradientArt, esc, isGoodNow, monthRange, rideHtml, kmHtml, chapterLabel, STAR, CHECK } from './util.js';

export function placeCard(p, { sizes = '(min-width:1000px) 30vw, 82vw', cls = '', rank, compact = false } = {}) {
  const img = p.images?.[0];
  const media = img ? picture(img, { sizes, alt: '' }) : gradientArt(p);
  return `<article class="card ${cls}${compact ? ' card--compact' : ''}" data-place="${p.id}" data-chapter="${p.chapter}">
  <div class="card__media"${img ? ' data-cursor="media"' : ''}>${media}</div>
  <div class="card__top">
    ${isGoodNow(p) ? '<span class="chip">Good now</span>' : '<span></span>'}
    <span class="card__btns">
      <span class="been-badge" aria-hidden="true">${CHECK}</span>
      <button class="star" type="button" data-toggle="list" data-id="${p.id}" aria-pressed="false" aria-label="Add ${esc(p.name)} to my list">${STAR}</button>
    </span>
  </div>
  <div class="card__body">
    <div class="card__ch cap">${rank ? `<b class="num">${String(rank).padStart(2, '0')}</b> · ` : ''}${chapterLabel(p.chapter)}</div>
    <h3><a href="#place-${p.id}" data-open="${p.id}">${esc(p.name)}</a></h3>
    ${compact ? '' : `<p>${esc(p.hook)}</p>`}
    <div class="stat num">
      <div><b>${kmHtml(p.distanceKmFromManipal)}</b><span class="cap">From Manipal</span></div>
      <div><b>${rideHtml(p.rideTimeFromManipal)}</b><span class="cap">By bike</span></div>
      <div class="when cap">${monthRange(p.bestMonths)}</div>
    </div>
  </div>
</article>`;
}
