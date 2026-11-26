import { isIP } from "node:net";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

type Scope = "lead" | "comment" | "telemetry";

function clientAddress(headers: Headers) {
  // Only use the client address supplied by the hosting edge. Unknown addresses
  // share a limit so a missing header cannot disable the check.
  const header = process.env["VERCEL"] === "1" ? "x-vercel-forwarded-for" : "cf-connecting-ip";
  const address = headers.get(header)?.trim().toLowerCase();
  return address && isIP(address) ? address : "unknown";
}

export async function allowPublicSubmission(scope: Scope, headers: Headers) {
  const secret = process.env["SUPABASE_SERVICE_ROLE_KEY"];
  if (!secret) throw new Error("PUBLIC_SUBMISSIONS_UNAVAILABLE");

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(`hlb:submission:v1:${scope}:${clientAddress(headers)}`),
  );
  const fingerprint = Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
  const { data, error } = await supabaseAdmin.rpc("allow_public_submission", {
    p_scope: scope,
    p_fingerprint: fingerprint,
  });
  if (error || typeof data !== "boolean") throw new Error("PUBLIC_SUBMISSIONS_UNAVAILABLE");
  return { allowed: data, fingerprint };
}
