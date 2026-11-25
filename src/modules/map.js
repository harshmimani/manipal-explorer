// Leaflet map, loaded when the section nears the viewport. OSM tiles darkened
// in CSS, chapter-coloured pins, clustering, tap → place detail.
import { places } from './data.js';
import { esc, chapterLabel } from './util.js';
import { onFilter, visibleIds } from './explore.js';
import { open } from './detail.js';

const MANIPAL = [13.3524, 74.7873];

export function initMap() {
  const el = document.querySelector('[data-map]');
  if (!el) return;
  const io = new IntersectionObserver(async (es) => {
    if (!es.some((e) => e.isIntersecting)) return;
    io.disconnect();
    const [{ default: L }] = await Promise.all([import('leaflet'), import('leaflet/dist/leaflet.css')]);
    window.L = L; // markercluster attaches to the global
    await Promise.all([import('leaflet.markercluster'), import('leaflet.markercluster/dist/MarkerCluster.css')]);
    build(L, el);
  }, { rootMargin: '600px 0px' });
  io.observe(el);
}

function build(L, el) {
  el.innerHTML = '';
  const map = L.map(el, { scrollWheelZoom: false, zoomControl: true, attributionControl: true, tap: true }).setView([13.6, 74.9], 8);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);
  map.attributionControl.setPrefix('<a href="https://leafletjs.com">Leaflet</a>');

  const icon = (ch) => L.divIcon({ className: `pin pin--${ch}`, html: '<i></i>', iconSize: [28, 28], iconAnchor: [14, 14] });
  L.marker(MANIPAL, { icon: L.divIcon({ className: 'pin pin--home', html: '<i></i>', iconSize: [28, 28], iconAnchor: [14, 14] }), title: 'Manipal', keyboard: false, interactive: false }).addTo(map);

  const cluster = L.markerClusterGroup({
    showCoverageOnHover: false, maxClusterRadius: 46, spiderfyOnMaxZoom: true,
    iconCreateFunction: (c) => L.divIcon({ className: 'cluster', html: `<span>${c.getChildCount()}</span>`, iconSize: [40, 40] }),
  });
  const markers = new Map();
  places.filter((p) => p.lat != null && p.lng != null).forEach((p) => {
    const m = L.marker([p.lat, p.lng], { icon: icon(p.chapter), title: p.name, alt: p.name, riseOnHover: true });
    m.bindTooltip(`<b>${esc(p.name)}</b><br><span>${chapterLabel(p.chapter)}${p.distanceKmFromManipal != null ? ` · ${p.distanceKmFromManipal} km` : ''}</span>`, { direction: 'top', offset: [0, -12], className: 'tip' });
    m.on('click', () => open(p.id));
    m.on('keypress', (e) => { if (e.originalEvent.key === 'Enter') open(p.id); });
    markers.set(p.id, m);
  });
  map.addLayer(cluster);

  const countEl = document.querySelector('[data-map-count]');
  const sync = (ids) => {
    cluster.clearLayers();
    const shown = [...markers].filter(([id]) => ids.has(id)).map(([, m]) => m);
    cluster.addLayers(shown);
    if (countEl) countEl.textContent = `${shown.length} on the map.`;
    if (shown.length) map.fitBounds(L.latLngBounds([...shown.map((m) => m.getLatLng()), L.latLng(MANIPAL)]), { padding: [30, 30], maxZoom: 11 });
  };
  sync(visibleIds());
  onFilter(sync);
  // Re-measure after layout changes (fonts, resizes).
  new ResizeObserver(() => map.invalidateSize()).observe(el);
}
