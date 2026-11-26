import { z } from "zod";
import { articles } from "@/data/articles";
import { faqs, services, siteMeta } from "@/data/site";
import type { CSSProperties } from "react";

const hex = z
  .string()
  .regex(/^#[a-f\d]{6}$/i)
  .or(z.literal(""));

function isSafeLink(value: string) {
  if (/^\/(?![\/\\])[^\s\\]*$/.test(value)) return true;
  if (!/^https:\/\//i.test(value) || /[\s\\]/.test(value)) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && Boolean(url.hostname) && !url.username && !url.password;
  } catch {
    return false;
  }
}

const link = z
  .string()
  .trim()
  .max(1500)
  .refine(isSafeLink, "Use um endereço HTTPS ou um caminho do site.");
const optionalLink = link.or(z.literal(""));
export const sectionNames = {
  home: "Banner inicial",
  about: "O escritório",
  services: "Áreas de atuação",
  team: "Nossa equipe",
  blog: "Blog",
  faq: "Perguntas frequentes",
  contact: "Contato",
} as const;
const builtInSection = z.enum(
  Object.keys(sectionNames) as [keyof typeof sectionNames, ...(keyof typeof sectionNames)[]],
);
const articleSlug = z
  .string()
  .max(180)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
function contentSchema(draft: boolean) {
  const title = z
    .string()
    .trim()
    .min(draft ? 0 : 1)
    .max(180);
  const paragraph = z
    .string()
    .trim()
    .min(draft ? 0 : 1)
    .max(5000);
  const image = draft ? optionalLink : link;
  const whatsapp = z
    .string()
    .regex(/^\d{10,15}$/, "Informe o DDI, DDD e número, apenas com dígitos.");
  const card = z.object({
    id: z.uuid(),
    title,
    text: paragraph,
    image: optionalLink,
    link: optionalLink,
  });
  const section = z.discriminatedUnion("kind", [
    z.object({ kind: builtInSection, id: builtInSection, enabled: z.boolean() }),
    z.object({
      kind: z.literal("custom"),
      id: z.uuid(),
      enabled: z.boolean(),
      title,
      text: paragraph.or(z.literal("")),
      image: optionalLink,
      cards: z.array(card).max(20),
    }),
  ]);

  return z
    .object({
      version: z.literal(1),
      brand: z.object({
        name: title,
        legalName: title,
        logo: image,
        favicon: image,
        primary: hex,
        accent: hex,
        background: hex,
      }),
      hero: z.object({
        title,
        text: paragraph,
        image,
        imageAlt: title,
        caption: title,
        action: title,
      }),
      about: z.object({
        title,
        paragraphs: z
          .array(paragraph)
          .min(draft ? 0 : 1)
          .max(8),
      }),
      servicesTitle: title,
      servicesIntro: paragraph,
      services: z
        .array(
          z.object({
            title,
            description: paragraph,
            initials: z.enum(["DC", "DF", "DT", "DP", "DCO", "DE", "DPR"]),
            bullets: z.array(title).max(12),
          }),
        )
        .max(24),
      teamTitle: title,
      team: z.array(z.object({ name: title, role: title, image })).max(16),
      faqTitle: title,
      faqs: z.array(z.object({ question: title, answer: paragraph })).max(24),
      contact: z.object({
        title,
        whatsapp: draft ? whatsapp.or(z.literal("")) : whatsapp,
        phone: title,
        instagram: optionalLink,
        addresses: z.array(z.object({ city: title, address: paragraph })).max(10),
      }),
      blogTitle: title,
      articles: z
        .array(
          z.object({
            slug: draft ? articleSlug.or(z.literal("")) : articleSlug,
            title,
            topic: title,
            summary: paragraph,
            image,
            question: title.or(z.literal("")),
            sections: z
              .array(z.object({ title, text: paragraph }))
              .min(draft ? 0 : 1)
              .max(20),
          }),
        )
        .max(60),
      sections: z.array(section).max(27),
    })
    .superRefine((value, ctx) => {
      const ids = value.sections.map((item) => item.id);
      if (
        new Set(ids).size !== ids.length ||
        value.sections.some((item) => item.kind !== "custom" && item.id !== item.kind) ||
        Object.keys(sectionNames).some((id) => !ids.includes(id as (typeof ids)[number]))
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["sections"],
          message: "Cada seção original deve aparecer uma vez.",
        });
      }
      const slugs = value.articles.map((item) => item.slug).filter(Boolean);
      if (new Set(slugs).size !== slugs.length) {
        ctx.addIssue({
          code: "custom",
          path: ["articles"],
          message: "Cada artigo precisa de um endereço diferente.",
        });
      }
      if (new TextEncoder().encode(JSON.stringify(value)).byteLength > 250_000) {
        ctx.addIssue({ code: "custom", message: "O conteúdo ultrapassa o limite de 250 KB." });
      }
    });
}

