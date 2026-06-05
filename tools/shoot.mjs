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

async function prep(page) {
  // Kill animations + smooth scroll for deterministic captures.
  await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important} html{scroll-behavior:auto!important}' });
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 90)); }
    window.scrollTo(0, 0);
    document.querySelectorAll('.reveal').forEach((e) => e.classList.add('is-visible'));
  });
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.evaluate(async () => { await Promise.all([...document.images].map((i) => (i.decode ? i.decode().catch(() => {}) : null))); });
  await page.waitForTimeout(250);
}

async function shootFull(name, width, height) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: 'load', timeout: 30000 });
  await prep(page);
  await page.screenshot({ path: `tools/shots/${name}.png`, fullPage: true, animations: 'disabled' });
  await page.close();
  console.log('full ' + name);
}

async function shootSections(width, height, targets) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: 'load', timeout: 30000 });
  await prep(page);
  for (const [sel, name] of targets) {
    const el = page.locator(sel).first();
    if (await el.count()) { await el.screenshot({ path: `tools/shots/sec-${name}.png`, animations: 'disabled' }); console.log('section ' + name); }
  }
  await page.close();
}

await shootFull('desktop', 1440, 900);
await shootFull('mobile', 390, 844);
await shootSections(1440, 900, [
  ['.hero', 'hero'], ['#intro', 'thesis'], ['#logbook', 'logbook'],
  ['#table', 'table'], ['#horizons', 'horizons'], ['#connect', 'connect'],
]);
await browser.close();
console.log('done');
