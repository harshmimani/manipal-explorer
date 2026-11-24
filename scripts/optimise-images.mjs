// Builds the responsive image set from the masters downloaded by scripts/fetch-images.mjs.
// Run: node scripts/optimise-images.mjs [--force]
//
// For every entry in src/data/image-credits.json:
//   public/images/places/<placeId>/<pageid>-{480,960,1600}.{avif,webp}   (EXIF/metadata stripped)
// and adds to the entry: widths, formats, aspect, a dominant colour and a tiny blurred base64
// placeholder (data URI) for blur-up loading. Files no longer referenced by any credit are deleted.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.join(ROOT, '.cache/images/src');
const OUT = path.join(ROOT, 'public/images/places');
const CREDITS = path.join(ROOT, 'src/data/image-credits.json');
const WIDTHS = [480, 960, 1600];
const FORMATS = {
  avif: (s) => s.avif({ quality: 50, effort: 5, chromaSubsampling: '4:2:0' }),
  webp: (s) => s.webp({ quality: 74, effort: 5, smartSubsample: true }),
};
const force = process.argv.includes('--force');

const credits = JSON.parse(fs.readFileSync(CREDITS, 'utf8'));
const keep = new Set();
let made = 0;
let bytes = 0;

for (const c of Object.values(credits)) {
  const [placeId, pageid] = c.id.split('/');
  const src = path.join(SRC, placeId, `${pageid}.jpg`);
  if (!fs.existsSync(src)) throw new Error(`missing master for ${c.id}; run scripts/fetch-images.mjs ${placeId}`);
  const dir = path.join(OUT, placeId);
  fs.mkdirSync(dir, { recursive: true });
  const srcTime = fs.statSync(src).mtimeMs;

  // .rotate() bakes in EXIF orientation; sharp drops all metadata (EXIF, GPS, XMP) unless asked to keep it.
  const base = () => sharp(src).rotate();
  for (const w of WIDTHS) {
    for (const [ext, encode] of Object.entries(FORMATS)) {
      const out = path.join(dir, `${pageid}-${w}.${ext}`);
      keep.add(out);
      if (!force && fs.existsSync(out) && fs.statSync(out).mtimeMs > srcTime) { bytes += fs.statSync(out).size; continue; }
      await encode(base().resize({ width: w, withoutEnlargement: true })).toFile(out);
      bytes += fs.statSync(out).size;
      made++;
    }
  }

  const meta = await base().metadata();
  const [w, h] = (meta.orientation ?? 1) >= 5 ? [meta.height, meta.width] : [meta.width, meta.height];
  const tiny = await base().resize(24).blur(1.2).webp({ quality: 40 }).toBuffer();
  const { dominant } = await base().resize(64).stats();
  const hex = (n) => n.toString(16).padStart(2, '0');

  c.file = `images/places/${placeId}/${pageid}`; // + `-${width}.${format}`
  c.widths = WIDTHS.filter((x, i) => x <= w || i === 0);
  c.formats = Object.keys(FORMATS);
  c.aspect = Math.round((w / h) * 1000) / 1000;
  c.dominant = `#${hex(dominant.r)}${hex(dominant.g)}${hex(dominant.b)}`;
  c.placeholder = `data:image/webp;base64,${tiny.toString('base64')}`;
}

// remove stale outputs (images that were replaced or dropped)
let removed = 0;
if (fs.existsSync(OUT)) {
  for (const d of fs.readdirSync(OUT)) {
    const dir = path.join(OUT, d);
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const f of fs.readdirSync(dir)) {
      const p = path.join(dir, f);
      if (!keep.has(p)) { fs.rmSync(p); removed++; }
    }
    if (!fs.readdirSync(dir).length) fs.rmdirSync(dir);
  }
}

fs.writeFileSync(CREDITS, JSON.stringify(credits, null, 2) + '\n');
console.log(`images: ${Object.keys(credits).length}, files written: ${made}, stale removed: ${removed}, total ${(bytes / 1e6).toFixed(1)} MB`);
