CREATE TABLE public.site_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(btrim(name)) BETWEEN 1 AND 80),
  document jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX site_presets_created_at_idx ON public.site_presets (created_at DESC);

REVOKE ALL ON public.site_presets FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, DELETE ON public.site_presets TO authenticated;
GRANT ALL ON public.site_presets TO service_role;

ALTER TABLE public.site_presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site_presets_verified_admin_select"
ON public.site_presets
FOR SELECT
TO authenticated
USING ((SELECT public.is_authorized_admin_aal2()));

CREATE POLICY "site_presets_verified_admin_insert"
ON public.site_presets
FOR INSERT
TO authenticated
WITH CHECK ((SELECT public.is_authorized_admin_aal2()));

CREATE POLICY "site_presets_verified_admin_delete"
ON public.site_presets
FOR DELETE
TO authenticated
USING ((SELECT public.is_authorized_admin_aal2()));

CREATE POLICY "site_editor_images_verified_admin_insert"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'site-editor-images'
  AND (SELECT public.is_authorized_admin_aal2())
  AND name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$'
);