# owner-requests

Protected Supabase Edge Function for the owner/admin requests page.

Required header:

```text
x-owner-token: <OWNER_API_TOKEN>
```

Required secrets:

```text
OWNER_API_TOKEN
SUPABASE_SERVICE_ROLE_KEY
```

Returns newest rows from `public.invitation_requests` using service role on the server only.
