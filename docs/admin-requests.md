# Admin requests MVP

This page is the first owner/admin view for incoming invitation requests.

URLs:

```text
/admin/login/
/admin/requests/
```

With GitHub Pages base path:

```text
/invitation-sites/admin/login/
/invitation-sites/admin/requests/
```

## What it does now

The MVP admin flow:

1. Owner opens `/admin/login/`.
2. Owner pastes `OWNER_API_TOKEN` on their own device.
3. Browser stores the token only in `localStorage` under `invitation_owner_api_token`.
4. `/admin/requests/` reads real Supabase rows through protected Edge Function `owner-requests`.
5. Owner can change each request status from the admin card.
6. Status updates are saved through the same token-protected Edge Function.
7. If token/API is unavailable, admin shows localStorage/demo fallback instead of breaking.

## Safe data sources

| Source | Used for | Safe for GitHub Pages? |
|---|---|---|
| `localStorage` | Owner token + demo/fallback requests in this browser | OK for MVP owner device |
| Supabase anon key | Public insert from `/brief` only | Yes, with RLS insert-only policy |
| Supabase Edge Function | Owner/admin read of requests | Yes, token-protected |
| Supabase service role | Server/Edge Function only | No — never in Astro frontend |

## Why admin read uses Edge Function

The RLS model allows anonymous visitors to **insert** a request but not **select** all client requests.

```text
/brief public visitor → INSERT allowed
/admin/login owner → saves owner token locally
/admin/requests + owner token → Edge Function → service-role SELECT/PATCH on server
```

This keeps client data away from public website visitors.

## Secret rules

Do not put these in Astro `PUBLIC_*` env variables:

```text
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL
JWT secret
OWNER_API_TOKEN
```

`OWNER_API_TOKEN` is only pasted into the owner browser and sent as `x-owner-token` to the Edge Function. This is acceptable for MVP, but should later be replaced with Supabase Auth / magic link.

## How to test locally

From `astro-site`:

```bash
npm run build
npx astro check
npm run verify:owner-api
```

For browser smoke test, start preview first:

```bash
npm run preview -- --port 4331
npm run smoke:admin
```

The smoke test checks:

- `/admin/requests/` logged-out state;
- `/admin/login/` token save flow;
- redirect back to `/admin/requests/`;
- logout/clear-token button;
- demo fallback request rendering;
- demo status dropdown save flow.

## How to test real owner API in browser

1. Open:

```text
/invitation-sites/admin/login/
```

2. Paste owner token.
3. Click “Сохранить и открыть заявки”.
4. `/admin/requests/` should show source `Owner API` when rows are loaded.
5. Use “Выйти” to remove token from this browser.
