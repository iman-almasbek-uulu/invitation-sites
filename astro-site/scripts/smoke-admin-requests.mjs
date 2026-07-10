import { chromium } from 'playwright';

const baseUrl = process.env.BASE_URL ?? 'http://localhost:4331/invitation-sites';
const ownerToken = process.env.OWNER_API_TOKEN ?? 'smoke-test-token';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

await page.goto(`${baseUrl}/admin/requests/`, { waitUntil: 'networkidle' });
await page.waitForSelector('#owner-auth-card', { state: 'visible', timeout: 5000 });

const loggedOut = await page.evaluate(() => ({
  hasLoginLink: Boolean(document.querySelector('#owner-login-link')),
  authCardVisible: !document.querySelector('#owner-auth-card')?.hasAttribute('hidden'),
  hasSafeBackendWarning: document.querySelector('.admin-warning')?.textContent?.includes('Edge Function') ?? false,
}));

await page.goto(`${baseUrl}/admin/login/`, { waitUntil: 'networkidle' });
await page.fill('#owner-token', ownerToken);
await page.click('button[type="submit"]');
await page.waitForURL('**/admin/requests/', { timeout: 5000 });
await page.waitForLoadState('networkidle');

const loggedIn = await page.evaluate(() => ({
  hasStoredToken: Boolean(window.localStorage.getItem('invitation_owner_api_token')),
  authCardHidden: document.querySelector('#owner-auth-card')?.hasAttribute('hidden') ?? false,
  loginText: document.querySelector('#owner-login-link')?.textContent?.trim(),
  logoutVisible: !document.querySelector('#clear-owner-token')?.hasAttribute('hidden'),
}));

await page.click('#clear-owner-token');
const loggedOutAgain = await page.evaluate(() => ({
  hasStoredToken: Boolean(window.localStorage.getItem('invitation_owner_api_token')),
  authCardVisible: !document.querySelector('#owner-auth-card')?.hasAttribute('hidden'),
}));

await page.click('#seed-demo');
await page.waitForSelector('.admin-request-card', { timeout: 5000 });
await page.selectOption('[data-status-select]', 'contacted');
await page.click('[data-save-status]');
await page.waitForFunction(() => document.querySelector('[data-status-select]')?.value === 'contacted', null, { timeout: 5000 });

const demo = await page.evaluate(() => ({
  total: document.querySelector('#stat-total')?.textContent?.trim(),
  source: document.querySelector('#stat-source')?.textContent?.trim(),
  hasCard: Boolean(document.querySelector('.admin-request-card')),
  hasStatusEditor: Boolean(document.querySelector('.request-status-editor')),
  selectedStatus: document.querySelector('[data-status-select]')?.value,
  note: document.querySelector('[data-status-note]')?.textContent?.trim(),
  status: document.querySelector('#admin-status')?.textContent?.trim(),
}));

const result = { loggedOut, loggedIn, loggedOutAgain, demo };
console.log(JSON.stringify(result, null, 2));

if (
  !loggedOut.hasLoginLink ||
  !loggedOut.authCardVisible ||
  !loggedOut.hasSafeBackendWarning ||
  !loggedIn.hasStoredToken ||
  !loggedIn.authCardHidden ||
  loggedIn.loginText !== 'Token сохранён' ||
  !loggedIn.logoutVisible ||
  loggedOutAgain.hasStoredToken ||
  !loggedOutAgain.authCardVisible ||
  !demo.hasCard ||
  !demo.hasStatusEditor ||
  demo.selectedStatus !== 'contacted' ||
  !demo.note?.includes('Fallback/demo') ||
  demo.total === '0'
) {
  await browser.close();
  throw new Error('Admin owner login/status smoke test failed');
}

await browser.close();