export const siteContentSchema = contentSchema(false);
export const siteDraftSchema = contentSchema(true);

export type SiteContent = z.infer<typeof siteContentSchema>;
export const defaultSiteContent: SiteContent = {
  version: 1,
  brand: {
    name: siteMeta.brand,
    legalName: siteMeta.legalName,
    logo: "/images/hl-bezerra-logo.png",
    favicon: "/images/hl-bezerra-icon.png",
    primary: "",
    accent: "",
    background: "",
  },
  hero: {
    title: "Proteção dos direitos para pessoas e empresas",
    text: "Defendemos seus direitos com compromisso e excelência. Oferecemos orientação jurídica clara para as suas decisões.",
    image: "/images/fachada-hl-bezerra.webp",
    imageAlt: "Fachada da HL & Bezerra",
    caption: "Fachada do escritório",
    action: "Fale com o escritório",
  },
  about: {
    title: siteMeta.brand,
    paragraphs: [
      "Prestamos consultoria jurídica e representamos pessoas e empresas em questões que vão de contratos e relações de trabalho a demandas familiares e previdenciárias.",
      "Na primeira conversa, ouvimos sua situação e indicamos quais documentos podem ajudar a avaliar o caso. A partir daí, explicamos as opções e os próximos passos.",
    ],
  },
  servicesTitle: "Áreas de atuação",
  servicesIntro:
    "Conheça os assuntos em que o escritório pode orientar e representar você ou sua empresa.",
  services,
  teamTitle: "Nossa equipe",
  team: [
    {
      name: "Dr. Hausner Leandro",
      role: "Advogado",
      image: "/images/hausner-leandro-escritorio.webp",
    },
    { name: "Dra. Rebeca Bezerra", role: "Advogada", image: "/images/rebeca-bezerra.webp" },
  ],
  faqTitle: "Perguntas frequentes",
  faqs,
  contact: {
    title: "Fale com o escritório",
    whatsapp: "5511916669696",
    phone: siteMeta.phone,
    instagram: siteMeta.instagram,
    addresses: [
      { city: "São Paulo, SP", address: "Rua Emílio Colella, 52, sala 02, Parque São Domingos" },
      { city: "Cajamar, SP", address: "Rua Avelino Toleto de Lima, 258, casa 02" },
    ],
  },
  blogTitle: "Blog",
  articles,
  sections: Object.keys(sectionNames).map((kind) => ({
    id: kind as keyof typeof sectionNames,
    kind: kind as keyof typeof sectionNames,
    enabled: true,
  })),
};

export function siteTheme(brand: SiteContent["brand"]): CSSProperties {
  const styles: Record<string, string> = {};
  for (const [field, token] of [
    ["primary", "primary"],
    ["accent", "gold"],
    ["background", "background"],
  ] as const) {
    const color = brand[field];
    if (!color) continue;
    styles[`--${token}`] = color;
    const luminance = [0.2126, 0.7152, 0.0722].reduce((sum, weight, index) => {
      const offset = 1 + index * 2;
      const channel = parseInt(color.slice(offset, offset + 2), 16) / 255;
      return (
        sum + weight * (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4)
      );
    }, 0);
    styles[`--${token === "background" ? "" : `${token}-`}foreground`] =
      luminance > 0.179 ? "#000000" : "#ffffff";
  }
  return styles as CSSProperties;
}
