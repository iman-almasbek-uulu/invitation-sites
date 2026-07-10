# `/brief` JSON shape for Supabase

The `/brief` page should send a payload compatible with `public.invitation_requests`.

## Insert payload

```json
{
  "template_slug": "wedding-luxury-01",
  "template_select": "wedding-luxury-01",
  "template_title": "Wedding Luxury 01",
  "package_level": "premium",
  "package_preference": "premium",
  "client_name": "Test Client",
  "client_whatsapp": "+996000000000",
  "client_instagram": "",
  "preferred_contact": "whatsapp",
  "event_type": "wedding",
  "event_names": "A & B",
  "event_date": "2026-08-20",
  "event_time": "18:00",
  "venue": "Restaurant Name, Address",
  "venue_name": "Restaurant Name",
  "venue_address": "Address",
  "map_url": "https://2gis...",
  "invitation_text": "Invitation text or client wishes",
  "language": "ru",
  "rsvp_needed": "yes",
  "music_needed": false,
  "gallery_needed": false,
  "assets_note": "Photos/music/materials note",
  "urgency": "normal",
  "budget_range": "",
  "style_notes": "",
  "client_notes": "",
  "source": "astro-brief",
  "brief_payload": {
    "request_id": "REQ-...",
    "submit_backend": "supabase"
  }
}
```

## Required minimum

The backend table requires:

```text
template_slug
template_select
client_name
client_whatsapp
event_type
event_names
event_date
```

## Success response needed by frontend

After insert, frontend should use:

```text
request_number
```

Then redirect:

```text
/brief/success/?id=REQ-...
```

## Current MVP fallback

Until Supabase is connected, the same logical object is stored in browser `localStorage`.
