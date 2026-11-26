CREATE POLICY "site_editor_images_verified_admin_select"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'site-editor-images'
  AND (SELECT public.is_authorized_admin_aal2())
);

CREATE POLICY "site_editor_images_public_select_published"
ON storage.objects
FOR SELECT
TO anon
USING (
  bucket_id = 'site-editor-images'
  AND EXISTS (
    SELECT 1
    FROM public.site_content AS content
    WHERE content.id = 'published'
      AND jsonb_path_exists(
        content.document,
        '$.** ? (@ == $image)'::jsonpath,
        jsonb_build_object('image', '/api/site-image/' || storage.objects.name)
      )
  )
);