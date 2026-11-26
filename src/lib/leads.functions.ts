import { createServerFn } from "@tanstack/react-start";
import { getRequest, setResponseHeader } from "@tanstack/react-start/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { extractVerifiedAal } from "@/lib/admin.schema";
import { leadInputSchema, type LeadsDatabase } from "@/lib/leads";

export const saveLead = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => leadInputSchema.parse(input))
  .handler(async ({ data }) => {
    setResponseHeader("Cache-Control", "no-store");
    const { allowPublicSubmission } = await import("@/lib/public-submission-limit.server");
    const { allowed } = await allowPublicSubmission("lead", getRequest().headers);
    if (!allowed) return { saved: false, limited: true };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const db = supabaseAdmin as unknown as SupabaseClient<LeadsDatabase>;
    const { error } = await db.from("site_leads").upsert(data, {
      onConflict: "id",
      ignoreDuplicates: true,
    });

    return { saved: !error, limited: false };
  });

export const listLeads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    setResponseHeader("Cache-Control", "private, no-store");
    if (extractVerifiedAal(context.claims) !== "aal2") {
      throw new Error("FORBIDDEN_AAL2_REQUIRED");
    }

    const { data: authorized, error: authorizationError } = await context.supabase.rpc(
      "is_authorized_admin_aal2",
    );
    if (authorizationError || !authorized) throw new Error("FORBIDDEN_NOT_ADMIN");

    const db = context.supabase as unknown as SupabaseClient<LeadsDatabase>;
    const { data, error } = await db
      .from("site_leads")
      .select("id,name,phone,email,created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error("LEADS_FETCH_FAILED");
    return data;
  });
