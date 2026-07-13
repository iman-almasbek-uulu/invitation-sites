import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const baseUrl = process.env.BASE_URL ?? 'http://127.0.0.1:4321';
const url = `${baseUrl}/recovery/dastan-nuriza/`;
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const requests = [];
page.on('request', (request) => requests.push(request.url()));

try {
  const response = await page.goto(url, { waitUntil: 'networkidle' });
  assert.equal(response?.status(), 200, 'recovery route must load');
  await page.waitForSelector('[data-recovery-page]');
  assert.equal(await page.locator('[data-recovery-page]').count(), 1);
  assert.equal(await page.locator('button[data-audio-toggle]').count(), 1, 'audio control is present');
  assert.equal(await page.locator('a[data-map-link]').count(), 1, 'map control is present');
  assert.equal(await page.locator('form[data-rsvp-form]').count(), 1, 'RSVP form is present');
  await page.locator('button[data-audio-toggle]').click();
  assert.equal(await page.locator('button[data-audio-toggle]').getAttribute('aria-pressed'), 'true', 'audio can be enabled');
  await page.locator('input[name="guestName"]').fill('Тестовый гость');
  await page.locator('form[data-rsvp-form]').evaluate((form) => form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true })));
  assert.match(await page.locator('[data-rsvp-status]').textContent() ?? '', /сакталды/i, 'RSVP feedback is shown');
  assert.equal(requests.some((request) => /tilda|tildacdn|priglasiava/i.test(request)), false, 'no Tilda requests are allowed');
  console.log('PASS recovery route, interactions, and dependency isolation');
} finally {
  await browser.close();
}
