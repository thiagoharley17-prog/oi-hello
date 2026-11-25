import { z } from "zod";
import { articles } from "@/data/articles";

export const MAX_TELEMETRY_BYTES = 512;
export const TELEMETRY_RETENTION_DAYS = 30;
export const HEARTBEAT_INTERVAL_MS = 25_000;
export const HEARTBEAT_DEDUPE_MS = 20_000;
export const ACTIVE_WINDOW_SECONDS = 60;
export const SESSION_IDLE_TIMEOUT_MS = 30 * 60_000;

export const FUNNEL_STAGES = [
  "visit",
  "contact_reached",
  "form_started",
  "whatsapp_attempt",
  "whatsapp_direct_click",
] as const;

export type FunnelStage = (typeof FUNNEL_STAGES)[number];

export const FUNNEL_SOURCES = [
  "page",
  "contact_section",
  "diagnostico",
  "lead_form",
  "footer",
  "contact_link",
  "diagnostico_link",
  "fab",
] as const;

export type FunnelSource = (typeof FUNNEL_SOURCES)[number];

export const STAGE_LABELS: Record<FunnelStage, string> = {
  visit: "Visita ao site",
  contact_reached: "Contato visto / Diagnóstico aberto",
  form_started: "Formulário iniciado",
  whatsapp_attempt: "Formulário válido (WhatsApp aberto/tentativa)",
  whatsapp_direct_click: "Clique direto no WhatsApp",
};

export const STAGE_SHORT_LABELS: Record<FunnelStage, string> = {
  visit: "Visita",
  contact_reached: "Contato / Diagnóstico",
  form_started: "Formulário iniciado",
  whatsapp_attempt: "WhatsApp (formulário)",
  whatsapp_direct_click: "WhatsApp direto",
};

const VALID_ARTICLE_SLUGS = new Set(articles.map((article) => article.slug));

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Strips query parameters and hashes and allows only known public routes.
 * Returns null for /admin or any unknown/malformed path.
 */
export function sanitizePublicPath(rawPath: string): string | null {
  if (!rawPath || typeof rawPath !== "string") return null;
  const withoutQuery = rawPath.split("?")[0]?.split("#")[0]?.trim() ?? "";
  if (!withoutQuery.startsWith("/")) return null;
  const normalized =
    withoutQuery.length > 1 ? withoutQuery.replace(/\/+$/, "") : withoutQuery;
  if (normalized === "/admin" || normalized.startsWith("/admin/")) return null;
  if (normalized === "/" || normalized === "/diagnostico" || normalized === "/blog") {
    return normalized;
  }
  if (normalized.startsWith("/blog/")) {
    const slug = normalized.slice("/blog/".length);
    if (slug.length > 0 && !slug.includes("/") && VALID_ARTICLE_SLUGS.has(slug)) {
      return normalized;
    }
  }
  return null;
}

export const telemetrySignalSchema = z
  .object({
    sessionId: z.string().regex(UUID_V4_REGEX, "ID de sessão inválido"),
    kind: z.enum(["event", "heartbeat"]),
    path: z
      .string()
      .min(1)
      .max(120)
      .transform((value, ctx) => {
        const sanitized = sanitizePublicPath(value);
        if (!sanitized) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Rota pública inválida" });
          return z.NEVER;
        }
        return sanitized;
      }),
    stage: z.enum(FUNNEL_STAGES).optional(),
    source: z.enum(FUNNEL_SOURCES).optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.kind === "event" && !value.stage) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["stage"],
        message: "Etapa obrigatória para eventos",
      });
    }
    if (value.kind === "heartbeat" && value.stage) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["stage"],
        message: "Heartbeat não aceita etapa",
      });
    }
  });

export type TelemetrySignalInput = z.input<typeof telemetrySignalSchema>;