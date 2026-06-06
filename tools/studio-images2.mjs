import sharp from 'sharp';
const base = 'https://www.jewelerstudio.ai/';
const espresso = { r: 33, g: 26, b: 20 };
const items = [
  ['pendant-nameplate.jpg', 'studio-pend-iced'],
  ['nameplate-pendant.png', 'studio-pend-nameplate'],
  ['logo-pendant.png', 'studio-pend-logo'],
  ['picture-pendant.png', 'studio-pend-picture'],
];
for (const [path, slug] of items) {
  try {
    const res = await fetch(base + path, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!res.ok) { console.log(`FAIL ${path} ${res.status}`); continue; }
    const buf = Buffer.from(await res.arrayBuffer());
    const m = await sharp(buf).metadata();
    await sharp(buf).resize({ width: 460, fit: 'inside' }).flatten({ background: espresso }).jpeg({ quality: 80 }).toFile(`tools/previews/${slug}.jpg`);
    await sharp(buf).resize({ width: 1024, height: 1024, fit: 'inside', withoutEnlargement: true }).webp({ quality: 84 }).toFile(`assets/img/${slug}.webp`);
    await sharp(buf).resize({ width: 560, height: 560, fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toFile(`assets/img/${slug}-sm.webp`);
    await sharp(buf).resize({ width: 1024, height: 1024, fit: 'inside', withoutEnlargement: true }).flatten({ background: espresso }).jpeg({ quality: 86, mozjpeg: true }).toFile(`assets/img/${slug}.jpg`);
    console.log(`${slug}: ${m.width}x${m.height} alpha=${m.hasAlpha} fmt=${m.format}`);
  } catch (e) { console.log(`ERR ${slug} ${e.message}`); }
}
console.log('done');
