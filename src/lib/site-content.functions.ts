import { createServerFn, createMiddleware } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { extractVerifiedAal } from "@/lib/admin.schema";
import { defaultSiteContent, siteContentSchema, siteDraftSchema } from "@/lib/site-content";

const requireEditor = createMiddleware({ type: "function" })
  .middleware([requireSupabaseAuth])
  .server(async ({ context, next }) => {
    setResponseHeader("Cache-Control", "private, no-store");
    if (extractVerifiedAal(context.claims) !== "aal2") throw new Error("FORBIDDEN_AAL2_REQUIRED");
    const { data, error } = await context.supabase.rpc("is_authorized_admin_aal2");
    if (error || !data) throw new Error("FORBIDDEN_NOT_ADMIN");
    return next();
  });

export const getPublishedSiteContent = createServerFn({ method: "GET" }).handler(async () => {
  const { readPublishedSiteContent } = await import("@/lib/site-content.server");
  return readPublishedSiteContent();
});

export const getEditorContent = createServerFn({ method: "GET" })
  .middleware([requireEditor])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("site_content")
      .select("id,document,revision,updated_at");
    if (error) throw new Error("CONTENT_READ_FAILED");
    const draft = data.find((row) => row.id === "draft");
    const published = data.find((row) => row.id === "published");
    const latest =
      draft && (!published || draft.updated_at >= published.updated_at) ? draft : published;
    return {
      document: latest
        ? (latest.id === "draft" ? siteDraftSchema : siteContentSchema).parse(latest.document)
        : defaultSiteContent,
      draftRevision: draft?.revision ?? null,
      publishedRevision: published?.revision ?? null,
    };
  });

export const writeEditorContent = createServerFn({ method: "POST" })
  .middleware([requireEditor])
  .inputValidator(
    z.discriminatedUnion("slot", [
      z.object({
        slot: z.literal("draft"),
        expectedRevision: z.uuid().nullable(),
        document: siteDraftSchema,
      }),
      z.object({
        slot: z.literal("published"),
        expectedRevision: z.uuid().nullable(),
        document: siteContentSchema,
      }),
    ]),
  )
  .handler(async ({ context, data }) => {
    const revision = crypto.randomUUID();
    const update = { document: data.document, revision, updated_at: new Date().toISOString() };
    const table = context.supabase.from("site_content");
    if (!data.expectedRevision) {
      const { error } = await table.insert({ id: data.slot, ...update });
      if (error?.code === "23505") return { revision: null };
      if (error) throw new Error("CONTENT_WRITE_FAILED");
    } else {
      const { data: row, error } = await table
        .update(update)
        .eq("id", data.slot)
        .eq("revision", data.expectedRevision)
        .select("revision")
        .maybeSingle();
      if (error) throw new Error("CONTENT_WRITE_FAILED");
      if (!row) return { revision: null };
    }
    return { revision };
  });
