CREATE TABLE public.site_content (
  id text PRIMARY KEY CHECK (id IN ('draft', 'published')),
  document jsonb NOT NULL,
  revision uuid NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

REVOKE ALL ON public.site_content FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.site_content TO anon;
GRANT SELECT, INSERT, UPDATE ON public.site_content TO authenticated;
GRANT ALL ON public.site_content TO service_role;

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site_content_public_select_published"
ON public.site_content
FOR SELECT
TO anon
USING (id = 'published');

CREATE POLICY "site_content_verified_admin_select"
ON public.site_content
FOR SELECT
TO authenticated
USING ((SELECT public.is_authorized_admin_aal2()));

CREATE POLICY "site_content_verified_admin_insert"
ON public.site_content
FOR INSERT
TO authenticated
WITH CHECK ((SELECT public.is_authorized_admin_aal2()));

CREATE POLICY "site_content_verified_admin_update"
ON public.site_content
FOR UPDATE
TO authenticated
USING ((SELECT public.is_authorized_admin_aal2()))
WITH CHECK ((SELECT public.is_authorized_admin_aal2()));