import { createFileRoute } from "@tanstack/react-router";
import {
  MAX_TELEMETRY_BYTES,
  TELEMETRY_RETENTION_DAYS,
  telemetrySignalSchema,
} from "@/lib/telemetry.schema";

function isAllowedOrigin(request: Request): boolean {
  const secFetchSite = request.headers.get("sec-fetch-site");
  if (secFetchSite && secFetchSite !== "same-origin" && secFetchSite !== "none") {
    return false;
  }
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

async function readTelemetryBody(request: Request): Promise<string | null> {
  if (Number(request.headers.get("content-length")) > MAX_TELEMETRY_BYTES || !request.body) {
    return null;
  }

  const reader = request.body.getReader();
  const bytes = new Uint8Array(MAX_TELEMETRY_BYTES);
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (length + value.byteLength > bytes.byteLength) {
        void reader.cancel().catch(() => {});
        return null;
      }
      bytes.set(value, length);
      length += value.byteLength;
    }
  } finally {
    reader.releaseLock();
  }
  return new TextDecoder().decode(bytes.subarray(0, length));
}

export const Route = createFileRoute("/api/telemetry")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const noStoreHeaders = { "Cache-Control": "no-store" };

        if (!isAllowedOrigin(request)) {
          return new Response("Forbidden", { status: 403, headers: noStoreHeaders });
        }

        const contentType = request.headers.get("content-type") ?? "";
        if (contentType.split(";")[0]?.trim().toLowerCase() !== "application/json") {
          return new Response("Unsupported Media Type", { status: 415, headers: noStoreHeaders });
        }

        const rawBody = await readTelemetryBody(request);
        if (!rawBody) {
          return new Response("Payload Too Large", { status: 413, headers: noStoreHeaders });
        }

        let parsedJson: unknown;
        try {
          parsedJson = JSON.parse(rawBody);
        } catch {
          return new Response("Bad Request", { status: 400, headers: noStoreHeaders });
        }

        const parsed = telemetrySignalSchema.safeParse(parsedJson);
        if (!parsed.success) {
          return new Response("Bad Request", { status: 400, headers: noStoreHeaders });
        }

        const signal = parsed.data;

        try {
          const { allowPublicSubmission } = await import("@/lib/public-submission-limit.server");
          const { allowed } = await allowPublicSubmission("telemetry", request.headers);
          if (!allowed) {
            return new Response(null, {
              status: 429,
              headers: { ...noStoreHeaders, "Retry-After": "600" },
            });
          }
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { error } = await supabaseAdmin.rpc("ingest_funnel_signal", {
            p_session_id: signal.sessionId,
            p_kind: signal.kind,
            p_path: signal.path,
            ...(signal.stage ? { p_stage: signal.stage } : {}),
            ...(signal.source ? { p_source: signal.source } : {}),
          });

          if (error) {
            console.error("[telemetry] ingest_funnel_signal error", error.message);
            return new Response("Bad Gateway", { status: 502, headers: noStoreHeaders });
          }

          // Opportunistic retention enforcement without idle cron compute.
          if (Math.random() < 0.02) {
            void supabaseAdmin.rpc("prune_old_funnel_sessions", {
              p_retention_days: TELEMETRY_RETENTION_DAYS,
            });
          }

          return new Response(null, { status: 204, headers: noStoreHeaders });
        } catch (err) {
          console.error("[telemetry] unexpected error", err);
          return new Response("Internal Server Error", { status: 500, headers: noStoreHeaders });
        }
      },
    },
  },
});
