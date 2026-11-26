import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { RATE_LIMIT, checkSpamSignals, commentInputSchema } from "./comments.schema";

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

async function hashSubmitter(ip: string, ua: string) {
  const salt = process.env["SUPABASE_URL"] ?? "blog";
  const bytes = new TextEncoder().encode(`${salt}|${ip}|${ua}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

export type SubmitResult = { ok: true } | { ok: false; error: string };

export const submitComment = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => input)
  .handler(async ({ data }): Promise<SubmitResult> => {
    const parsed = commentInputSchema.safeParse(data);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
    }
    const input = parsed.data;
    const { readPublishedSiteContent } = await import("@/lib/site-content.server");
    const { articles } = await readPublishedSiteContent();
    if (!articles.some((a) => a.slug === input.slug))
      return { ok: false, error: "Artigo não encontrado." };

    // Silently accept bot submissions without storing them.
    if (checkSpamSignals(input) !== "ok") return { ok: true };

    const ip =
      getRequestHeader("cf-connecting-ip") ??
      getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";
    const submitterHash = await hashSubmitter(ip, getRequestHeader("user-agent") ?? "");

    // Unauthenticated writes go through the server only; public roles have no insert grant.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const since = new Date(Date.now() - RATE_LIMIT.windowMinutes * 60_000).toISOString();
    const { count, error: countError } = await supabaseAdmin
      .from("blog_comments")
      .select("id", { count: "exact", head: true })
      .eq("submitter_hash", submitterHash)
      .gte("created_at", since);
    if (countError) {
      console.error("submitComment rate check", countError);
      return { ok: false, error: "Não foi possível enviar agora. Tente novamente mais tarde." };
    }
    if ((count ?? 0) >= RATE_LIMIT.max) {
      return {
        ok: false,
        error: "Você enviou vários comentários em pouco tempo. Aguarde alguns minutos.",
      };
    }

    const { error } = await supabaseAdmin.from("blog_comments").insert({
      article_slug: input.slug,
      display_name: input.displayName,
      body: input.body,
      status: "pending",
      submitter_hash: submitterHash,
    });
    if (error) {
      console.error("submitComment insert", error);
      return { ok: false, error: "Não foi possível enviar agora. Tente novamente mais tarde." };
    }
    return { ok: true };
  });
