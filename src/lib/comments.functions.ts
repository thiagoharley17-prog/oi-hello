import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { checkSpamSignals, commentInputSchema } from "./comments.schema";

export type PublicComment = { id: string; display_name: string; body: string; created_at: string };

export const listApprovedComments = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) =>
    z.object({ slug: z.string().min(1).max(200) }).parse(input),
  )
  .handler(async ({ data }): Promise<{ comments: PublicComment[]; error: string | null }> => {
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
    const client = createClient<Database>(process.env["SUPABASE_URL"]!, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) => {
          const h = new Headers(init?.headers);
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`)
            h.delete("Authorization");
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        },
      },
    });
    const { data: rows, error } = await client
      .from("blog_comments")
      .select("id, display_name, body, created_at")
      .eq("article_slug", data.slug)
      .eq("status", "approved")
      .order("created_at", { ascending: true })
      .limit(200);
    if (error) {
      console.error("listApprovedComments", error);
      return { comments: [], error: "Não foi possível carregar os comentários agora." };
    }
    return { comments: rows ?? [], error: null };
  });

export type SubmitResult = { ok: true } | { ok: false; error: string };

export const submitComment = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => input)
  .handler(async ({ data }): Promise<SubmitResult> => {
    const parsed = commentInputSchema.safeParse(data);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
    }
    const input = parsed.data;
    // Silently accept bot submissions without storing them.
    if (checkSpamSignals(input) !== "ok") return { ok: true };

    const { allowPublicSubmission } = await import("@/lib/public-submission-limit.server");
    let submitterHash: string;
    try {
      const { allowed, fingerprint } = await allowPublicSubmission("comment", getRequest().headers);
      if (!allowed) {
        return {
          ok: false,
          error: "Você enviou vários comentários em pouco tempo. Aguarde alguns minutos.",
        };
      }
      submitterHash = fingerprint;
    } catch {
      return { ok: false, error: "Não foi possível enviar agora. Tente novamente mais tarde." };
    }

    const { readPublishedSiteContent } = await import("@/lib/site-content.server");
    const { articles } = await readPublishedSiteContent();
    if (!articles.some((a) => a.slug === input.slug))
      return { ok: false, error: "Artigo não encontrado." };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("blog_comments").insert({
      article_slug: input.slug,
      display_name: input.displayName,
      body: input.body,
      status: "pending",
      submitter_hash: submitterHash,
    });
    if (error) {
      console.error("submitComment insert", error.code);
      return { ok: false, error: "Não foi possível enviar agora. Tente novamente mais tarde." };
    }
    return { ok: true };
  });
