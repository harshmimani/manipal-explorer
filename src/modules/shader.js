// Hero shader: a slow, domain-warped sea of deep teal with a saffron sun haze,
// laid over the hero photo. The sea sits in the lower half (under the title),
// so the photo still reads at the top.
//   Desktop: the water bends and brightens around the cursor.
//   Phone: scrolling through the hero speeds the swell and lifts the horizon.
// Paused off-screen and in hidden tabs. Pixel ratio is capped at 2 and then
// rendered at a fraction of that (it is a soft field; nobody sees the pixels).
// If WebGL is missing or the context is lost, the slot falls back to a static
// CSS gradient in the same palette.
import { WebGLRenderer, Scene, OrthographicCamera, Mesh, PlaneGeometry, ShaderMaterial, Vector2 } from 'three';

const vert = /* glsl */`
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const frag = (octaves) => /* glsl */`
// highp: mediump hashing showed straight-edged banding at large coordinates.
precision highp float;
uniform float uTime;
uniform vec2 uRes;
uniform vec2 uMouse;
uniform float uHover;
uniform float uScroll;
varying vec2 vUv;

// Palette (tokens.css): ink, deep sea, monsoon teal, saffron, sand.
const vec3 INK  = vec3(0.043, 0.059, 0.055);
const vec3 DEEP = vec3(0.055, 0.231, 0.227);
const vec3 TEAL = vec3(0.122, 0.435, 0.420);
const vec3 SAFF = vec3(0.949, 0.608, 0.220);
const vec3 SAND = vec3(0.929, 0.890, 0.820);

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0); // quintic: no visible cell seams
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  // Rotate each octave so grid lines never line up (the horizon squash would
  // otherwise skew them into straight diagonal seams).
  const mat2 R = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < ${octaves}; i++) { v += a * noise(p); p = R * p * 2.03 + vec2(1.7, 9.2); a *= 0.5; }
  return v;
}

