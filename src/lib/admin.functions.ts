import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  adminDashboardInputSchema,
  canAccessAdminMetrics,
  extractVerifiedAal,
  type AdminAuthStatus,
  type AdminDashboardData,
  type AdminDashboardInput,
  type FunnelSessionRow,
} from "@/lib/admin.schema";
import {
  FUNNEL_STAGES,
  TELEMETRY_RETENTION_DAYS,
  type FunnelStage,
} from "@/lib/telemetry.schema";

function toFunnelStage(value: string): FunnelStage {
  return (FUNNEL_STAGES as readonly string[]).includes(value)
    ? (value as FunnelStage)
    : "visit";
}

/**
 * Verifies the authenticated user's authorization against public.admin_users
 * and reads the verified AAL claim from the Supabase JWT (already usable at AAL1
 * before releasing TOTP factor enrollment). Returns no metrics.
 */
export const getAdminSessionStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminAuthStatus> => {
    setResponseHeader("Cache-Control", "no-store");

    const aal = extractVerifiedAal(context.claims as Record<string, unknown>);
    const email = typeof context.claims.email === "string" ? context.claims.email : null;

    const { data, error } = await context.supabase
      .from("admin_users")
      .select("user_id, label")
      .eq("user_id", context.userId)
      .maybeSingle();

    if (error) {
      console.error("[admin] admin_users lookup failed", error.message);
      throw new Error("ADMIN_CHECK_FAILED");
    }

    return {
      authorized: Boolean(data?.user_id),
      aal,
      label: data?.label ?? null,
      email,
    };
  });

/**
 * Returns live presence estimate, funnel aggregates and paginated sessions.
 * Enforces authenticated user + AAL2 JWT claim + admin_users allowlist BOTH
 * in this server handler AND in PostgreSQL (RLS + RPC is_authorized_admin_aal2).
 */
export const getAdminDashboardData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: Partial<AdminDashboardInput>) => adminDashboardInputSchema.parse(input ?? {}))
  .handler(async ({ data, context }): Promise<AdminDashboardData> => {
    setResponseHeader("Cache-Control", "no-store");

    const aal = extractVerifiedAal(context.claims as Record<string, unknown>);
    const { data: adminRow, error: adminError } = await context.supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", context.userId)
      .maybeSingle();

    if (adminError) {
      console.error("[admin] admin authorization query failed", adminError.message);
      throw new Error("ADMIN_CHECK_FAILED");
    }

    const authorized = Boolean(adminRow?.user_id);
    if (!authorized) {
      throw new Error("FORBIDDEN_NOT_ADMIN");
    }
    if (!canAccessAdminMetrics({ authorized, aal })) {
      throw new Error("FORBIDDEN_AAL2_REQUIRED");
    }

    const [summaryRes, sessionsRes] = await Promise.all([
      context.supabase.rpc("get_admin_funnel_summary", {
        p_period: data.period,
      }),
      context.supabase.rpc("get_admin_funnel_sessions", {
        p_period: data.period,
        p_page: data.page,
        p_page_size: data.pageSize,
        p_status: data.status,
        p_stage: data.stage,
      }),
    ]);

    if (summaryRes.error) {
      console.error("[admin] summary rpc error", summaryRes.error.message);
      throw new Error("SUMMARY_FETCH_FAILED");
    }
    if (sessionsRes.error) {
      console.error("[admin] sessions rpc error", sessionsRes.error.message);
      throw new Error("SESSIONS_FETCH_FAILED");
    }

    const rawSummary = summaryRes.data?.[0];
    const nowIso = new Date().toISOString();
    const summary = {
      onlineNow: Number(rawSummary?.online_now ?? 0),
      totalSessions: Number(rawSummary?.total_sessions ?? 0),
      activeSessions: Number(rawSummary?.active_sessions ?? 0),
      inactiveSessions: Number(rawSummary?.inactive_sessions ?? 0),
      stageVisit: Number(rawSummary?.stage_visit ?? 0),
      stageContact: Number(rawSummary?.stage_contact ?? 0),
      stageFormStarted: Number(rawSummary?.stage_form_started ?? 0),
      stageWhatsappAttempt: Number(rawSummary?.stage_whatsapp_attempt ?? 0),
      stageWhatsappDirect: Number(rawSummary?.stage_whatsapp_direct ?? 0),
      periodStart: rawSummary?.period_start ?? nowIso,
      generatedAt: rawSummary?.generated_at ?? nowIso,
    };

    const rows = sessionsRes.data ?? [];
    const totalCount = Number(rows[0]?.total_count ?? 0);
    const sessions: FunnelSessionRow[] = rows.map((row) => ({
      sessionId: row.session_id,
      firstSeenAt: row.first_seen_at,
      lastSeenAt: row.last_seen_at,
      lastHeartbeatAt: row.last_heartbeat_at ?? null,
      isActive: Boolean(row.is_active),
      firstPath: row.first_path,
      lastPath: row.last_path,
      lastStage: toFunnelStage(row.last_stage),
      reachedVisitAt: row.reached_visit_at ?? null,
      reachedContactAt: row.reached_contact_at ?? null,
      reachedFormStartedAt: row.reached_form_started_at ?? null,
      reachedWhatsappAttemptAt: row.reached_whatsapp_attempt_at ?? null,
      reachedWhatsappDirectAt: row.reached_whatsapp_direct_at ?? null,
    }));

    // Prune expired sessions beyond the documented retention window after authorization succeeds.
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      void supabaseAdmin.rpc("prune_old_funnel_sessions", {
        p_retention_days: TELEMETRY_RETENTION_DAYS,
      });
    } catch {
      // Retention pruning must not block dashboard reads.
    }

    return {
      summary,
      sessions,
      totalCount,
      page: data.page,
      pageSize: data.pageSize,
      retentionDays: TELEMETRY_RETENTION_DAYS,
    };
  });