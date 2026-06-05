import { chromium } from 'playwright-core';
import { mkdir } from 'node:fs/promises';

await mkdir('tools/shots', { recursive: true });
const url = 'http://localhost:8099/';

let browser;
for (const channel of ['msedge', 'chrome']) {
  try { browser = await chromium.launch({ channel, headless: true }); console.log('using ' + channel); break; }
  catch (e) { console.error(channel + ' unavailable: ' + e.message.split('\n')[0]); }
}
if (!browser) { console.error('No system browser (Edge/Chrome) found.'); process.exit(1); }

async function shoot(name, width, height, full = true) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: 'load', timeout: 30000 });
  // Scroll through to load lazy images + trigger reveals, then force final state.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 300) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); }
    window.scrollTo(0, 0);
    document.querySelectorAll('.reveal').forEach((e) => e.classList.add('is-visible'));
  });
  await page.waitForLoadState('networkidle');
  await page.evaluate(async () => { await Promise.all([...document.images].map((i) => (i.decode ? i.decode().catch(() => {}) : null))); });
  await page.waitForTimeout(350);
  await page.screenshot({ path: `tools/shots/${name}.png`, fullPage: full });
  await page.close();
  console.log('shot ' + name);
}

await shoot('desktop', 1280, 900);
await shoot('mobile', 390, 844);

// Full-resolution section close-ups for crop/caption inspection
const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: 'load', timeout: 30000 });
await page.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 300) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); }
  window.scrollTo(0, 0);
  document.querySelectorAll('.reveal').forEach((e) => e.classList.add('is-visible'));
});
await page.waitForLoadState('networkidle');
await page.evaluate(async () => { await Promise.all([...document.images].map((i) => (i.decode ? i.decode().catch(() => {}) : null))); });
for (const id of ['horizons', 'hands']) {
  await page.locator('#' + id).screenshot({ path: `tools/shots/${id}.png` });
  console.log('section ' + id);
}
await browser.close();
console.log('done');
