# Supabase setup for invitation requests

This is the first backend step for the `/brief` flow.

Current frontend MVP:

```text
/brief → localStorage → /brief/success
```

Next backend MVP:

```text
/brief → Supabase invitation_requests → /brief/success
```

## 1. What the first migration creates

File:

```text
supabase/migrations/20260710000000_initial_invitation_requests.sql
```

It creates one table:

```text
public.invitation_requests
```

This table stores client brief submissions from the website.

Main fields:

| Field | Purpose |
|---|---|
| `request_number` | Human-friendly request number like `REQ-...` |
| `template_slug` | Selected template, e.g. `wedding-luxury-01` |
| `template_select` | Exact selected value from current `/brief` form |
| `client_name` | Client name |
| `client_whatsapp` | Client WhatsApp |
| `event_type` | Wedding, nikah, birthday, etc. |
| `event_names` | Main event names |
| `event_date` | Event date |
| `rsvp_needed` | RSVP preference: `yes`, `no`, or `later` |
| `package_preference` | Starter/Standard/Premium/not sure |
| `status` | Owner workflow status |
| `brief_payload` | Full original JSON from frontend |

## 2. Security model

For MVP:

| Role | Permission |
|---|---|
| Public visitor / anon key | Can only insert a new request |
| Public visitor / anon key | Cannot read submitted requests |
| Authenticated owner/admin | Can read and manage requests |

This means the website form can submit a request, but another visitor cannot list client data.

## 3. How to apply locally later

When Supabase CLI is installed and linked:

```bash
supabase db push
```

Or paste the SQL into Supabase Dashboard:

```text
Project → SQL Editor → New query → Run
```

Do not paste secrets into Telegram. Use Supabase Dashboard, local `.env`, or a secure one-time secret input if credentials are needed.

## 4. Frontend env variables

Astro needs only public frontend values. Create this local file:

```text
astro-site/.env
```

Use `astro-site/.env.example` as the template:

```bash
PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
```

These values are used by the browser form on `/brief`.

Important:

- do not commit the real `.env` file;
- do not send keys through Telegram;
- the anon key is not a service-role secret, but it should still be handled carefully.

Never expose:

```text
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL with password
JWT secret
```

## 5. Current code step

The `/brief` submit handler now tries:

```text
1. Insert into Supabase public.invitation_requests
2. Save the same request to localStorage as a browser fallback
3. Redirect to /brief/success/?id=REQ-...
```

If Supabase env variables are missing or insert fails, the client still reaches the success page and the request is preserved locally.

The dependency is installed in `astro-site/package.json`:

```text
@supabase/supabase-js
```

## 6. Admin/owner MVP

The first owner page now exists:

```text
/admin/requests/
```

With GitHub Pages base path:

```text
/invitation-sites/admin/requests/
```

It shows local browser fallback/demo requests and safely tries Supabase read only when env is configured.

Important security detail:

```text
Public anon INSERT is allowed.
Public anon SELECT is intentionally blocked by RLS.
```

So the Astro admin page may not list Supabase rows in production. That is expected until we add a real authenticated admin app.

Read more:

```text
docs/admin-requests.md
```

Safe local verification from `astro-site`:

```bash
npm run verify:supabase-admin
npm run build
npx astro check
```

Browser smoke test:

```bash
npm run preview -- --port 4331
npm run smoke:admin
```