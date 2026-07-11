import { chromium } from 'playwright';
import path from 'node:path';

const outDir = '/home/azureuser/Projects/invitation-upload/qa-screenshots-vertical';
const url = process.env.BASE_URL || 'https://iman-almasbek-uulu.github.io/invitation-sites/templates/wedding-luxury-01/?measure=0ecab7c';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 853, height: 1844 }, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: 'networkidle' });
await page.screenshot({ path: path.join(outDir, 'made-closed-853x1844.png'), fullPage: false });
const closedBoxes = await page.evaluate(() => {
  const q = (sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
  };
  return { hero:q('.wedding-first-hero'), shell:q('.wedding-first-shell'), title:q('.wedding-first-title'), titleP:q('.wedding-first-title p'), names:q('.wedding-first-title h1'), date:q('.wedding-first-title time'), envelope:q('.wedding-envelope-scene'), actions:q('.wedding-first-actions'), openButton:q('.open-invitation-button'), wax:q('.wax-seal-button') };
});
await page.click('[data-open-first-envelope]');
await page.waitForTimeout(1800);
await page.screenshot({ path: path.join(outDir, 'made-open-853x1844.png'), fullPage: false });
const openBoxes = await page.evaluate(() => {
  const q = (sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
  };
  return { hero:q('.wedding-first-hero'), shell:q('.wedding-first-shell'), title:q('.wedding-first-title'), envelope:q('.wedding-envelope-scene'), invitationCard:q('.invitation-card'), cardCopy:q('.invitation-card-copy'), actions:q('.wedding-first-actions'), viewButton:q('.view-invitation-button') };
});
console.log(JSON.stringify({ ok: true, url, closedBoxes, openBoxes }, null, 2));
await browser.close();
