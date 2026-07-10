-- Generated client-site drafts created from invitation requests.
-- Safe MVP model: drafts are managed through protected Owner API only.

create table if not exists public.generated_sites (
  id uuid primary key default gen_random_uuid(),
  request_number text not null references public.invitation_requests(request_number) on delete cascade,
  site_slug text not null unique,

  status text not null default 'draft',
  template_slug text not null default 'custom',
  title text not null,

  -- Full owner-side generated draft. This may include operational notes.
  draft_payload jsonb not null default '{}'::jsonb,

  -- Later: public-safe payload for client links. Kept separate so owner notes are not exposed.
  public_payload jsonb not null default '{}'::jsonb,

  generated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint generated_sites_request_number_unique unique (request_number),
  constraint generated_sites_status_check check (status in ('draft', 'owner_preview', 'client_preview', 'published', 'archived'))
);

create index if not exists generated_sites_request_number_idx on public.generated_sites (request_number);
create index if not exists generated_sites_status_idx on public.generated_sites (status);
create index if not exists generated_sites_updated_at_idx on public.generated_sites (updated_at desc);
create index if not exists generated_sites_template_slug_idx on public.generated_sites (template_slug);

drop trigger if exists set_generated_sites_updated_at on public.generated_sites;
create trigger set_generated_sites_updated_at
before update on public.generated_sites
for each row
execute function public.set_updated_at();

alter table public.generated_sites enable row level security;

-- No anon access: public visitors must not read drafts or owner notes.
-- Owner/admin access for this MVP is via service role inside Supabase Edge Function.
drop policy if exists "Authenticated users can manage generated sites" on public.generated_sites;
create policy "Authenticated users can manage generated sites"
on public.generated_sites
for all
to authenticated
using (true)
with check (true);

comment on table public.generated_sites is 'Generated invitation-site drafts linked to invitation_requests. Managed through protected Owner API.';
comment on column public.generated_sites.draft_payload is 'Owner-side generated draft JSON, including sections and next steps.';
comment on column public.generated_sites.public_payload is 'Future public-safe client payload; keep separate from owner notes.';
