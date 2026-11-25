import { describe, expect, it } from "vitest";
import { canAccessAdminMetrics, extractVerifiedAal } from "@/lib/admin.schema";
import {
  MAX_TELEMETRY_BYTES,
  TELEMETRY_RETENTION_DAYS,
  sanitizePublicPath,
  telemetrySignalSchema,
} from "@/lib/telemetry.schema";

const VALID_UUID = "11111111-2222-4333-8444-555555555555";

describe("telemetry validation & privacy rules", () => {
  it("strips query params and accepts valid public routes", () => {
    expect(sanitizePublicPath("/?utm_source=ads&phone=123#contato")).toBe("/");
    expect(sanitizePublicPath("/diagnostico?ref=whatsapp")).toBe("/diagnostico");
    expect(sanitizePublicPath("/blog/contratos-empresariais-clausulas-essenciais?x=1")).toBe(
      "/blog/contratos-empresariais-clausulas-essenciais",
    );
  });

  it("rejects /admin and unknown routes", () => {
    expect(sanitizePublicPath("/admin")).toBeNull();
    expect(sanitizePublicPath("/admin/dashboard")).toBeNull();
    expect(sanitizePublicPath("/blog/slug-inexistente")).toBeNull();
  });

  it("accepts valid funnel event and heartbeat payloads", () => {
    expect(
      telemetrySignalSchema.safeParse({
        sessionId: VALID_UUID,
        kind: "event",
        path: "/diagnostico?foo=bar",
        stage: "whatsapp_attempt",
        source: "lead_form",
      }).success,
    ).toBe(true);

    expect(
      telemetrySignalSchema.safeParse({
        sessionId: VALID_UUID,
        kind: "heartbeat",
        path: "/",
      }).success,
    ).toBe(true);
  });

  it("rejects payloads containing PII or unexpected fields", () => {
    expect(
      telemetrySignalSchema.safeParse({
        sessionId: VALID_UUID,
        kind: "event",
        path: "/",
        stage: "form_started",
        name: "Fulano",
        phone: "11999999999",
      }).success,
    ).toBe(false);
  });

  it("rejects /admin path in telemetry payload and enforces short retention", () => {
    expect(
      telemetrySignalSchema.safeParse({
        sessionId: VALID_UUID,
        kind: "heartbeat",
        path: "/admin",
      }).success,
    ).toBe(false);
    expect(MAX_TELEMETRY_BYTES).toBe(512);
    expect(TELEMETRY_RETENTION_DAYS).toBe(30);
  });
});

describe("admin access authorization rules", () => {
  it("requires both authorized UUID and verified AAL2 claim", () => {
    expect(extractVerifiedAal({ aal: "aal1" })).toBe("aal1");
    expect(extractVerifiedAal({ aal: "aal2" })).toBe("aal2");
    expect(extractVerifiedAal({})).toBe("unknown");

    expect(canAccessAdminMetrics({ authorized: false, aal: "aal2" })).toBe(false);
    expect(canAccessAdminMetrics({ authorized: true, aal: "aal1" })).toBe(false);
    expect(canAccessAdminMetrics({ authorized: true, aal: "unknown" })).toBe(false);
    expect(canAccessAdminMetrics({ authorized: true, aal: "aal2" })).toBe(true);
  });
});