void main() {
  float aspect = uRes.x / uRes.y;
  vec2 uv = vUv;
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
  float t = uTime * (0.045 + uScroll * 0.08);

  // Cursor: a soft lens that pushes the water outwards.
  vec2 m = (uMouse - 0.5) * vec2(aspect, 1.0);
  float md = length(p - m);
  float lens = exp(-md * 3.2) * uHover;
  p += (p - m) * 0.12 * lens;

  // Perspective: squash the field towards the horizon so it reads as sea.
  float horizon = 0.62 + uScroll * 0.18;
  float depth = clamp((horizon - uv.y) / horizon, 0.0, 1.0);
  vec2 sp = vec2(p.x * (0.6 + depth * 0.9), p.y * (1.6 + depth * 2.2));

  // One warp layer (3 fbm calls, not 5): compiles ~2× faster under ANGLE/D3D
  // and costs less per pixel, with the same rolling-swell look.
  vec2 q = vec2(fbm(sp * 1.3 + vec2(0.0, t)), fbm(sp * 1.3 + vec2(5.2, -t * 0.8)));
  vec2 r = q + 0.35 * vec2(sin(t * 1.4 + q.y * 6.0), cos(t + q.x * 6.0));
  float f = fbm(sp * 1.7 + 2.4 * r + vec2(1.7, 9.2));

  vec3 col = mix(DEEP, TEAL, clamp(f * f * 2.2, 0.0, 1.0));
  col = mix(col, INK, clamp(length(q) * 0.75, 0.0, 1.0) * 0.55);

  // Light on the swell: thin sand ridges where the field folds.
  float ridge = smoothstep(0.5, 0.6, f) - smoothstep(0.6, 0.76, f);
  col += SAND * ridge * (0.07 + lens * 0.18);

  // Saffron sun haze, top right, flickering on the water below it.
  vec2 sunPos = vec2(0.32 * aspect, 0.42);
  float sun = exp(-length((p - sunPos) * vec2(0.8, 1.2)) * 2.4);
  col += SAFF * sun * (0.28 + 0.22 * r.x);
  col += SAFF * lens * 0.06;

  // Alpha: strong in the sea (bottom), clear in the sky, a little at the sun.
  float sea = smoothstep(horizon + 0.05, horizon - 0.35, uv.y);
  float a = clamp(sea * 0.82 + sun * 0.35 + lens * 0.1, 0.0, 0.88);
  gl_FragColor = vec4(col * a, a);
}`;

export function mountShader(slot, { fine = false } = {}) {
  const fail = () => { slot.classList.add('is-static'); return null; };
  let renderer;
  try {
    const test = document.createElement('canvas');
    if (!(test.getContext('webgl2') || test.getContext('webgl'))) return fail();
    renderer = new WebGLRenderer({ antialias: false, alpha: true, premultipliedAlpha: true, powerPreference: 'low-power', stencil: false, depth: false });
  } catch { return fail(); }

  const small = !fine || innerWidth < 1000;
  const ratio = Math.min(devicePixelRatio || 1, 2) * (small ? 0.4 : 0.55);
  renderer.setPixelRatio(ratio);
  const canvas = renderer.domElement;
  canvas.setAttribute('aria-hidden', 'true');
  slot.append(canvas);

  const uniforms = {
    uTime: { value: 0 }, uRes: { value: new Vector2(1, 1) }, uMouse: { value: new Vector2(0.7, 0.3) },
    uHover: { value: 0 }, uScroll: { value: 0 },
  };
  const scene = new Scene();
  const cam = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const mat = new ShaderMaterial({ vertexShader: vert, fragmentShader: frag(small ? 3 : 4), uniforms, transparent: true, depthTest: false, depthWrite: false });
  scene.add(new Mesh(new PlaneGeometry(2, 2), mat));

  const size = () => {
    const w = slot.clientWidth, h = slot.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    uniforms.uRes.value.set(w, h);
  };
  const ro = new ResizeObserver(size); ro.observe(slot); size();

  // Inputs, eased in the loop.
  const target = { x: 0.7, y: 0.3, hover: 0, scroll: 0 };
  const hero = slot.closest('.hero');
  if (fine) {
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      target.x = (e.clientX - r.left) / r.width; target.y = 1 - (e.clientY - r.top) / r.height; target.hover = 1;
    }, { passive: true });
    hero.addEventListener('pointerleave', () => { target.hover = 0; });
  }
  const onScroll = () => { target.scroll = Math.min(1, Math.max(0, scrollY / Math.max(1, hero.offsetHeight))); };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Run only while the hero is on screen and the tab is visible.
  let onScreen = false, raf = 0, last = performance.now(), time = 0, lost = false;
  const loop = (now) => {
    raf = 0;
    if (!onScreen || document.hidden || lost) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now; time += dt;
    const k = 1 - Math.exp(-dt * 4);
    const u = uniforms;
    u.uTime.value = time;
    u.uMouse.value.x += (target.x - u.uMouse.value.x) * k;
    u.uMouse.value.y += (target.y - u.uMouse.value.y) * k;
    u.uHover.value += (target.hover - u.uHover.value) * k * 0.6;
    u.uScroll.value += (target.scroll - u.uScroll.value) * k;
    renderer.render(scene, cam);
    raf = requestAnimationFrame(loop);
  };
  const resume = () => { if (!raf && onScreen && !document.hidden && !lost) { last = performance.now(); raf = requestAnimationFrame(loop); } };
  new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; resume(); }).observe(hero);
  document.addEventListener('visibilitychange', resume);
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); lost = true; canvas.remove(); slot.classList.add('is-static'); });

  // Compile off the main thread (KHR_parallel_shader_compile) before the first
  // frame: a synchronous link measured ~340 ms of main thread. Then fade in.
  renderer.debug.checkShaderErrors = false;
  const start = () => { renderer.render(scene, cam); requestAnimationFrame(() => slot.classList.add('is-live')); resume(); };
  (renderer.compileAsync ? renderer.compileAsync(scene, cam) : Promise.resolve()).then(start, () => { canvas.remove(); fail(); });
  return { stats: () => ({ ratio, octaves: small ? 3 : 4 }) };
}
