import { defaultSiteContent, siteContentSchema } from "@/lib/site-content";

export async function readPublishedSiteContent() {
  try {
    const { supabase } = await import("@/integrations/supabase/client");
    const { data, error } = await supabase
      .from("site_content")
      .select("document")
      .eq("id", "published")
      .abortSignal(AbortSignal.timeout(2500))
      .maybeSingle();
    if (error) console.error("[site-content] public read failed:", error.code);
    if (data) {
      const parsed = siteContentSchema.safeParse(data.document);
      if (parsed.success) return parsed.data;
    }
  } catch {
    console.error("[site-content] public read unavailable");
  }
  return defaultSiteContent;
}
