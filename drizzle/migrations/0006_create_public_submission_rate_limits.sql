CREATE TABLE public.public_submission_limits (
  scope text NOT NULL,
  fingerprint text NOT NULL,
  window_start timestamptz NOT NULL,
  hits integer NOT NULL,
  PRIMARY KEY (scope, fingerprint, window_start)
);

REVOKE ALL ON TABLE public.public_submission_limits FROM PUBLIC;
REVOKE ALL ON TABLE public.public_submission_limits FROM anon, authenticated;
GRANT ALL ON TABLE public.public_submission_limits TO service_role;

ALTER TABLE public.public_submission_limits ENABLE ROW LEVEL SECURITY;

CREATE INDEX public_submission_limits_window_start_idx
  ON public.public_submission_limits (window_start);

CREATE OR REPLACE FUNCTION public.allow_public_submission(
  p_scope text,
  p_fingerprint text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_limit pg_catalog.int4;
  v_window_start pg_catalog.timestamptz;
  v_hits pg_catalog.int4;
BEGIN
  IF p_scope IS NULL OR p_scope NOT IN ('lead', 'comment', 'telemetry') THEN
    RETURN false;
  END IF;

  IF p_fingerprint IS NULL OR p_fingerprint !~ '^[0-9a-f]{64}$' THEN
    RETURN false;
  END IF;

  v_limit := CASE p_scope
    WHEN 'lead' THEN 8
    WHEN 'comment' THEN 6
    WHEN 'telemetry' THEN 500
  END;

  v_window_start := pg_catalog.date_bin(
    pg_catalog.interval '10 minutes',
    pg_catalog.now(),
    pg_catalog.timestamptz '2000-01-01 00:00:00+00'
  );

  IF pg_catalog.random() < 0.01 THEN
    DELETE FROM public.public_submission_limits
    WHERE window_start < pg_catalog.now() - pg_catalog.interval '24 hours';
  END IF;

  INSERT INTO public.public_submission_limits AS counters (
    scope,
    fingerprint,
    window_start,
    hits
  )
  VALUES (
    p_scope,
    p_fingerprint,
    v_window_start,
    1
  )
  ON CONFLICT (scope, fingerprint, window_start)
  DO UPDATE SET hits = counters.hits + 1
  WHERE counters.hits < v_limit
  RETURNING counters.hits INTO v_hits;

  RETURN v_hits IS NOT NULL;
END;
$function$;

REVOKE ALL ON FUNCTION public.allow_public_submission(text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.allow_public_submission(text, text) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.allow_public_submission(text, text) TO service_role;