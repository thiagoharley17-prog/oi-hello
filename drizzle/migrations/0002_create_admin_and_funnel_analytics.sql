CREATE TABLE public.admin_users (
  user_id uuid PRIMARY KEY,
  label text CHECK (label IS NULL OR char_length(label) <= 120),
  created_at timestamptz NOT NULL DEFAULT now()
);

REVOKE ALL ON public.admin_users FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.admin_users TO authenticated;
GRANT ALL ON public.admin_users TO service_role;

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can check own admin authorization"
ON public.admin_users
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.is_authorized_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()
    );
$$;

REVOKE ALL ON FUNCTION public.is_authorized_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_authorized_admin() TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.is_authorized_admin_aal2()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT auth.uid() IS NOT NULL
    AND coalesce(auth.jwt() ->> 'aal', '') = 'aal2'
    AND EXISTS (
      SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()
    );
$$;

REVOKE ALL ON FUNCTION public.is_authorized_admin_aal2() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_authorized_admin_aal2() TO authenticated, service_role;

CREATE TABLE public.funnel_sessions (
  session_id uuid PRIMARY KEY,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  last_heartbeat_at timestamptz,
  first_path text NOT NULL CHECK (char_length(first_path) BETWEEN 1 AND 120),
  last_path text NOT NULL CHECK (char_length(last_path) BETWEEN 1 AND 120),
  reached_visit_at timestamptz,
  reached_contact_at timestamptz,
  reached_form_started_at timestamptz,
  reached_whatsapp_attempt_at timestamptz,
  reached_whatsapp_direct_at timestamptz,
  last_stage text NOT NULL DEFAULT 'visit' CHECK (
    last_stage IN ('visit', 'contact_reached', 'form_started', 'whatsapp_attempt', 'whatsapp_direct_click')
  )
);

CREATE INDEX funnel_sessions_last_seen_idx ON public.funnel_sessions (last_seen_at DESC);
CREATE INDEX funnel_sessions_heartbeat_idx ON public.funnel_sessions (last_heartbeat_at DESC)
  WHERE last_heartbeat_at IS NOT NULL;
CREATE INDEX funnel_sessions_last_stage_idx ON public.funnel_sessions (last_stage, last_seen_at DESC);

REVOKE ALL ON public.funnel_sessions FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.funnel_sessions TO authenticated;
GRANT ALL ON public.funnel_sessions TO service_role;

ALTER TABLE public.funnel_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only authorized AAL2 admins can read funnel sessions"
ON public.funnel_sessions
FOR SELECT
TO authenticated
USING (public.is_authorized_admin_aal2());

CREATE TABLE public.funnel_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.funnel_sessions(session_id) ON DELETE CASCADE,
  stage text NOT NULL CHECK (
    stage IN ('visit', 'contact_reached', 'form_started', 'whatsapp_attempt', 'whatsapp_direct_click')
  ),
  path text NOT NULL CHECK (char_length(path) BETWEEN 1 AND 120),
  source text CHECK (
    source IS NULL OR source IN (
      'page', 'contact_section', 'diagnostico', 'lead_form', 'footer', 'contact_link', 'diagnostico_link', 'fab'
    )
  ),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (session_id, stage)
);

CREATE INDEX funnel_events_created_idx ON public.funnel_events (created_at DESC);

REVOKE ALL ON public.funnel_events FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.funnel_events TO authenticated;
GRANT ALL ON public.funnel_events TO service_role;

ALTER TABLE public.funnel_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only authorized AAL2 admins can read funnel events"
ON public.funnel_events
FOR SELECT
TO authenticated
USING (public.is_authorized_admin_aal2());

CREATE OR REPLACE FUNCTION public.funnel_stage_rank(p_stage text)
RETURNS integer
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE p_stage
    WHEN 'visit' THEN 1
    WHEN 'contact_reached' THEN 2
    WHEN 'form_started' THEN 3
    WHEN 'whatsapp_direct_click' THEN 4
    WHEN 'whatsapp_attempt' THEN 5
    ELSE 0
  END;
