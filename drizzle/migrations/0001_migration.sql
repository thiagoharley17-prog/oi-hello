REVOKE ALL ON public.blog_comments FROM anon, authenticated;
GRANT SELECT (id, article_slug, display_name, body, status, created_at) ON public.blog_comments TO anon, authenticated;