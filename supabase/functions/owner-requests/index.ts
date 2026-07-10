import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.110.2';

type InvitationRequestRow = {
  request_number: string;
  created_at: string;
  updated_at: string;
  status: string;
  source: string;
  template_slug: string;
  template_select: string | null;
  template_title: string | null;
  package_preference: string | null;
  client_name: string;
  client_whatsapp: string;
  event_type: string;
  event_names: string;
  event_date: string;
  event_time: string | null;
  venue: string | null;
  invitation_text: string | null;
  language: string | null;
  rsvp_needed: string | null;
  assets_note: string | null;
  urgency: string | null;
  owner_notes: string | null;
  brief_payload: Record<string, unknown> | null;
};

type GeneratedSiteRow = {
  id: string;
  request_number: string;
  site_slug: string;
  status: string;
  template_slug: string;
  title: string;
  draft_payload: Record<string, unknown>;
  public_payload: Record<string, unknown>;
  generated_at: string;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
};

const allowedStatuses = new Set([
  'brief_received',
  'contacted',
  'missing_info',
  'ready_to_build',
  'in_progress',
  'preview_sent',
  'revision_requested',
  'delivered',
  'paid',
  'cancelled',
]);

const publicGeneratedStatuses = new Set(['preview_sent', 'published', 'client_preview']);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-owner-token, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, PATCH, POST, OPTIONS',
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || `site-${Date.now()}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function sanitizeSections(value: unknown): Array<{ title: string; body: string }> {
  if (!Array.isArray(value)) return [];
  return value
    .filter(isRecord)
    .map((section) => ({
      title: asString(section.title, 'Раздел'),
      body: asString(section.body, ''),
    }))
    .filter((section) => section.title || section.body)
    .slice(0, 12);
}

function buildPublicPayload(draft: Record<string, unknown>): Record<string, unknown> {
  return {
    id: asString(draft.id),
    request_id: asString(draft.request_id),
    generated_at: asString(draft.generated_at, new Date().toISOString()),
    template_slug: asString(draft.template_slug, 'custom'),
    package_preference: asString(draft.package_preference, 'not-sure'),
    title: asString(draft.title, 'Invitation preview'),
    names: asString(draft.names, 'Имена'),
    event_type: asString(draft.event_type, 'Событие'),
    event_date: asString(draft.event_date, 'Дата уточняется'),
    event_time: asString(draft.event_time, 'Время уточняется'),
    venue: asString(draft.venue, 'Локация уточняется'),
    language: asString(draft.language, 'ru'),
    invitation_text: asString(draft.invitation_text, 'Будем рады видеть вас на нашем мероприятии.'),
    rsvp_needed: asString(draft.rsvp_needed, 'yes'),
    sections: sanitizeSections(draft.sections),
  };
}

function getServiceClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceRoleKey) {
    return { client: null, error: 'Server Supabase env is not configured' };
  }

  return {
    client: createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    }),
    error: null,
  };
}

function isOwnerAuthorized(request: Request): boolean {
  const expectedToken = Deno.env.get('OWNER_API_TOKEN');
  const providedToken = request.headers.get('x-owner-token') || request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  return Boolean(expectedToken && providedToken && providedToken === expectedToken);
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (!['GET', 'PATCH', 'POST'].includes(request.method)) {
    return jsonResponse({ ok: false, error: 'Method not allowed' }, 405);
  }

  const url = new URL(request.url);
  const { client: supabase, error: clientError } = getServiceClient();
  if (!supabase) {
    return jsonResponse({ ok: false, error: clientError }, 500);
  }

  const publicSiteSlug = url.searchParams.get('public_site')?.trim();
  if (request.method === 'GET' && publicSiteSlug) {
    const { data, error } = await supabase
      .from('generated_sites')
      .select('site_slug,status,template_slug,title,public_payload,generated_at,published_at,updated_at')
      .eq('site_slug', publicSiteSlug)
      .in('status', Array.from(publicGeneratedStatuses))
      .maybeSingle();

    if (error) {
      return jsonResponse({ ok: false, error: error.message }, 500);
    }
    if (!data || !isRecord(data.public_payload) || Object.keys(data.public_payload).length === 0) {
      return jsonResponse({ ok: false, error: 'Public site not found' }, 404);
    }

    return jsonResponse({
      ok: true,
      source: 'public-generated-site',
      generated_site: data,
    });
  }

  if (!isOwnerAuthorized(request)) {
    return jsonResponse({ ok: false, error: 'Unauthorized' }, 401);
  }

  const limitParam = Number(url.searchParams.get('limit') || '50');
  const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 100) : 50;

  if (request.method === 'PATCH') {
    let body: { request_number?: unknown; status?: unknown; owner_notes?: unknown } = {};
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ ok: false, error: 'Invalid JSON body' }, 400);
    }

    const requestNumber = typeof body.request_number === 'string' ? body.request_number.trim() : '';
    const nextStatus = typeof body.status === 'string' ? body.status.trim() : '';
    const ownerNotes = typeof body.owner_notes === 'string' ? body.owner_notes.trim() : undefined;

    if (!requestNumber) {
      return jsonResponse({ ok: false, error: 'request_number is required' }, 400);
    }

    if (!allowedStatuses.has(nextStatus)) {
      return jsonResponse({ ok: false, error: 'Invalid status' }, 400);
    }

    const updatePayload: { status: string; owner_notes?: string } = { status: nextStatus };
    if (ownerNotes !== undefined) updatePayload.owner_notes = ownerNotes;

    const { data, error } = await supabase
      .from('invitation_requests')
      .update(updatePayload)
      .eq('request_number', requestNumber)
      .select('request_number,created_at,updated_at,status,source,template_slug,template_select,template_title,package_preference,client_name,client_whatsapp,event_type,event_names,event_date,event_time,venue,invitation_text,language,rsvp_needed,assets_note,urgency,owner_notes,brief_payload')
      .single();

    if (error) {
      return jsonResponse({ ok: false, error: error.message }, 500);
    }

    return jsonResponse({ ok: true, source: 'edge-function', request: data });
  }

  if (request.method === 'POST') {
    let body: { action?: unknown; request_number?: unknown; draft?: unknown; site_slug?: unknown; status?: unknown } = {};
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ ok: false, error: 'Invalid JSON body' }, 400);
    }

    const action = typeof body.action === 'string' ? body.action.trim() : '';
    const requestNumber = typeof body.request_number === 'string' ? body.request_number.trim() : '';

    if (action === 'upsert_generated_site') {
      const draft = body.draft;
      if (!requestNumber) {
        return jsonResponse({ ok: false, error: 'request_number is required' }, 400);
      }
      if (!isRecord(draft)) {
        return jsonResponse({ ok: false, error: 'draft object is required' }, 400);
      }

      const siteSlug = slugify(String(draft.site_slug || draft.id || `site-${requestNumber}`));
      const templateSlug = typeof draft.template_slug === 'string' ? draft.template_slug : 'custom';
      const title = typeof draft.title === 'string' && draft.title.trim() ? draft.title.trim() : `Preview ${requestNumber}`;

      const { data: generatedSite, error: siteError } = await supabase
        .from('generated_sites')
        .upsert({
          request_number: requestNumber,
          site_slug: siteSlug,
          status: 'owner_preview',
          template_slug: templateSlug,
          title,
          draft_payload: draft,
          public_payload: {},
          generated_at: new Date().toISOString(),
          published_at: null,
        }, { onConflict: 'request_number' })
        .select('id,request_number,site_slug,status,template_slug,title,draft_payload,public_payload,generated_at,published_at,created_at,updated_at')
        .single();

      if (siteError) {
        return jsonResponse({ ok: false, error: siteError.message }, 500);
      }

      await supabase
        .from('invitation_requests')
        .update({ status: 'in_progress' })
        .eq('request_number', requestNumber)
        .in('status', ['brief_received', 'contacted', 'missing_info', 'ready_to_build']);

      return jsonResponse({ ok: true, source: 'edge-function', generated_site: generatedSite });
    }

    if (action === 'publish_generated_site') {
      const identifier = requestNumber || (typeof body.site_slug === 'string' ? body.site_slug.trim() : '');
      const nextStatus = typeof body.status === 'string' && body.status.trim() === 'published' ? 'published' : 'preview_sent';
      if (!identifier) {
        return jsonResponse({ ok: false, error: 'request_number or site_slug is required' }, 400);
      }

      let generatedSite: GeneratedSiteRow | null = null;
      const byRequest = await supabase
        .from('generated_sites')
        .select('id,request_number,site_slug,status,template_slug,title,draft_payload,public_payload,generated_at,published_at,created_at,updated_at')
        .eq('request_number', identifier)
        .maybeSingle();
      if (byRequest.error) return jsonResponse({ ok: false, error: byRequest.error.message }, 500);
      generatedSite = byRequest.data as GeneratedSiteRow | null;

      if (!generatedSite) {
        const bySlug = await supabase
          .from('generated_sites')
          .select('id,request_number,site_slug,status,template_slug,title,draft_payload,public_payload,generated_at,published_at,created_at,updated_at')
          .eq('site_slug', identifier)
          .maybeSingle();
        if (bySlug.error) return jsonResponse({ ok: false, error: bySlug.error.message }, 500);
        generatedSite = bySlug.data as GeneratedSiteRow | null;
      }

      if (!generatedSite) {
        return jsonResponse({ ok: false, error: 'Generated site not found' }, 404);
      }

      const publicPayload = buildPublicPayload(generatedSite.draft_payload || {});
      const publishedAt = nextStatus === 'published' ? new Date().toISOString() : generatedSite.published_at || null;
      const { data: updatedSite, error: updateError } = await supabase
        .from('generated_sites')
        .update({
          status: nextStatus,
          public_payload: publicPayload,
          published_at: publishedAt,
        })
        .eq('id', generatedSite.id)
        .select('id,request_number,site_slug,status,template_slug,title,draft_payload,public_payload,generated_at,published_at,created_at,updated_at')
        .single();

      if (updateError) {
        return jsonResponse({ ok: false, error: updateError.message }, 500);
      }

      await supabase
        .from('invitation_requests')
        .update({ status: nextStatus === 'published' ? 'delivered' : 'preview_sent' })
        .eq('request_number', generatedSite.request_number);

      return jsonResponse({
        ok: true,
        source: 'edge-function',
        generated_site: updatedSite,
        public_site: {
          site_slug: updatedSite.site_slug,
          status: updatedSite.status,
          title: updatedSite.title,
          public_payload: updatedSite.public_payload,
        },
      });
    }

    return jsonResponse({ ok: false, error: 'Invalid action' }, 400);
  }

  const generatedSiteParam = url.searchParams.get('generated_site')?.trim();
  if (generatedSiteParam) {
    let generatedSite: GeneratedSiteRow | null = null;

    const byRequest = await supabase
      .from('generated_sites')
      .select('id,request_number,site_slug,status,template_slug,title,draft_payload,public_payload,generated_at,published_at,created_at,updated_at')
      .eq('request_number', generatedSiteParam)
      .maybeSingle();

    if (byRequest.error) {
      return jsonResponse({ ok: false, error: byRequest.error.message }, 500);
    }
    generatedSite = byRequest.data as GeneratedSiteRow | null;

    if (!generatedSite) {
      const bySlug = await supabase
        .from('generated_sites')
        .select('id,request_number,site_slug,status,template_slug,title,draft_payload,public_payload,generated_at,published_at,created_at,updated_at')
        .eq('site_slug', generatedSiteParam)
        .maybeSingle();
      if (bySlug.error) {
        return jsonResponse({ ok: false, error: bySlug.error.message }, 500);
      }
      generatedSite = bySlug.data as GeneratedSiteRow | null;
    }

    if (!generatedSite) {
      return jsonResponse({ ok: false, error: 'Generated site not found' }, 404);
    }

    return jsonResponse({ ok: true, source: 'edge-function', generated_site: generatedSite });
  }

  const { data, error } = await supabase
    .from('invitation_requests')
    .select('request_number,created_at,updated_at,status,source,template_slug,template_select,template_title,package_preference,client_name,client_whatsapp,event_type,event_names,event_date,event_time,venue,invitation_text,language,rsvp_needed,assets_note,urgency,owner_notes,brief_payload')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    return jsonResponse({ ok: false, error: error.message }, 500);
  }

  const rows = Array.isArray(data) ? (data as InvitationRequestRow[]) : [];
  return jsonResponse({ ok: true, source: 'edge-function', count: rows.length, requests: rows });
});
