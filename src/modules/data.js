// The two big datasets (places, image credits) ship as separate, hashed JSON
// files instead of being inlined in the JS bundle. main.js awaits loadData()
// before rendering; every module reads these shared containers afterwards.
import placesUrl from '../data/places.json?url';
import creditsUrl from '../data/image-credits.json?url';

export const places = [];
export const credits = {};
export const byId = new Map();

const getJson = (url) => fetch(url).then((r) => {
  if (!r.ok) throw new Error(`${r.status} loading ${url}`);
  return r.json();
});

let loading;
export function loadData() {
  loading ??= Promise.all([getJson(placesUrl), getJson(creditsUrl)]).then(([p, c]) => {
    places.push(...p);
    Object.assign(credits, c);
    p.forEach((x) => byId.set(x.id, x));
  });
  return loading;
}
