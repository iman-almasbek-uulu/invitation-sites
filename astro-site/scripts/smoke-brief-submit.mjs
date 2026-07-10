import { chromium } from 'playwright';

const baseUrl = process.env.BASE_URL ?? 'http://localhost:4331/invitation-sites';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto(`${baseUrl}/brief/?template=wedding-luxury-01`, { waitUntil: 'networkidle' });
await page.fill('input[name="client_name"]', 'Test Client');
await page.fill('input[name="client_whatsapp"]', '+996000000');
await page.selectOption('select[name="event_type"]', 'wedding');
await page.fill('input[name="event_names"]', 'A & B');
await page.fill('input[name="event_date"]', '2026-08-20');
await page.fill('input[name="event_time"]', '18:00');
await page.fill('input[name="venue"]', 'Test Venue');
await page.fill('textarea[name="invitation_text"]', 'Test invitation text');
await page.fill('textarea[name="assets_note"]', 'Test assets note');
await page.selectOption('select[name="package_preference"]', 'premium');
await Promise.all([
  page.waitForURL(/\/invitation-sites\/brief\/success\/\?id=REQ-/, { timeout: 5000 }),
  page.click('button[type="submit"]'),
]);
const url = page.url();
const id = new URL(url).searchParams.get('id');
const stored = await page.evaluate((requestId) => {
  const raw = localStorage.getItem(`invitation_request_${requestId}`);
  return raw ? JSON.parse(raw) : null;
}, id);
console.log(JSON.stringify({ url, id, submit_backend: stored?.submit_backend, template_slug: stored?.template_slug, event_type: stored?.event_type }, null, 2));
await browser.close();
