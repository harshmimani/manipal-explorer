// Visitor state: "Been there" and "My List", persisted in localStorage (guarded).
import places from '../data/places.json';
import { store } from './util.js';

const KEYS = { been: 'me:been', list: 'me:list' };
const sets = { been: new Set(store.get(KEYS.been, [])), list: new Set(store.get(KEYS.list, [])) };
const subs = new Set();

export const has = (kind, id) => sets[kind].has(id);
export const count = (kind) => sets[kind].size;
export const ids = (kind) => [...sets[kind]];
export const explored = () => Math.round((sets.been.size / places.length) * 100);

export function toggle(kind, id) {
  sets[kind].has(id) ? sets[kind].delete(id) : sets[kind].add(id);
  store.set(KEYS[kind], [...sets[kind]]);
  subs.forEach((fn) => fn(kind, id));
}
export const subscribe = (fn) => { subs.add(fn); return () => subs.delete(fn); };

// Every [data-toggle="been|list"][data-id] button on the page stays in sync.
export function syncButtons(root = document) {
  root.querySelectorAll('[data-toggle]').forEach((b) => {
    const on = has(b.dataset.toggle, b.dataset.id);
    b.setAttribute('aria-pressed', String(on));
    const lbl = b.querySelector('[data-label]');
    if (lbl) lbl.textContent = on ? lbl.dataset.on : lbl.dataset.off;
  });
}
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-toggle]');
  if (!b) return;
  e.preventDefault(); e.stopPropagation();
  toggle(b.dataset.toggle, b.dataset.id);
});
subscribe(() => syncButtons());
