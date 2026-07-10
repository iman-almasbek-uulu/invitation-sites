import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const envPath = resolve(root, '.env');
const tokenPath = '/home/azureuser/.hermes/secrets/invitation_sites_owner_api_token';

function parseEnv(text) {
  return Object.fromEntries(
    text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      .map((line) => {
        const index = line.indexOf('=');
        return index === -1 ? [line, ''] : [line.slice(0, index), line.slice(index + 1)];
      }),
  );
}

if (!existsSync(envPath)) {
  throw new Error('.env not found; cannot resolve PUBLIC_SUPABASE_URL');
}
if (!existsSync(tokenPath)) {
  throw new Error('Owner API token file not found');
}

const env = parseEnv(readFileSync(envPath, 'utf8'));
const supabaseUrl = env.PUBLIC_SUPABASE_URL;
const ownerToken = readFileSync(tokenPath, 'utf8').trim();

if (!supabaseUrl || !ownerToken) {
  throw new Error('Missing PUBLIC_SUPABASE_URL or owner token');
}

const baseEndpoint = `${supabaseUrl.replace(/\/$/, '')}/functions/v1/owner-requests`;
const listEndpoint = `${baseEndpoint}?limit=5`;
const response = await fetch(listEndpoint, {
  headers: { 'x-owner-token': ownerToken },
});
const body = await response.json().catch(() => null);

console.log(JSON.stringify({
  check: 'owner-api-list',
  status: response.status,
  ok: Boolean(body?.ok),
  source: body?.source,
  count: body?.count,
  first_request_number: body?.requests?.[0]?.request_number ?? null,
}, null, 2));

if (!response.ok || !body?.ok || !Array.isArray(body.requests)) {
  throw new Error(`Owner API list verification failed with status ${response.status}`);
}

