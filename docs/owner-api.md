# Owner requests API

This is the safe MVP backend for the owner/admin requests page.

## Endpoint

Supabase Edge Function:

```text
/functions/v1/owner-requests
```

## What it does

- Runs on Supabase Edge Functions, not in the public Astro browser bundle.
- Uses `SUPABASE_SERVICE_ROLE_KEY` only as a server-side function secret.
- Requires an owner token in the request header:

```text
x-owner-token: <OWNER_API_TOKEN>
```

- Returns the newest records from `public.invitation_requests`.
- Updates request statuses with `PATCH`.
- Creates/updates generated client-site drafts in `public.generated_sites`.
- Reads generated site drafts for owner preview.
- Publishes a public-safe preview link for the client.
- Serves public generated invitation data by `site_slug` without exposing raw request/private fields.

## API operations

### List requests

```http
GET /functions/v1/owner-requests
x-owner-token: <OWNER_API_TOKEN>
```

Returns newest rows from `public.invitation_requests`.

### Update request status

```http
PATCH /functions/v1/owner-requests
x-owner-token: <OWNER_API_TOKEN>
content-type: application/json
```

```json
{
  "request_number": "REQ-...",
  "status": "in_progress"
}
```

Allowed statuses:

```text
brief_received
contacted
missing_info
ready_to_build
in_progress
preview_sent
revision_requested
delivered
paid
cancelled
```

### Create/update generated site draft

```http
POST /functions/v1/owner-requests
x-owner-token: <OWNER_API_TOKEN>
content-type: application/json
```

```json
{
  "action": "upsert_generated_site",
  "request_number": "REQ-...",
  "draft": {
    "request_id": "REQ-...",
    "template_slug": "wedding-luxury-01",
    "title": "Свадьба — ...",
    "sections": []
  }
}
```

The function writes to `public.generated_sites` with service role access and moves the request to `in_progress`.

### Read generated site draft

```http
GET /functions/v1/owner-requests?generated_site=REQ-...
x-owner-token: <OWNER_API_TOKEN>
```

Returns one generated site row and `draft_payload` for owner preview.

### Publish public-safe client preview

```http
POST /functions/v1/owner-requests
x-owner-token: <OWNER_API_TOKEN>
content-type: application/json
```

```json
{
  "action": "publish_generated_site",
  "request_number": "REQ-..."
}
```

The function reads the private `draft_payload`, creates/updates `public_payload`, changes the generated site status to `preview_sent`, updates the request status to `preview_sent`, and returns the `site_slug`. The public payload is intentionally limited to invitation content only.

### Read public client preview

```http
GET /functions/v1/owner-requests?public_site=<site_slug>
```

This route does **not** require `x-owner-token`. It only returns rows with public statuses (`preview_sent`, `published`, `client_preview`) and only returns `public_payload`; it must not expose phone numbers, owner notes, raw brief metadata, or service data.

Frontend public route:

```text
/i/<site_slug>/
```

For GitHub Pages/static hosting, `/i/<site_slug>/` is handled by the static public invite page plus the Astro `404.html` fallback, so direct links still work after deploy.

## Security rule

Never put these into Astro `PUBLIC_*` variables:

```text
SUPABASE_SERVICE_ROLE_KEY
OWNER_API_TOKEN
DATABASE_URL
```

The static admin page can optionally store the owner token in this browser's `localStorage` after the owner types it in. That is acceptable only for the owner device during MVP. It is not a replacement for real auth.

## Required Supabase function secrets

Set in Supabase, not in git:

```bash
supabase secrets set OWNER_API_TOKEN=<local-secret>
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

`SUPABASE_URL` is normally available automatically in Supabase Edge Functions.

## Local secret files

On this machine, secrets are stored outside the repo:

```text
~/.hermes/secrets/supabase_invitation_sites_service_role_key
~/.hermes/secrets/invitation_sites_owner_api_token
```

Do not print these in terminal output or chat.

## Deploy

From repo root:

```bash
cd /home/azureuser/Projects/websites/invitation-sites
npx supabase@latest functions deploy owner-requests --project-ref <project-ref>
```

## Verify without printing secrets

From `astro-site`:

```bash
npm run verify:owner-api
```
