import { createFileRoute } from "@tanstack/react-router";
import { SITE_IMAGE_BUCKET, siteImageObject, siteImagePath } from "@/lib/site-editor-image";

function notFoundResponse() {
  return new Response(null, { status: 404, headers: { "Cache-Control": "no-store" } });
}

export const Route = createFileRoute("/api/site-image/$name")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const name = siteImageObject(siteImagePath(params.name));
        if (!name) return notFoundResponse();
        try {
          const { supabase } = await import("@/integrations/supabase/client");
          // Storage RLS allows the anonymous client to read only published images.
          const { data, error } = await supabase.storage.from(SITE_IMAGE_BUCKET).download(name);
          if (error || !data) return notFoundResponse();
          const type = name.endsWith(".jpg")
            ? "image/jpeg"
            : name.endsWith(".png")
              ? "image/png"
              : "image/webp";
          return new Response(data, {
            headers: {
              "Content-Type": type,
              "Cache-Control": "public, max-age=60",
              "Content-Security-Policy": "default-src 'none'; sandbox",
            },
          });
        } catch {
          return notFoundResponse();
        }
      },
    },
  },
});