$$;

REVOKE ALL ON FUNCTION public.funnel_stage_rank(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.funnel_stage_rank(text) TO service_role;

CREATE OR REPLACE FUNCTION public.ingest_funnel_signal(
  p_session_id uuid,
  p_kind text,
  p_path text,
  p_stage text DEFAULT NULL,
  p_source text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_now timestamptz := now();
  v_effective_stage text;
BEGIN
  IF p_kind NOT IN ('event', 'heartbeat') THEN
    RAISE EXCEPTION 'invalid_kind';
  END IF;

  IF p_path IS NULL OR char_length(p_path) NOT BETWEEN 1 AND 120 OR p_path LIKE '/admin%' THEN
    RAISE EXCEPTION 'invalid_path';
  END IF;

  IF p_kind = 'heartbeat' THEN
    INSERT INTO public.funnel_sessions (
      session_id,
      first_seen_at,
      last_seen_at,
      last_heartbeat_at,
      first_path,
      last_path,
      reached_visit_at,
      last_stage
    )
    VALUES (
      p_session_id,
      v_now,
      v_now,
      v_now,
      p_path,
      p_path,
      v_now,
      'visit'
    )
    ON CONFLICT (session_id) DO UPDATE
    SET
      last_seen_at = v_now,
      last_heartbeat_at = v_now,
      last_path = EXCLUDED.last_path,
      reached_visit_at = COALESCE(public.funnel_sessions.reached_visit_at, v_now);

    INSERT INTO public.funnel_events (session_id, stage, path, source)
    VALUES (p_session_id, 'visit', p_path, 'page')
    ON CONFLICT (session_id, stage) DO NOTHING;
    RETURN;
  END IF;

  v_effective_stage := p_stage;
  IF v_effective_stage NOT IN ('visit', 'contact_reached', 'form_started', 'whatsapp_attempt', 'whatsapp_direct_click') THEN
    RAISE EXCEPTION 'invalid_stage';
  END IF;

  INSERT INTO public.funnel_sessions (
    session_id,
    first_seen_at,
    last_seen_at,
    last_heartbeat_at,
    first_path,
    last_path,
    reached_visit_at,
    reached_contact_at,
    reached_form_started_at,
    reached_whatsapp_attempt_at,
    reached_whatsapp_direct_at,
    last_stage
  )
  VALUES (
    p_session_id,
    v_now,
    v_now,
    v_now,
    p_path,
    p_path,
    v_now,
    CASE WHEN v_effective_stage = 'contact_reached' THEN v_now ELSE NULL END,
    CASE WHEN v_effective_stage = 'form_started' THEN v_now ELSE NULL END,
    CASE WHEN v_effective_stage = 'whatsapp_attempt' THEN v_now ELSE NULL END,
    CASE WHEN v_effective_stage = 'whatsapp_direct_click' THEN v_now ELSE NULL END,
    v_effective_stage
  )
  ON CONFLICT (session_id) DO UPDATE
  SET
    last_seen_at = v_now,
    last_heartbeat_at = v_now,
    last_path = EXCLUDED.last_path,
    reached_visit_at = COALESCE(public.funnel_sessions.reached_visit_at, v_now),
    reached_contact_at = CASE
      WHEN v_effective_stage = 'contact_reached'
        THEN COALESCE(public.funnel_sessions.reached_contact_at, v_now)
      ELSE public.funnel_sessions.reached_contact_at
    END,
    reached_form_started_at = CASE
      WHEN v_effective_stage = 'form_started'
        THEN COALESCE(public.funnel_sessions.reached_form_started_at, v_now)
      ELSE public.funnel_sessions.reached_form_started_at
    END,
    reached_whatsapp_attempt_at = CASE
      WHEN v_effective_stage = 'whatsapp_attempt'
        THEN COALESCE(public.funnel_sessions.reached_whatsapp_attempt_at, v_now)
      ELSE public.funnel_sessions.reached_whatsapp_attempt_at
    END,
    reached_whatsapp_direct_at = CASE
      WHEN v_effective_stage = 'whatsapp_direct_click'
        THEN COALESCE(public.funnel_sessions.reached_whatsapp_direct_at, v_now)
      ELSE public.funnel_sessions.reached_whatsapp_direct_at
    END,
    last_stage = CASE
      WHEN public.funnel_stage_rank(v_effective_stage) >= public.funnel_stage_rank(public.funnel_sessions.last_stage)
        THEN v_effective_stage
      ELSE public.funnel_sessions.last_stage
    END;

  INSERT INTO public.funnel_events (session_id, stage, path, source)
  VALUES (p_session_id, 'visit', p_path, 'page')
  ON CONFLICT (session_id, stage) DO NOTHING;

  IF v_effective_stage <> 'visit' THEN
    INSERT INTO public.funnel_events (session_id, stage, path, source)
    VALUES (p_session_id, v_effective_stage, p_path, p_source)
    ON CONFLICT (session_id, stage) DO NOTHING;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.ingest_funnel_signal(uuid, text, text, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.ingest_funnel_signal(uuid, text, text, text, text) TO service_role;

CREATE OR REPLACE FUNCTION public.prune_old_funnel_sessions(p_retention_days integer DEFAULT 30)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted integer;
BEGIN
  DELETE FROM public.funnel_sessions
  WHERE last_seen_at < now() - make_interval(days => greatest(1, least(p_retention_days, 90)));
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

REVOKE ALL ON FUNCTION public.prune_old_funnel_sessions(integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.prune_old_funnel_sessions(integer) TO service_role;

CREATE OR REPLACE FUNCTION public.get_admin_funnel_summary(p_period text DEFAULT '7d')
RETURNS TABLE (
  online_now bigint,
  total_sessions bigint,
  active_sessions bigint,
  inactive_sessions bigint,
  stage_visit bigint,
  stage_contact bigint,
  stage_form_started bigint,
  stage_whatsapp_attempt bigint,
  stage_whatsapp_direct bigint,
  period_start timestamptz,
  generated_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_now timestamptz := now();
  v_local_day timestamp := date_trunc('day', v_now AT TIME ZONE 'America/Sao_Paulo');
  v_start timestamptz;
  v_active_cutoff timestamptz := v_now - interval '60 seconds';
BEGIN
  IF NOT public.is_authorized_admin_aal2() THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  v_start := CASE p_period
    WHEN 'today' THEN v_local_day AT TIME ZONE 'America/Sao_Paulo'
    WHEN '7d' THEN (v_local_day - interval '6 days') AT TIME ZONE 'America/Sao_Paulo'
    WHEN '30d' THEN (v_local_day - interval '29 days') AT TIME ZONE 'America/Sao_Paulo'
    ELSE NULL
  END;

  IF v_start IS NULL THEN
    RAISE EXCEPTION 'invalid_period' USING ERRCODE = '22023';
  END IF;

  RETURN QUERY
  SELECT
    (SELECT count(*) FROM public.funnel_sessions fs_live WHERE fs_live.last_heartbeat_at >= v_active_cutoff) AS online_now,
    count(*) AS total_sessions,
    count(*) FILTER (WHERE fs.last_heartbeat_at >= v_active_cutoff) AS active_sessions,
    count(*) FILTER (WHERE fs.last_heartbeat_at IS NULL OR fs.last_heartbeat_at < v_active_cutoff) AS inactive_sessions,
    count(*) FILTER (WHERE fs.reached_visit_at IS NOT NULL) AS stage_visit,
    count(*) FILTER (WHERE fs.reached_contact_at IS NOT NULL) AS stage_contact,
    count(*) FILTER (WHERE fs.reached_form_started_at IS NOT NULL) AS stage_form_started,
    count(*) FILTER (WHERE fs.reached_whatsapp_attempt_at IS NOT NULL) AS stage_whatsapp_attempt,
    count(*) FILTER (WHERE fs.reached_whatsapp_direct_at IS NOT NULL) AS stage_whatsapp_direct,
    v_start AS period_start,
    v_now AS generated_at
  FROM public.funnel_sessions fs
  WHERE fs.last_seen_at >= v_start;
END;
$$;

REVOKE ALL ON FUNCTION public.get_admin_funnel_summary(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_admin_funnel_summary(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_admin_funnel_sessions(
  p_period text DEFAULT '7d',
  p_page integer DEFAULT 1,
  p_page_size integer DEFAULT 20,
  p_status text DEFAULT 'all',
  p_stage text DEFAULT 'all'
)
RETURNS TABLE (
  session_id uuid,
  first_seen_at timestamptz,
  last_seen_at timestamptz,
  last_heartbeat_at timestamptz,
  is_active boolean,
  first_path text,
  last_path text,
  last_stage text,
  reached_visit_at timestamptz,
  reached_contact_at timestamptz,
  reached_form_started_at timestamptz,
  reached_whatsapp_attempt_at timestamptz,
  reached_whatsapp_direct_at timestamptz,
  total_count bigint
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  v_now timestamptz := now();
  v_local_day timestamp := date_trunc('day', v_now AT TIME ZONE 'America/Sao_Paulo');
  v_start timestamptz;
  v_active_cutoff timestamptz := v_now - interval '60 seconds';
  v_page integer := greatest(1, coalesce(p_page, 1));
  v_size integer := greatest(1, least(coalesce(p_page_size, 20), 50));
BEGIN
  IF NOT public.is_authorized_admin_aal2() THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  v_start := CASE p_period
    WHEN 'today' THEN v_local_day AT TIME ZONE 'America/Sao_Paulo'
    WHEN '7d' THEN (v_local_day - interval '6 days') AT TIME ZONE 'America/Sao_Paulo'
    WHEN '30d' THEN (v_local_day - interval '29 days') AT TIME ZONE 'America/Sao_Paulo'
    ELSE NULL
  END;

  IF v_start IS NULL THEN
    RAISE EXCEPTION 'invalid_period' USING ERRCODE = '22023';
  END IF;

  IF p_status NOT IN ('all', 'active', 'inactive') THEN
    RAISE EXCEPTION 'invalid_status' USING ERRCODE = '22023';
  END IF;

  IF p_stage NOT IN ('all', 'visit', 'contact_reached', 'form_started', 'whatsapp_attempt', 'whatsapp_direct_click') THEN
    RAISE EXCEPTION 'invalid_stage' USING ERRCODE = '22023';
  END IF;

  RETURN QUERY
  SELECT
    fs.session_id,
    fs.first_seen_at,
    fs.last_seen_at,
    fs.last_heartbeat_at,
    (fs.last_heartbeat_at IS NOT NULL AND fs.last_heartbeat_at >= v_active_cutoff) AS is_active,
    fs.first_path,
    fs.last_path,
    fs.last_stage,
    fs.reached_visit_at,
    fs.reached_contact_at,
    fs.reached_form_started_at,
    fs.reached_whatsapp_attempt_at,
    fs.reached_whatsapp_direct_at,
    count(*) OVER () AS total_count
  FROM public.funnel_sessions fs
  WHERE fs.last_seen_at >= v_start
    AND (
      p_status = 'all'
      OR (p_status = 'active' AND fs.last_heartbeat_at IS NOT NULL AND fs.last_heartbeat_at >= v_active_cutoff)
      OR (p_status = 'inactive' AND (fs.last_heartbeat_at IS NULL OR fs.last_heartbeat_at < v_active_cutoff))
    )
    AND (p_stage = 'all' OR fs.last_stage = p_stage)
  ORDER BY fs.last_seen_at DESC
  LIMIT v_size
  OFFSET (v_page - 1) * v_size;
END;
$$;

REVOKE ALL ON FUNCTION public.get_admin_funnel_sessions(text, integer, integer, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_admin_funnel_sessions(text, integer, integer, text, text) TO authenticated;