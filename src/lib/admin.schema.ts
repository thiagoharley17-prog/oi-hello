import { z } from "zod";
import { FUNNEL_STAGES, type FunnelStage } from "@/lib/telemetry.schema";

export const ADMIN_PERIODS = ["today", "7d", "30d"] as const;
export type AdminPeriod = (typeof ADMIN_PERIODS)[number];

export const ADMIN_SESSION_STATUSES = ["all", "active", "inactive"] as const;
export type AdminSessionStatusFilter = (typeof ADMIN_SESSION_STATUSES)[number];

export const adminDashboardInputSchema = z.object({
  period: z.enum(ADMIN_PERIODS).default("7d"),
  page: z.number().int().min(1).max(1000).default(1),
  pageSize: z.number().int().min(5).max(50).default(20),
  status: z.enum(ADMIN_SESSION_STATUSES).default("all"),
  stage: z.union([z.literal("all"), z.enum(FUNNEL_STAGES)]).default("all"),
});

export type AdminDashboardInput = z.infer<typeof adminDashboardInputSchema>;

export type AdminAuthStatus = {
  authorized: boolean;
  aal: "aal1" | "aal2" | "unknown";
  label: string | null;
  email: string | null;
};

export type FunnelSummary = {
  onlineNow: number;
  totalSessions: number;
  activeSessions: number;
  inactiveSessions: number;
  stageVisit: number;
  stageContact: number;
  stageFormStarted: number;
  stageWhatsappAttempt: number;
  stageWhatsappDirect: number;
  periodStart: string;
  generatedAt: string;
};

export type FunnelSessionRow = {
  sessionId: string;
  firstSeenAt: string;
  lastSeenAt: string;
  lastHeartbeatAt: string | null;
  isActive: boolean;
  firstPath: string;
  lastPath: string;
  lastStage: FunnelStage;
  reachedVisitAt: string | null;
  reachedContactAt: string | null;
  reachedFormStartedAt: string | null;
  reachedWhatsappAttemptAt: string | null;
  reachedWhatsappDirectAt: string | null;
};

export type AdminDashboardData = {
  summary: FunnelSummary;
  sessions: FunnelSessionRow[];
  totalCount: number;
  page: number;
  pageSize: number;
  retentionDays: number;
};

export function extractVerifiedAal(claims: Record<string, unknown> | undefined): "aal1" | "aal2" | "unknown" {
  const aal = claims?.["aal"];
  if (aal === "aal1" || aal === "aal2") return aal;
  return "unknown";
}

export function canAccessAdminMetrics(params: {
  authorized: boolean;
  aal: "aal1" | "aal2" | "unknown";
}): boolean {
  return params.authorized && params.aal === "aal2";
}