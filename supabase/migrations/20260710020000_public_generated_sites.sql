-- Public-safe generated invitation links.
-- Keep raw drafts private; only public_payload is returned by the Edge Function public read path.

alter table public.generated_sites
  add column if not exists published_at timestamptz;

alter table public.generated_sites
  drop constraint if exists generated_sites_status_check;

alter table public.generated_sites
  add constraint generated_sites_status_check
  check (status in ('draft', 'owner_preview', 'preview_sent', 'client_preview', 'published', 'archived'));

comment on column public.generated_sites.public_payload is 'Public-safe invitation payload returned by the public Edge Function route. Must not include phone, owner notes, raw request metadata, or service data.';
comment on column public.generated_sites.published_at is 'Timestamp set when a generated site is finally published. Preview links may be preview_sent without published_at.';
