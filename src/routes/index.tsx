import { createFileRoute } from "@tanstack/react-router";
import { defaultSiteContent } from "@/lib/site-content";
import { HomePage } from "@/components/sections/home-page";

export const Route = createFileRoute("/")({
  component: HomePage,
  head: ({ match }) => ({
    meta: [
      {
        title: `${match.context.siteContent?.brand.legalName ?? defaultSiteContent.brand.legalName} | Escritório de Advocacia`,
      },
      {
        property: "og:title",
        content: `${match.context.siteContent?.brand.legalName ?? defaultSiteContent.brand.legalName} | Escritório de Advocacia`,
      },
    ],
  }),
});
