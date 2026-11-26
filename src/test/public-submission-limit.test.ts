import { afterEach, expect, it, vi } from "vitest";
import { allowPublicSubmission } from "@/lib/public-submission-limit.server";

const { rpc } = vi.hoisted(() => ({ rpc: vi.fn() }));
vi.mock("@/integrations/supabase/client.server", () => ({ supabaseAdmin: { rpc } }));

afterEach(() => {
  vi.unstubAllEnvs();
  rpc.mockReset();
});

it("uses a keyed, scoped fingerprint from the edge address", async () => {
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-key");
  vi.stubEnv("VERCEL", "1");
  rpc.mockResolvedValue({ data: true, error: null });
  const first = new Headers({
    "x-vercel-forwarded-for": "192.0.2.17",
    "cf-connecting-ip": "198.51.100.1",
    "user-agent": "first",
  });
  const second = new Headers(first);
  second.set("user-agent", "second");
  second.set("cf-connecting-ip", "198.51.100.2");

  const lead = await allowPublicSubmission("lead", first);
  expect(lead.fingerprint).toMatch(/^[a-f0-9]{64}$/);
  expect(await allowPublicSubmission("lead", second)).toEqual(lead);
  expect((await allowPublicSubmission("comment", first)).fingerprint).not.toEqual(lead.fingerprint);
  expect(rpc).toHaveBeenCalledWith("allow_public_submission", {
    p_scope: "lead",
    p_fingerprint: lead.fingerprint,
  });
});

it("distinguishes a rejected request from an unavailable backend", async () => {
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-key");
  rpc.mockResolvedValueOnce({ data: false, error: null }).mockResolvedValueOnce({
    data: null,
    error: { code: "not_available" },
  });

  await expect(allowPublicSubmission("telemetry", new Headers())).resolves.toMatchObject({
    allowed: false,
  });
  await expect(allowPublicSubmission("telemetry", new Headers())).rejects.toThrow(
    "PUBLIC_SUBMISSIONS_UNAVAILABLE",
  );
});
