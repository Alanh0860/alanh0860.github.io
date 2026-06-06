import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

await mkdir('assets/img', { recursive: true });
await mkdir('tools/previews', { recursive: true });

const base = 'https://www.jewelerstudio.ai/';
const espresso = { r: 33, g: 26, b: 20 }; // site bg #211a14
const items = [
  ['closed-sale-ring.png', 'studio-ring-hero'],
  ['jewelry/ring.png', 'studio-ring'],
  ['jewelry/pendant.png', 'studio-pendant'],
  ['jewelry/necklace.png', 'studio-necklace'],
  ['jewelry/earrings.png', 'studio-earrings'],
  ['jewelry/bracelet.png', 'studio-bracelet'],
  ['jewelry/grillz.png', 'studio-grillz'],
  ['icon_logo_bubble.png', 'studio-logo'],
];

for (const [path, slug] of items) {
  try {
    const res = await fetch(base + path, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) { console.log(`FAIL ${path} ${res.status}`); continue; }
    const buf = Buffer.from(await res.arrayBuffer());
    const meta = await sharp(buf).metadata();
    await sharp(buf).resize({ width: 1024, height: 1024, fit: 'inside', withoutEnlargement: true }).webp({ quality: 84 }).toFile(`assets/img/${slug}.webp`);
    await sharp(buf).resize({ width: 560, height: 560, fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toFile(`assets/img/${slug}-sm.webp`);
    await sharp(buf).resize({ width: 1024, height: 1024, fit: 'inside', withoutEnlargement: true }).flatten({ background: espresso }).jpeg({ quality: 86, mozjpeg: true }).toFile(`assets/img/${slug}.jpg`);
    await sharp(buf).resize({ width: 460, height: 460, fit: 'inside' }).flatten({ background: espresso }).jpeg({ quality: 80 }).toFile(`tools/previews/${slug}.jpg`);
    console.log(`${slug}: ${meta.width}x${meta.height} alpha=${meta.hasAlpha} fmt=${meta.format}`);
  } catch (e) { console.log(`ERR ${slug} ${e.message}`); }
}
console.log('done');
