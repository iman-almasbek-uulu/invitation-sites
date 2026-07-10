-- Initial Supabase schema for website brief submissions.
-- Safe MVP model: public visitors may INSERT a brief request, but cannot SELECT client data.

create extension if not exists pgcrypto;

create table if not exists public.invitation_requests (
  id uuid primary key default gen_random_uuid(),
  request_number text not null unique default ('REQ-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))),

  -- Template / package selection
  template_slug text not null default 'custom',
  template_select text not null default 'custom',
  template_title text,
  package_level text,
  package_preference text,

  -- Client contact
  client_name text not null,
  client_whatsapp text not null,
  client_instagram text,
  preferred_contact text not null default 'whatsapp',

  -- Event data
  event_type text not null,
  event_names text not null,
  event_date date not null,
  event_time text,
  venue text,
  venue_name text,
  venue_address text,
  map_url text,
  invitation_text text,
  language text not null default 'ru',

  -- Options / requirements
  rsvp_needed text not null default 'yes',
  music_needed boolean not null default false,
  gallery_needed boolean not null default false,
  assets_note text,
  urgency text not null default 'normal',
  budget_range text,
  style_notes text,
  client_notes text,

  -- Business workflow
  status text not null default 'brief_received',
  source text not null default 'website',
  owner_notes text,

  -- Keep original frontend payload for future mapping into customers/orders/events tables
  brief_payload jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists invitation_requests_status_idx on public.invitation_requests (status);
create index if not exists invitation_requests_created_at_idx on public.invitation_requests (created_at desc);
create index if not exists invitation_requests_template_slug_idx on public.invitation_requests (template_slug);
create index if not exists invitation_requests_event_date_idx on public.invitation_requests (event_date);
create index if not exists invitation_requests_client_whatsapp_idx on public.invitation_requests (client_whatsapp);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_invitation_requests_updated_at on public.invitation_requests;
create trigger set_invitation_requests_updated_at
before update on public.invitation_requests
for each row
execute function public.set_updated_at();

alter table public.invitation_requests enable row level security;

-- Public website form can create requests with the anon key.
-- It cannot read/update/delete any submitted client data.
drop policy if exists "Public can create invitation requests" on public.invitation_requests;
create policy "Public can create invitation requests"
on public.invitation_requests
for insert
to anon
with check (true);

-- Owner/admin access for the first MVP can use Supabase Dashboard or service role.
-- When Supabase Auth admin profiles are connected, replace this broad authenticated policy
-- with owner/admin role checks against public.admin_profiles.
drop policy if exists "Authenticated users can manage invitation requests" on public.invitation_requests;
create policy "Authenticated users can manage invitation requests"
on public.invitation_requests
for all
to authenticated
using (true)
with check (true);

comment on table public.invitation_requests is 'Website brief submissions from /brief. Public insert only; owner/admin reads in dashboard/admin app.';
comment on column public.invitation_requests.brief_payload is 'Original frontend JSON payload, kept to avoid losing fields before the full normalized order model is connected.';
