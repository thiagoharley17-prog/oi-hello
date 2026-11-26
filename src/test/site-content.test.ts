import { describe, expect, it } from "vitest";
import {
  defaultSiteContent,
  siteContentSchema,
  siteDraftSchema,
  siteTheme,
} from "@/lib/site-content";

describe("site editor", () => {
  it("accepts the current site as the starting document and supports a rearranged home", () => {
    const document = structuredClone(defaultSiteContent);
    document.sections.reverse();
    document.sections.unshift({
      id: "bf3bfc26-5307-451d-a239-cec1a8d84d4a",
      kind: "custom",
      enabled: true,
      title: "Catálogo",
      text: "",
      image: "",
      cards: [
        {
          id: "218955aa-5c62-4a9e-b6bb-13c70f770a5b",
          title: "Guia jurídico",
          text: "Apresentação",
          image: "/images/fachada-hl-bezerra.webp",
          link: "/blog",
        },
      ],
    });
    expect(siteContentSchema.parse(document).sections[0]?.kind).toBe("custom");
  });

  it.each([
    "javascript:alert(1)",
    "//example.com/logo",
    "/\\example.com/logo",
    "data:image/svg+xml,test",
  ])("rejects an unsafe image URL: %s", (url) => {
    const document = structuredClone(defaultSiteContent);
    document.brand.logo = url;
    expect(siteContentSchema.safeParse(document).success).toBe(false);
  });

  it("rejects duplicate sections and duplicate article slugs", () => {
    const document = structuredClone(defaultSiteContent);
    document.sections.push({ id: "home", kind: "home", enabled: true });
    document.articles.push({ ...document.articles[0]! });
    const parsed = siteContentSchema.safeParse(document);
    expect(parsed.success ? [] : parsed.error.issues.map((issue) => issue.path)).toEqual([
      ["sections"],
      ["articles"],
    ]);
  });

  it("saves incomplete drafts but requires complete content to publish", () => {
    const document = structuredClone(defaultSiteContent);
    document.hero.title = "";
    document.hero.image = "";
    expect(siteDraftSchema.safeParse(document).success).toBe(true);
    expect(siteContentSchema.safeParse(document).success).toBe(false);
  });

  it("uses contrasting text colors for selected palette colors", () => {
    expect(
      siteTheme({ ...defaultSiteContent.brand, primary: "#ffffff", background: "#000000" }),
    ).toEqual({
      "--primary": "#ffffff",
      "--primary-foreground": "#000000",
      "--background": "#000000",
      "--foreground": "#ffffff",
    });
  });
});
