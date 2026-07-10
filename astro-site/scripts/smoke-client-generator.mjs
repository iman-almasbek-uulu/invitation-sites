import { chromium } from 'playwright';
import { existsSync, readFileSync } from 'node:fs';

const baseUrl = process.env.BASE_URL || 'http://localhost:4321/invitation-sites';
const normalizedBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
const localRequestId = `REQ-SMOKE-${Date.now().toString(36).toUpperCase()}`;
const tokenPath = '/home/azureuser/.hermes/secrets/invitation_sites_owner_api_token';
const ownerToken = existsSync(tokenPath) ? readFileSync(tokenPath, 'utf8').trim() : '';
let requestId = localRequestId;
let expectedNames = 'Smoke & Test';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

try {
  await page.goto(`${normalizedBase}/admin/requests/`, { waitUntil: 'networkidle' });

  if (ownerToken) {
    await page.evaluate((token) => {
      window.localStorage.setItem('invitation_owner_api_token', token);
    }, ownerToken);
    await page.reload({ waitUntil: 'networkidle' });
    const firstBuildButton = page.locator('[data-build-site]').first();
    await firstBuildButton.waitFor({ state: 'visible', timeout: 15_000 });
    requestId = await firstBuildButton.getAttribute('data-build-site') || requestId;
    expectedNames = await firstBuildButton.evaluate((button) => {
      const card = button.closest('.admin-request-card');
      return card?.querySelector('h3')?.textContent?.trim() || 'Smoke & Test';
    });
  } else {
    await page.evaluate((id) => {
      const request = {
        request_id: id,
        created_at: new Date().toISOString(),
        status: 'brief_received',
        source: 'smoke-test',
        template_slug: 'wedding-luxury-01',
        template_select: 'wedding-luxury-01',
        client_name: 'Smoke Client',
        client_whatsapp: '+996 000 000 000',
        event_type: 'wedding',
        event_names: 'Smoke & Test',
        event_date: '2026-09-12',
        event_time: '18:00',
        venue: 'Smoke Restaurant',
        invitation_text: 'Smoke invitation text.',
        language: 'ru',
        rsvp_needed: 'yes',
        assets_note: 'Smoke assets later.',
        urgency: 'normal',
        package_preference: 'premium',
        submit_backend: 'localstorage-demo',
      };
      window.localStorage.setItem(`invitation_request_${id}`, JSON.stringify(request));
      window.localStorage.setItem('invitation_requests_index', JSON.stringify([id]));
      window.localStorage.removeItem('invitation_owner_api_token');
      window.localStorage.removeItem(`generated_invitation_site_${id}`);
    }, requestId);
    await page.reload({ waitUntil: 'networkidle' });
  }

  const card = page.locator(`[data-build-site="${requestId}"]`);
  await card.waitFor({ state: 'visible', timeout: 10_000 });
  await card.click();

  await page.locator(`[data-build-note="${requestId}"]`).waitFor({ timeout: 10_000 });

  const storedDraft = await page.evaluate((id) => {
    const raw = window.localStorage.getItem(`generated_invitation_site_${id}`);
    return raw ? JSON.parse(raw) : null;
  }, requestId);

  if (!storedDraft) throw new Error('generated localStorage draft was not saved');
  if (!Array.isArray(storedDraft.sections) || storedDraft.sections.length !== 6) {
    throw new Error(`expected 6 sections, got ${storedDraft.sections?.length}`);
  }

  await page.goto(`${normalizedBase}/client-preview/?id=${encodeURIComponent(requestId)}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('#client-preview-shell[data-state="ready"]', { timeout: 10_000 });

  const preview = await page.evaluate(() => ({
    state: document.querySelector('#client-preview-shell')?.getAttribute('data-state'),
    source: document.querySelector('#preview-source')?.textContent,
    names: document.querySelector('#preview-names')?.textContent,
    sections: document.querySelectorAll('.generated-section-card').length,
    nextSteps: document.querySelectorAll('#preview-next-steps li').length,
  }));

  if (preview.state !== 'ready') throw new Error(`preview state is ${preview.state}`);
  if (preview.names !== expectedNames) throw new Error(`unexpected preview names: ${preview.names}`);
  if (preview.sections !== 6) throw new Error(`expected 6 preview sections, got ${preview.sections}`);
  if (!preview.nextSteps) throw new Error('expected owner next steps');

  let publicPreview = null;
  if (ownerToken) {
    await page.goto(`${normalizedBase}/admin/requests/`, { waitUntil: 'networkidle' });
    const publishButton = page.locator(`[data-publish-site="${requestId}"]`);
    if (await publishButton.count()) {
      await publishButton.click();
      const publicLinkLocator = page.locator(`[data-public-link="${requestId}"]`);
      await page.waitForFunction((id) => {
        const link = document.querySelector(`[data-public-link="${id}"]`);
        return link && !link.hasAttribute('hidden') && link.getAttribute('href')?.includes('/i/');
      }, requestId, { timeout: 15_000 });
      const publicHref = await publicLinkLocator.getAttribute('href');
      if (!publicHref || !publicHref.includes('/i/')) throw new Error(`public link href missing after publish: ${publicHref}`);
      await page.evaluate(() => window.localStorage.removeItem('invitation_owner_api_token'));
      await page.goto(new URL(publicHref, normalizedBase).toString(), { waitUntil: 'networkidle' });
      await page.waitForSelector('#public-invite-shell[data-state="ready"]', { timeout: 15_000 });
      publicPreview = await page.evaluate(() => ({
        state: document.querySelector('#public-invite-shell')?.getAttribute('data-state'),
        names: document.querySelector('#public-names')?.textContent,
        sections: document.querySelectorAll('#public-sections .generated-section-card').length,
        ownerNotes: document.body.textContent?.includes('Owner next steps') ?? false,
      }));
      if (publicPreview.state !== 'ready') throw new Error(`public preview state is ${publicPreview.state}`);
      if (publicPreview.names !== expectedNames) throw new Error(`unexpected public names: ${publicPreview.names}`);
      if (publicPreview.sections !== 6) throw new Error(`expected 6 public sections, got ${publicPreview.sections}`);
      if (publicPreview.ownerNotes) throw new Error('public route leaked owner next steps');
    }
  }

  console.log(JSON.stringify({
    check: 'client-generator-smoke',
    ok: true,
    request_id: requestId,
    source: preview.source,
    sections: preview.sections,
    next_steps: preview.nextSteps,
    public_preview: publicPreview,
  }, null, 2));
} finally {
  await browser.close();
}
