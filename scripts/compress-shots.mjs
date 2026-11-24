// Shrink review screenshots in place (palette PNG) so they're cheap to commit.
// Usage: node scripts/compress-shots.mjs [dir=review/screenshots/site]
import sharp from 'sharp';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.argv[2] || 'review/screenshots/site';
let before = 0, after = 0;
async function walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) { await walk(p); continue; }
    if (!p.endsWith('.png')) continue;
    const buf = await readFile(p);
    const out = await sharp(buf).png({ palette: true, quality: 82, effort: 8, compressionLevel: 9 }).toBuffer();
    before += buf.length;
    if (out.length < buf.length) { await writeFile(p, out); after += out.length; } else after += buf.length;
  }
}
await walk(root);
console.log(`${(before / 1e6).toFixed(1)} MB → ${(after / 1e6).toFixed(1)} MB`);
