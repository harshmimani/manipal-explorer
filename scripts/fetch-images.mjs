// Finds and downloads licence-checked photos for every place from Wikimedia Commons.
// Run: node scripts/fetch-images.mjs [placeId ...]      (no args = all places)
//
// Sources per place: Commons full-text search (queries from research/raw/image-queries.mjs), the images
// on the place's Wikipedia article (if one is in its sources), and a Commons coordinate search.
// Hard filters: allowed licence (CC0, public domain, CC BY, CC BY-SA), JPEG, width >= 1600,
// landscape (1.25 <= w/h <= 2.6), name match, no watermark / portrait / map / logo categories,
// no personality-rights restriction. Survivors are scored (Quality/Featured image, Wikipedia use,
// distance, resolution, aspect), downloaded, then checked for sharpness and near-duplicates.
// 1 hero per place, up to 5 for mustDo places.
//
// Outputs:
//   .cache/images/src/<placeId>/<pageid>.jpg   downloaded masters (gitignored; re-downloadable)
//   src/data/image-credits.json                 author, licence, licence URL, source page per image
//   src/data/places.json                        each place's "images" = ordered image ids (hero first)
//   research/image-report.json                  per-place status, flags and reject counts (for review)
// Then run scripts/optimise-images.mjs to write the responsive files into public/images/places/<id>/.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';
import hints from '../research/raw/image-queries.mjs';

const ROOT = path.resolve(import.meta.dirname, '..');
const CACHE = path.join(ROOT, '.cache');
const API = 'https://commons.wikimedia.org/w/api.php';
const UA = 'ImageFetcher/1.0 (personal non-commercial script; nodejs)';
const MIN_W = 1600;
const DL_W = 1920; // standard Commons thumbnail bucket; >= our largest 1600w output
const SHARP_MIN = 60; // Laplacian variance at 1000px; below = rejected as soft
const SHARP_WEAK = 120; // below = kept but flagged weak
const MAX_PER_AUTHOR = 2;