const firstRequest = body.requests[0];
if (firstRequest?.request_number && firstRequest?.status) {
  const patchResponse = await fetch(baseEndpoint, {
    method: 'PATCH',
    headers: {
      'content-type': 'application/json',
      'x-owner-token': ownerToken,
    },
    body: JSON.stringify({
      request_number: firstRequest.request_number,
      status: firstRequest.status,
    }),
  });
  const patchBody = await patchResponse.json().catch(() => null);

  console.log(JSON.stringify({
    check: 'owner-api-status-patch',
    status: patchResponse.status,
    ok: Boolean(patchBody?.ok),
    request_number: patchBody?.request?.request_number ?? null,
    saved_status: patchBody?.request?.status ?? null,
  }, null, 2));

  if (!patchResponse.ok || !patchBody?.ok || patchBody?.request?.status !== firstRequest.status) {
    throw new Error(`Owner API status patch verification failed with status ${patchResponse.status}`);
  }

  const draft = {
    id: `SITE-${firstRequest.request_number}`,
    request_id: firstRequest.request_number,
    generated_at: new Date().toISOString(),
    template_slug: firstRequest.template_slug || firstRequest.template_select || 'custom',
    package_preference: firstRequest.package_preference || 'not-sure',
    title: `Smoke generated site — ${firstRequest.request_number}`,
    names: firstRequest.event_names || 'Smoke Names',
    client_name: firstRequest.client_name || 'Smoke Client',
    event_type: firstRequest.event_type || 'event',
    event_date: firstRequest.event_date || 'Дата уточняется',
    event_time: firstRequest.event_time || 'Время уточняется',
    venue: firstRequest.venue || 'Локация уточняется',
    language: firstRequest.language || 'ru',
    invitation_text: firstRequest.invitation_text || 'Smoke invitation text.',
    rsvp_needed: firstRequest.rsvp_needed || 'yes',
    sections: [
      { title: 'Главный экран', body: 'Smoke hero' },
      { title: 'Приглашение', body: 'Smoke invite' },
      { title: 'Дата и время', body: 'Smoke date' },
      { title: 'Локация', body: 'Smoke venue' },
      { title: 'Программа', body: 'Smoke program' },
      { title: 'RSVP', body: 'Smoke RSVP' },
    ],
    next_steps: ['Smoke verify persistent generated site'],
  };

  const generatedPostResponse = await fetch(baseEndpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-owner-token': ownerToken,
    },
    body: JSON.stringify({
      action: 'upsert_generated_site',
      request_number: firstRequest.request_number,
      draft,
    }),
  });
  const generatedPostBody = await generatedPostResponse.json().catch(() => null);

  console.log(JSON.stringify({
    check: 'owner-api-generated-site-upsert',
    status: generatedPostResponse.status,
    ok: Boolean(generatedPostBody?.ok),
    request_number: generatedPostBody?.generated_site?.request_number ?? null,
    site_slug: generatedPostBody?.generated_site?.site_slug ?? null,
    generated_status: generatedPostBody?.generated_site?.status ?? null,
  }, null, 2));

  if (!generatedPostResponse.ok || !generatedPostBody?.ok) {
    throw new Error(`Owner API generated site upsert failed with status ${generatedPostResponse.status}`);
  }

  const generatedReadResponse = await fetch(`${baseEndpoint}?generated_site=${encodeURIComponent(firstRequest.request_number)}`, {
    headers: { 'x-owner-token': ownerToken },
  });
  const generatedReadBody = await generatedReadResponse.json().catch(() => null);

  console.log(JSON.stringify({
    check: 'owner-api-generated-site-read',
    status: generatedReadResponse.status,
    ok: Boolean(generatedReadBody?.ok),
    request_number: generatedReadBody?.generated_site?.request_number ?? null,
    site_slug: generatedReadBody?.generated_site?.site_slug ?? null,
    title: generatedReadBody?.generated_site?.draft_payload?.title ?? null,
  }, null, 2));

  if (!generatedReadResponse.ok || !generatedReadBody?.ok || generatedReadBody?.generated_site?.draft_payload?.title !== draft.title) {
    throw new Error(`Owner API generated site read failed with status ${generatedReadResponse.status}`);
  }

  const publishResponse = await fetch(baseEndpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-owner-token': ownerToken,
    },
    body: JSON.stringify({
      action: 'publish_generated_site',
      request_number: firstRequest.request_number,
      status: 'preview_sent',
    }),
  });
  const publishBody = await publishResponse.json().catch(() => null);

  console.log(JSON.stringify({
    check: 'owner-api-generated-site-publish',
    status: publishResponse.status,
    ok: Boolean(publishBody?.ok),
    site_slug: publishBody?.public_site?.site_slug ?? null,
    generated_status: publishBody?.public_site?.status ?? null,
  }, null, 2));

  if (!publishResponse.ok || !publishBody?.ok || !publishBody?.public_site?.site_slug) {
    throw new Error(`Owner API generated site publish failed with status ${publishResponse.status}`);
  }

  const publicReadResponse = await fetch(`${baseEndpoint}?public_site=${encodeURIComponent(publishBody.public_site.site_slug)}`);
  const publicReadBody = await publicReadResponse.json().catch(() => null);

  console.log(JSON.stringify({
    check: 'public-generated-site-read',
    status: publicReadResponse.status,
    ok: Boolean(publicReadBody?.ok),
    site_slug: publicReadBody?.generated_site?.site_slug ?? null,
    public_title: publicReadBody?.generated_site?.public_payload?.title ?? null,
    has_draft_payload: Boolean(publicReadBody?.generated_site?.draft_payload),
    has_client_phone: Boolean(publicReadBody?.generated_site?.public_payload?.client_whatsapp),
  }, null, 2));

  if (!publicReadResponse.ok || !publicReadBody?.ok) {
    throw new Error(`Public generated site read failed with status ${publicReadResponse.status}`);
  }
  if (publicReadBody?.generated_site?.draft_payload) {
    throw new Error('Public generated site response leaked draft_payload');
  }
  if (publicReadBody?.generated_site?.public_payload?.client_whatsapp) {
    throw new Error('Public generated site response leaked client_whatsapp');
  }

}
