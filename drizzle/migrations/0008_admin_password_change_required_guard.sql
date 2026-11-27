CREATE OR REPLACE FUNCTION public.clear_admin_password_change_required_on_password_update()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF (OLD.raw_app_meta_data -> 'admin_password_change_required') IS NOT DISTINCT FROM 'true'::jsonb
    AND NEW.encrypted_password IS NOT NULL
    AND pg_catalog.btrim(NEW.encrypted_password) <> ''
    AND NEW.encrypted_password IS DISTINCT FROM OLD.encrypted_password
  THEN
    IF NEW.raw_app_meta_data IS NOT NULL THEN
      NEW.raw_app_meta_data := NEW.raw_app_meta_data - 'admin_password_change_required';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.clear_admin_password_change_required_on_password_update() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.clear_admin_password_change_required_on_password_update() TO supabase_auth_admin;

CREATE TRIGGER clear_admin_password_change_required_on_password_update
  BEFORE UPDATE OF encrypted_password
  ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.clear_admin_password_change_required_on_password_update();

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
      SELECT 1
      FROM public.admin_users au
      WHERE au.user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1
      FROM auth.users u
      WHERE u.id = auth.uid()
        AND (u.raw_app_meta_data -> 'admin_password_change_required') IS DISTINCT FROM 'true'::jsonb
    );
$$;

REVOKE ALL ON FUNCTION public.is_authorized_admin_aal2() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_authorized_admin_aal2() TO authenticated, service_role;