import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SITE_IMAGE_BUCKET, siteImageObject } from "@/lib/site-editor-image";
import type { SiteContent } from "@/lib/site-content";

const previewSeconds = 3600;

export function useSiteImagePreview(path: string) {
  const name = siteImageObject(path);
  const query = useQuery({
    queryKey: ["private-site-image", name],
    enabled: Boolean(name),
    staleTime: 45 * 60_000,
    retry: false,
    queryFn: async () => {
      if (!name) return path;
      const { data, error } = await supabase.storage
        .from(SITE_IMAGE_BUCKET)
        .createSignedUrl(name, previewSeconds);
      if (error) throw error;
      return data.signedUrl;
    },
  });
  return { url: name ? query.data : path, failed: query.isError };
}

function mapImages(content: SiteContent, map: (path: string) => string): SiteContent {
  return {
    ...content,
    brand: { ...content.brand, logo: map(content.brand.logo), favicon: map(content.brand.favicon) },
    hero: { ...content.hero, image: map(content.hero.image) },
    team: content.team.map((member) => ({ ...member, image: map(member.image) })),
    articles: content.articles.map((article) => ({ ...article, image: map(article.image) })),
    sections: content.sections.map((section) =>
      section.kind === "custom"
        ? {
            ...section,
            image: map(section.image),
            cards: section.cards.map((card) => ({ ...card, image: map(card.image) })),
          }
        : section,
    ),
  };
}

export async function resolveSiteImagePreviews(content: SiteContent) {
  const names = new Set<string>();
  mapImages(content, (path) => {
    const name = siteImageObject(path);
    if (name) names.add(name);
    return path;
  });
  if (names.size === 0) return content;
  const { data, error } = await supabase.storage
    .from(SITE_IMAGE_BUCKET)
    .createSignedUrls([...names], previewSeconds);
  if (error || data.some((item) => !item.path || !item.signedUrl))
    throw new Error("PREVIEW_IMAGES_FAILED");
  const urls = new Map(data.map((item) => [item.path, item.signedUrl]));
  return mapImages(content, (path) => urls.get(siteImageObject(path) ?? "") ?? path);
}
