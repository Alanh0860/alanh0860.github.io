import sharp from 'sharp';
import { readdir, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';

const SRC = 'source-photos';
const OUT = 'assets/img';
const PREV = 'tools/previews';
await mkdir(OUT, { recursive: true });
await mkdir(PREV, { recursive: true });

// Long-edge caps; fit:inside preserves aspect, withoutEnlargement avoids upscaling small shots.
const FULL = { width: 2200, height: 2200, fit: 'inside', withoutEnlargement: true };
const SM   = { width: 1100, height: 1100, fit: 'inside', withoutEnlargement: true };
const PV   = { width: 900,  height: 900,  fit: 'inside', withoutEnlargement: true };

const slug = n => n.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
const kb = async p => Math.round((await stat(p)).size / 1024);

const files = (await readdir(SRC)).filter(f => /\.(jpe?g|png)$/i.test(f));
const report = [];
for (const f of files) {
  const src = path.join(SRC, f);
  const base = slug(f);
  try {
    const meta = await sharp(src).rotate().metadata();
    let dom = 'n/a';
    try { const s = await sharp(src).rotate().resize(80).stats(); dom = `${s.dominant.r},${s.dominant.g},${s.dominant.b}`; } catch {}
    await sharp(src).rotate().resize(FULL).webp({ quality: 80 }).toFile(path.join(OUT, `${base}.webp`));
    await sharp(src).rotate().resize(FULL).jpeg({ quality: 82, mozjpeg: true }).toFile(path.join(OUT, `${base}.jpg`));
    await sharp(src).rotate().resize(SM).webp({ quality: 78 }).toFile(path.join(OUT, `${base}-sm.webp`));
    await sharp(src).rotate().resize(PV).jpeg({ quality: 72 }).toFile(path.join(PREV, `${base}.jpg`));
    report.push({
      base,
      source: `${meta.width}x${meta.height}`,
      dominantRGB: dom,
      webpKB: await kb(path.join(OUT, `${base}.webp`)),
      jpgKB: await kb(path.join(OUT, `${base}.jpg`)),
    });
  } catch (e) {
    report.push({ base, error: String(e.message || e) });
  }
}
console.table(report);
console.log(`\nDone: ${report.filter(r => !r.error).length}/${files.length} images optimized into ${OUT}`);
