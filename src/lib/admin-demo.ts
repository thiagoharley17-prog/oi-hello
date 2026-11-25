import type { AdminDashboardData, AdminDashboardInput, FunnelSessionRow } from "@/lib/admin.schema";
import { TELEMETRY_RETENTION_DAYS, type FunnelStage } from "@/lib/telemetry.schema";

const stages: FunnelStage[] = [
  "visit",
  "contact_reached",
  "form_started",
  "whatsapp_attempt",
  "whatsapp_direct_click",
];

export function getDemoDashboard({
  period,
  page,
  pageSize,
  status,
  stage,
}: AdminDashboardInput): AdminDashboardData {
  const now = Date.now();
  const iso = (offset: number) => new Date(now - offset).toISOString();
  const total = { today: 24, "7d": 43, "30d": 68 }[period];
  const sessions: FunnelSessionRow[] = Array.from({ length: total }, (_, index) => {
    const step = stages[index % stages.length] ?? "visit";
    const active = index < 3;
    const lastSeen = iso(active ? index * 10_000 : index * 180_000);
    const firstSeen = iso((index + 1) * 180_000);
    const contactReached =
      step === "contact_reached" || step === "form_started" || step === "whatsapp_attempt";
    const formStarted = step === "form_started" || step === "whatsapp_attempt";

    return {
      sessionId: `demo-${String(index + 1).padStart(3, "0")}`,
      firstSeenAt: firstSeen,
      lastSeenAt: lastSeen,
      lastHeartbeatAt: active ? lastSeen : null,
      isActive: active,
      firstPath: "/",
      lastPath: contactReached ? "/diagnostico" : "/",
      lastStage: step,
      reachedVisitAt: firstSeen,
      reachedContactAt: contactReached ? lastSeen : null,
      reachedFormStartedAt: formStarted ? lastSeen : null,
      reachedWhatsappAttemptAt: step === "whatsapp_attempt" ? lastSeen : null,
      reachedWhatsappDirectAt: step === "whatsapp_direct_click" ? lastSeen : null,
    };
  });
  const filtered = sessions.filter(
    (session) =>
      (status === "all" || session.isActive === (status === "active")) &&
      (stage === "all" || session.lastStage === stage),
  );
  const start = (page - 1) * pageSize;

  return {
    summary: {
      onlineNow: 3,
      totalSessions: sessions.length,
      activeSessions: 3,
      inactiveSessions: sessions.length - 3,
      stageVisit: sessions.length,
      stageContact: sessions.filter((session) => session.reachedContactAt).length,
      stageFormStarted: sessions.filter((session) => session.reachedFormStartedAt).length,
      stageWhatsappAttempt: sessions.filter((session) => session.reachedWhatsappAttemptAt).length,
      stageWhatsappDirect: sessions.filter((session) => session.reachedWhatsappDirectAt).length,
      periodStart: iso({ today: 0, "7d": 6, "30d": 29 }[period] * 86_400_000),
      generatedAt: iso(0),
    },
    sessions: filtered.slice(start, start + pageSize),
    totalCount: filtered.length,
    page,
    pageSize,
    retentionDays: TELEMETRY_RETENTION_DAYS,
  };
}
