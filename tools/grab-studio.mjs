import { chromium } from 'playwright-core';
import { mkdir } from 'node:fs/promises';

await mkdir('tools/shots', { recursive: true });
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const page = await browser.newPage({ viewport: { width: 1366, height: 900 }, deviceScaleFactor: 1 });
await page.goto('https://jewelerstudio.ai', { waitUntil: 'networkidle', timeout: 45000 });

// Scroll through to load lazy imagery
await page.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 180)); }
  window.scrollTo(0, 0);
});
await page.waitForTimeout(1200);

await page.screenshot({ path: 'tools/shots/studio-full.png', fullPage: true });

const imgs = await page.evaluate(() => [...document.images]
  .map((i) => ({ src: i.currentSrc || i.src, w: i.naturalWidth, h: i.naturalHeight, alt: (i.alt || '').slice(0, 50) }))
  .filter((i) => i.w >= 350 && i.src && !i.src.startsWith('data:'))
  .sort((a, b) => b.w * b.h - a.w * a.h));

console.log('IMG COUNT: ' + imgs.length);
console.log(JSON.stringify(imgs.slice(0, 28)));
await browser.close();
console.log('done');
