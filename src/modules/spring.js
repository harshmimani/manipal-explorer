// A tiny damped spring (mass 1). Used by the phone bottom sheet so it carries
// the finger's velocity when let go, instead of easing on a fixed curve.
// Returns a cancel function.
export function spring({ from, to, velocity = 0, stiffness = 420, damping = 36, onUpdate, onDone }) {
  let x = from, v = velocity, last = performance.now(), raf = 0, dead = false;
  const step = (now) => {
    if (dead) return;
    // Fixed 4 ms sub-steps keep it stable when a frame runs long.
    let dt = Math.min(64, now - last) / 1000; last = now;
    while (dt > 0) {
      const h = Math.min(dt, 0.004);
      const a = -stiffness * (x - to) - damping * v;
      v += a * h; x += v * h; dt -= h;
    }
    if (Math.abs(x - to) < 0.4 && Math.abs(v) < 8) { onUpdate(to); onDone?.(); return; }
    onUpdate(x);
    raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);
  return () => { dead = true; cancelAnimationFrame(raf); };
}