const read = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const write = (p, d) => fs.writeFileSync(path.join(ROOT, p), JSON.stringify(d, null, 2) + '\n');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const norm = (s) => (s ?? '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
const stripHtml = (s) =>
  (s ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();

// ---------- HTTP with on-disk cache + polite retry ----------
async function get(url, { binary = false, cache = true } = {}) {
  const key = crypto.createHash('sha1').update(url).digest('hex');
  const file = path.join(CACHE, binary ? 'bin' : 'api', key);
  if (cache && fs.existsSync(file)) return binary ? fs.readFileSync(file) : JSON.parse(fs.readFileSync(file, 'utf8'));
  for (let attempt = 0; attempt < 6; attempt++) {
    let res;
    try {
      res = await fetch(url, { headers: { 'User-Agent': UA, 'Api-User-Agent': UA } });
    } catch (err) {
      // dropped connection (ECONNRESET etc.): back off and retry
      await sleep(2000 * 2 ** attempt);
      continue;
    }
    if (res.status === 429 || res.status >= 500) {
      const wait = Number(res.headers.get('retry-after')) * 1000 || 2000 * 2 ** attempt;
      await sleep(Math.min(wait, 60000));
      continue;
    }
    if (!res.ok) throw new Error(`${res.status} ${url}`);
    const body = binary ? Buffer.from(await res.arrayBuffer()) : await res.json();
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, binary ? body : JSON.stringify(body));
    await sleep(binary ? 400 : 150);
    return body;
  }
  throw new Error(`gave up: ${url}`);
}

const IIPROP = {
  prop: 'imageinfo',
  iiprop: 'url|size|mime|extmetadata',
  iiurlwidth: String(DL_W),
  iiextmetadatafilter: 'LicenseShortName|License|LicenseUrl|Artist|Credit|ImageDescription|ObjectName|Categories|Restrictions|GPSLatitude|GPSLongitude|AttributionRequired|DateTimeOriginal',
  iiextmetadatalanguage: 'en',
};
const qs = (o) => new URLSearchParams({ format: 'json', formatversion: '2', ...o }).toString();
const pagesOf = (r) => r?.query?.pages ?? [];

async function commonsSearch(q) {
  return pagesOf(await get(`${API}?${qs({ action: 'query', generator: 'search', gsrsearch: `${q} filetype:bitmap`, gsrnamespace: '6', gsrlimit: '40', ...IIPROP })}`));
}
async function commonsGeo(lat, lng, radius) {
  return pagesOf(await get(`${API}?${qs({ action: 'query', generator: 'geosearch', ggscoord: `${lat}|${lng}`, ggsradius: String(radius), ggslimit: '50', ggsnamespace: '6', ...IIPROP })}`));
}
async function commonsTitles(titles) {
  const out = [];
  for (let i = 0; i < titles.length; i += 40) {
    out.push(...pagesOf(await get(`${API}?${qs({ action: 'query', titles: titles.slice(i, i + 40).join('|'), ...IIPROP })}`)));
  }
  return out;
}
async function wikipediaImages(url) {
  const m = url.match(/^https?:\/\/(\w+)\.wikipedia\.org\/wiki\/([^#?]+)/);
  if (!m) return { files: [], lead: null };
  const title = decodeURIComponent(m[2]).replace(/_/g, ' ');
  const r = await get(`https://${m[1]}.wikipedia.org/w/api.php?${qs({ action: 'query', titles: title, prop: 'images|pageimages', imlimit: '100', piprop: 'name', redirects: '1' })}`);
  const page = pagesOf(r)[0] ?? {};
  return { files: (page.images ?? []).map((i) => i.title.replace(/^[^:]+:/, 'File:')), lead: page.pageimage ? `File:${page.pageimage.replace(/_/g, ' ')}` : null };
}

// ---------- candidate evaluation ----------
const LICENCE_OK = /^(cc0|pd|cc-by-(sa-)?\d)/; // excludes nc / nd / gfdl-only / fair use
const BAD_CATS = /watermark|portrait|selfie|people of |men of |women of |^people |logos?\b|\bmaps?\b|diagram|flags? of|coats? of arms|emblem|postage stamp|coins? of|screenshot|poster|signboard|\bnon-free\b|old photograph|19th-century photograph|british library|panoramics?\b|black and white photographs/;
// Close-ups of plants and animals make poor place photos (the place is the subject, not a spider).
const NATURE_CLOSEUP = /\b(flora of|fauna of|plants?|fabaceae|apocynaceae|insects?|spiders?|araneae|arachnids?|frogs?|anura|amphibians?|birds of|butterflies|lepidoptera|moths?|reptiles?|snakes?|lizards?|dogs?|cattle|cows?)\b/;
const BAD_TITLE = /\b(copper plates?|inscriptions?|3d|stereo|stereoscopic|anaglyph|receipt|ticket|aquarium|price list|notice board|timings board|board|map|logo|diagram|flag|emblem|stamp|poster|selfie|signboard|plan|chart|svg|scan)\b/;
// Names shared with places elsewhere (Delta Beach, Canada; Chandragiri, Andhra; Belur, Bengal ...).
const FOREIGN = /\b(canada|manitoba|usa|united states|england|australia|sri lanka|nepal|bangladesh|pakistan|andhra|telangana|tamil nadu|west bengal|kolkata|maharashtra|gujarat|rajasthan|odisha|uttar pradesh|himachal|madhya pradesh|shravanabelagola|sravanabelagola|latvia|riga|lithuania|estonia|germany|france|italy|spain|poland|russia|ukraine|china|japan|thailand|malaysia|indonesia)\b/;
// Strictly vegetarian guide: no fish, meat or egg as a subject, ever (fish landings, markets, catch).
const NON_VEG = /\b(fish|fishes|fishing catch|mackerel|sardines?|prawns?|shrimps?|crabs?|seafood|squid|meat|mutton|chicken|eggs?|fish market|dried fish)\b/;
const CROWD = /\b(crowd|devotees|pilgrims|tourists|students|people|festival|procession|wedding)\b/;
const GENERIC_WORDS = new Set(['beach', 'temple', 'falls', 'fort', 'lake', 'peak', 'trek', 'the', 'and', 'sri', 'shri', 'island', 'hill', 'river', 'udupi']);

function defaultMatch(place) {
  const main = place.name.replace(/\(.*?\)/g, '').split(/[,:&]/)[0];
  const tokens = norm(main).split(' ').filter((t) => t.length > 2 && !GENERIC_WORDS.has(t));
  return tokens.length ? [tokens.join(' ')] : [norm(main)];
}

function haversineKm(a, b, c, d) {
  const r = (x) => (x * Math.PI) / 180;
  const h = Math.sin(r(c - a) / 2) ** 2 + Math.cos(r(a)) * Math.cos(r(c)) * Math.sin(r(d - b) / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(h));
}

function evaluate(page, place, ctx) {
  const ii = page.imageinfo?.[0];
  if (!ii) return { reject: 'no-info' };
  const md = ii.extmetadata ?? {};
  const v = (k) => md[k]?.value ?? '';
  const licence = String(v('License')).toLowerCase();
  if (!LICENCE_OK.test(licence)) return { reject: `licence:${licence || v('LicenseShortName') || 'unknown'}` };
  if (ii.mime !== 'image/jpeg') return { reject: `mime:${ii.mime}` };
  if (ii.width < MIN_W) return { reject: 'too-small' };
  const ratio = ii.width / ii.height;
  if (ratio < 1.25) return { reject: 'not-landscape' };
  if (ratio > 2.6) return { reject: 'panorama' };
  if (/personality/i.test(v('Restrictions'))) return { reject: 'personality-rights' };
  const cats = String(v('Categories')).toLowerCase();
  const title = page.title.toLowerCase();
  if (cats.split('|').some((c) => BAD_CATS.test(c))) return { reject: 'category' };
  if (!ctx.hint.sacredFish && cats.split('|').some((c) => NATURE_CLOSEUP.test(c))) return { reject: 'nature-closeup' };
  if (BAD_TITLE.test(norm(title))) return { reject: 'title' };
  if (!ctx.hint.sacredFish && NON_VEG.test(norm(`${title} ${v('ImageDescription')} ${cats}`))) return { reject: 'non-veg-subject' };

  const desc = stripHtml(v('ImageDescription'));
  // Commons tracking categories (contests, upload tools) say nothing about the subject; leave them out of matching.
  const subjectCats = cats
    .split('|')
    .filter((c) => !/wiki loves|wikimedians|uploaded via|self-published|photographs taken on|license|files from|images from|media missing|cc-by|pd-|quality images|featured pictures|valued images/.test(c))
    .join(' ');
  const text = norm(`${title} ${desc} ${v('ObjectName')} ${subjectCats}`);
  // a phrase matches if it appears verbatim; 'a+b' means both parts must appear somewhere
  const phrases = (ctx.hint.match ?? defaultMatch(place)).map((p) => p.split('+').map(norm).join('+'));
  const has = (p) => p.split('+').every((part) => text.includes(part));
  const nameMatch = phrases.some(has);
  if ((ctx.hint.exclude ?? []).some((p) => text.includes(norm(p)))) return { reject: 'excluded-by-hint' };
  if (FOREIGN.test(text) && !(ctx.hint.allowForeign)) return { reject: 'other-region' };
  const lat = parseFloat(v('GPSLatitude'));
  const lng = parseFloat(v('GPSLongitude'));
  const km = Number.isFinite(lat) && Number.isFinite(lng) ? haversineKm(place.lat, place.lng, lat, lng) : null;
  const fromGeo = ctx.geo.has(page.title);
  if (!nameMatch && !(fromGeo && km !== null && km < 0.6)) return { reject: 'no-name-match' };
  if (km !== null && km > 40) return { reject: 'far-away' };

  let score = 0;
  const flags = [];
  if (nameMatch) score += 40;
  else flags.push('matched by location only, not by name');
  if (phrases.some((p) => p.split('+').every((part) => norm(cats).includes(part)))) score += 10;
  if (ctx.wiki.has(page.title)) score += 25;
  if (ctx.lead === page.title) score += 10;
  if (fromGeo) score += 8;
  if (km !== null && km < 3) score += 5;
  if (/featured pictures|pictures of the day/.test(cats)) score += 40;
  else if (/quality images/.test(cats)) score += 30;
  else if (/valued images/.test(cats)) score += 20;
  if (/wiki loves monuments.*(winner|national)/.test(cats)) score += 10;
  score += Math.min(10, (ii.width - MIN_W) / 400);
  score += ratio >= 1.4 && ratio <= 1.9 ? 10 : 3;
  if (CROWD.test(text)) { score -= 15; flags.push('may show crowds'); }
  if (/\bnight\b/.test(text)) score -= 5;

  const artistHtml = v('Artist');
  const href = artistHtml.match(/href="([^"]+)"/)?.[1];
  return {
    ok: true,
    score: Math.round(score * 10) / 10,
    flags,
    pageid: page.pageid,
    title: page.title,
    sourcePage: ii.descriptionurl,
    original: { url: ii.url.split('?')[0], width: ii.width, height: ii.height },
    downloadUrl: (ii.width > DL_W && ii.thumburl ? ii.thumburl : ii.url).split('?')[0],
    author: stripHtml(artistHtml) || stripHtml(v('Credit')) || 'Unknown (see source page)',
    authorUrl: href ? (href.startsWith('//') ? `https:${href}` : href) : null,
    licence: v('LicenseShortName') || licence,
    licenceCode: licence,
    licenceUrl: v('LicenseUrl') || (licence.startsWith('cc0') ? 'https://creativecommons.org/publicdomain/zero/1.0/' : null),
    attributionRequired: v('AttributionRequired') !== 'false',
    description: desc.slice(0, 300),
    distanceKm: km === null ? null : Math.round(km * 10) / 10,
    restrictions: v('Restrictions') || null,
  };
}

// ---------- image checks ----------
async function sharpness(buf) {
  const { data } = await sharp(buf)
    .resize({ width: 1000 })
    .greyscale()
    .convolve({ width: 3, height: 3, kernel: [0, 1, 0, 1, -4, 1, 0, 1, 0], offset: 128 })
    .raw()
    .toBuffer({ resolveWithObject: true });
  let s = 0, s2 = 0;
  for (const x of data) { s += x; s2 += x * x; }
  const m = s / data.length;
  return Math.round(s2 / data.length - m * m);
}
async function dhash(buf) {
  const { data } = await sharp(buf).greyscale().resize(9, 8, { fit: 'fill' }).raw().toBuffer({ resolveWithObject: true });
  let bits = '';
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) bits += data[y * 9 + x] > data[y * 9 + x + 1] ? '1' : '0';
  return bits;
}
const hamming = (a, b) => [...a].reduce((n, c, i) => n + (c !== b[i]), 0);

// ---------- main ----------
const places = read('src/data/places.json');
const only = new Set(process.argv.slice(2));
const credits = fs.existsSync(path.join(ROOT, 'src/data/image-credits.json')) ? read('src/data/image-credits.json') : {};
const report = fs.existsSync(path.join(ROOT, 'research/image-report.json')) ? read('research/image-report.json') : {};
const creditsArr = Array.isArray(credits) ? {} : credits;

for (const place of places) {
  if (only.size && !only.has(place.id)) continue;
  const hint = hints[place.id] ?? {};
  const want = place.mustDo ? 5 : 1;
  const queries = [...new Set([...(hint.queries ?? []), place.name.replace(/\(.*?\)/g, '').trim()])];

  const pages = new Map();
  const add = (list) => list.forEach((p) => p.imageinfo && !pages.has(p.title) && pages.set(p.title, p));
  for (const q of queries) add(await commonsSearch(q));
  const wiki = new Set();
  let lead = null;
  for (const src of place.sources.filter((s) => /wikipedia\.org\/wiki\//.test(s))) {
    const w = await wikipediaImages(src);
    w.files.forEach((f) => wiki.add(f));
    lead ??= w.lead;
  }
  if (wiki.size) add(await commonsTitles([...wiki].filter((t) => !pages.has(t))));
  const geo = new Set();
  const radius = hint.geoRadius ?? 800;
  if (radius) {
    const g = await commonsGeo(place.lat, place.lng, radius);
    g.forEach((p) => geo.add(p.title));
    add(g);
  }
  if (hint.pick?.length) add(await commonsTitles(hint.pick.filter((t) => !pages.has(t))));

  const rejects = {};
  const ok = [];
  for (const p of pages.values()) {
    if (hint.reject?.includes(p.title)) { rejects['rejected-by-review'] = (rejects['rejected-by-review'] ?? 0) + 1; continue; }
    const e = evaluate(p, place, { hint, wiki, lead, geo });
    if (e.ok) ok.push(e);
    else { const k = e.reject.split(':')[0]; rejects[k] = (rejects[k] ?? 0) + 1; }
  }
  const pickIdx = (t) => { const i = (hint.pick ?? []).indexOf(t); return i < 0 ? Infinity : i; };
  ok.sort((a, b) => pickIdx(a.title) - pickIdx(b.title) || b.score - a.score);

  // download in score order until we have enough sharp, distinct images
  const chosen = [];
  const authors = {};
  let tries = 0;
  for (const c of ok) {
    if (chosen.length >= want || tries >= want + 8) break;
    const forced = pickIdx(c.title) !== Infinity;
    if (!forced && (authors[c.author] ?? 0) >= MAX_PER_AUTHOR) continue;
    tries++;
    let buf;
    try { buf = await get(c.downloadUrl, { binary: true }); } catch (err) { rejects['download-failed'] = (rejects['download-failed'] ?? 0) + 1; continue; }
    const meta = await sharp(buf).metadata();
    if (!forced && meta.width < MIN_W) { rejects['too-small'] = (rejects['too-small'] ?? 0) + 1; continue; }
    c.sharpness = await sharpness(buf);
    if (!forced && c.sharpness < SHARP_MIN) { rejects['soft'] = (rejects['soft'] ?? 0) + 1; continue; }
    c.dhash = await dhash(buf);
    if (!forced && chosen.some((x) => hamming(x.dhash, c.dhash) <= 14)) { rejects['near-duplicate'] = (rejects['near-duplicate'] ?? 0) + 1; continue; }
    if (c.sharpness < SHARP_WEAK) c.flags.push(`soft-ish (sharpness ${c.sharpness})`);
    const dir = path.join(CACHE, 'images/src', place.id);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `${c.pageid}.jpg`), buf);
    c.downloaded = { width: meta.width, height: meta.height };
    chosen.push(c);
    authors[c.author] = (authors[c.author] ?? 0) + 1;
  }

  // drop this place's old credits, write the new ones
  for (const [id, cr] of Object.entries(creditsArr)) if (cr.placeId === place.id) delete creditsArr[id];
  place.images = chosen.map((c, i) => {
    const id = `${place.id}/${c.pageid}`;
    creditsArr[id] = {
      id,
      placeId: place.id,
      role: i === 0 ? 'hero' : 'gallery',
      order: i,
      file: `images/places/${place.id}/${c.pageid}`,
      alt: c.description && c.description.length > 12 && c.description.length < 160 ? c.description : `${place.name}`,
      title: c.title,
      author: c.author,
      authorUrl: c.authorUrl,
      licence: c.licence,
      licenceUrl: c.licenceUrl,
      sourcePage: c.sourcePage,
      original: c.original,
      width: c.downloaded.width,
      height: c.downloaded.height,
      flags: c.flags,
      sharpness: c.sharpness,
      score: c.score,
      distanceKm: c.distanceKm,
      restrictions: c.restrictions,
      retrieved: new Date().toISOString().slice(0, 10),
    };
    return id;
  });
  report[place.id] = {
    name: place.name,
    mustDo: place.mustDo,
    wanted: want,
    got: chosen.length,
    candidates: pages.size,
    passed: ok.length,
    rejects,
    status: chosen.length === 0 ? 'missing' : chosen.length < want || chosen.some((c) => c.flags.length) ? 'weak' : 'ok',
  };
  console.log(`${place.id.padEnd(44)} ${String(chosen.length).padStart(1)}/${want}  cand ${String(pages.size).padStart(3)} pass ${String(ok.length).padStart(3)}  ${report[place.id].status}`);
  // save as we go so an interrupted run keeps its progress
  write('src/data/image-credits.json', Object.fromEntries(Object.entries(creditsArr).sort(([a], [b]) => a.localeCompare(b))));
  write('src/data/places.json', places);
  write('research/image-report.json', report);
}
