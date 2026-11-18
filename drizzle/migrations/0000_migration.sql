CREATE TABLE public.blog_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_slug text NOT NULL CHECK (char_length(article_slug) BETWEEN 1 AND 200),
  display_name text NOT NULL CHECK (char_length(display_name) BETWEEN 2 AND 60),
  body text NOT NULL CHECK (char_length(body) BETWEEN 10 AND 1500),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  submitter_hash text,
  created_at timestamptz NOT NULL DEFAULT now(),
  moderated_at timestamptz
);
CREATE INDEX blog_comments_slug_status_idx ON public.blog_comments (article_slug, status, created_at);
CREATE INDEX blog_comments_submitter_idx ON public.blog_comments (submitter_hash, created_at);

-- Public may read only safe columns, and only approved rows (policy below). No public writes.
GRANT SELECT (id, article_slug, display_name, body, status, created_at) ON public.blog_comments TO anon, authenticated;
GRANT ALL ON public.blog_comments TO service_role;

ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved comments are public"
ON public.blog_comments FOR SELECT TO anon, authenticated
USING (status = 'approved');

CREATE OR REPLACE FUNCTION public.blog_comments_set_moderated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    NEW.moderated_at := now();
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER blog_comments_moderated_at
BEFORE UPDATE ON public.blog_comments
FOR EACH ROW EXECUTE FUNCTION public.blog_comments_set_moderated_at();