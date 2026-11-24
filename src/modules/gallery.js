// Top 10: on desktop the section pins and vertical scroll drives the track
// sideways (CSS sticky + one scroll listener; Part 5 may swap in ScrollTrigger).
// On phones, and under reduced motion, it's a native swipe carousel.
export function initPinGallery() {
  const sec = document.querySelector('[data-pin-gallery]');
  if (!sec) return;
  const track = sec.querySelector('[data-track]');
  const mq = matchMedia('(min-width: 1000px) and (prefers-reduced-motion: no-preference)');
  let dist = 0, raf = 0;

  const measure = () => {
    if (!mq.matches) { sec.style.removeProperty('--pin-h'); track.style.transform = ''; sec.classList.remove('is-pinned'); return; }
    sec.classList.add('is-pinned');
    dist = Math.max(0, track.scrollWidth - track.clientWidth);
    sec.style.setProperty('--pin-h', `${innerHeight + dist}px`);
    update();
  };
  const update = () => {
    raf = 0;
    if (!mq.matches) return;
    const r = sec.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - innerHeight)));
    track.style.transform = `translate3d(${-p * dist}px,0,0)`;
  };
  addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(update); }, { passive: true });
  addEventListener('resize', measure);
  mq.addEventListener('change', measure);
  document.fonts?.ready.then(measure);
  // Keyboard users: focusing a card inside the pinned track scrolls the page to it.
  track.addEventListener('focusin', (e) => {
    if (!mq.matches || !dist) return;
    const card = e.target.closest('.card'); if (!card) return;
    const x = card.offsetLeft - track.offsetLeft - 40;
    const p = Math.min(1, Math.max(0, x / dist));
    scrollTo({ top: sec.offsetTop + p * (sec.offsetHeight - innerHeight), behavior: 'instant' });
  });
  measure();
}
