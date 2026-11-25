import {
  HEARTBEAT_DEDUPE_MS,
  HEARTBEAT_INTERVAL_MS,
  SESSION_IDLE_TIMEOUT_MS,
  sanitizePublicPath,
  type FunnelSource,
  type FunnelStage,
} from "@/lib/telemetry.schema";

const SESSION_STORAGE_KEY = "hlb_nav_session_v1";
const HEARTBEAT_STORAGE_KEY = "hlb_nav_hb_v1";
const STAGES_STORAGE_KEY = "hlb_nav_stages_v1";

type StoredSession = { id: string; lastActivity: number };

let memorySession: StoredSession | null = null;
const memorySentStages = new Set<string>();

function generateUuidV4(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x40;
  bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function readStoredSession(): StoredSession | null {
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredSession>;
    if (typeof parsed.id === "string" && typeof parsed.lastActivity === "number") {
      return { id: parsed.id, lastActivity: parsed.lastActivity };
    }
  } catch {
    // Storage blocked or corrupted; fall back to in-memory session.
  }
  return null;
}

function writeStoredSession(session: StoredSession) {
  try {
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Ignore storage errors silently.
  }
}

function getOrCreateSessionId(): string {
  const now = Date.now();
  const stored = readStoredSession() ?? memorySession;
  if (stored && now - stored.lastActivity < SESSION_IDLE_TIMEOUT_MS) {
    const refreshed = { id: stored.id, lastActivity: now };
    memorySession = refreshed;
    writeStoredSession(refreshed);
    return refreshed.id;
  }
  const fresh = { id: generateUuidV4(), lastActivity: now };
  memorySession = fresh;
  memorySentStages.clear();
  writeStoredSession(fresh);
  try {
    window.localStorage.removeItem(STAGES_STORAGE_KEY);
    window.localStorage.removeItem(HEARTBEAT_STORAGE_KEY);
  } catch {
    // Ignore storage errors.
  }
  return fresh.id;
}

function hasStageBeenSent(sessionId: string, stage: FunnelStage): boolean {
  const key = `${sessionId}:${stage}`;
  if (memorySentStages.has(key)) return true;
  try {
    const raw = window.localStorage.getItem(STAGES_STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { id?: string; stages?: string[] };
    return parsed.id === sessionId && Array.isArray(parsed.stages) && parsed.stages.includes(stage);
  } catch {
    return false;
  }
}

function markStageSent(sessionId: string, stage: FunnelStage) {
  memorySentStages.add(`${sessionId}:${stage}`);
  try {
    const raw = window.localStorage.getItem(STAGES_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as { id?: string; stages?: string[] }) : null;
    const stages = parsed?.id === sessionId && Array.isArray(parsed.stages) ? parsed.stages : [];
    if (!stages.includes(stage)) {
      stages.push(stage);
      window.localStorage.setItem(STAGES_STORAGE_KEY, JSON.stringify({ id: sessionId, stages }));
    }
  } catch {
    // Ignore storage errors.
  }
}

function shouldSendHeartbeatNow(): boolean {
  const now = Date.now();
  try {
    const raw = window.localStorage.getItem(HEARTBEAT_STORAGE_KEY);
    const last = raw ? Number(raw) : 0;
    if (Number.isFinite(last) && now - last < HEARTBEAT_DEDUPE_MS) {
      return false;
    }
    window.localStorage.setItem(HEARTBEAT_STORAGE_KEY, String(now));
  } catch {
    // If storage is unavailable, allow heartbeat for this tab.
  }
  return true;
}

function postTelemetry(payload: Record<string, string>) {
  try {
    if (typeof document !== "undefined" && document.visibilityState === "visible") {
      try {
        window.localStorage.setItem(HEARTBEAT_STORAGE_KEY, String(Date.now()));
      } catch {
        // Ignore storage errors.
      }
    }
    void fetch("/api/telemetry", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
      credentials: "same-origin",
    }).catch(() => {
      // Telemetry failures must never affect navigation or forms.
    });
  } catch {
    // Never throw from telemetry.
  }
}

export function trackFunnelEvent(stage: FunnelStage, source: FunnelSource, rawPath?: string) {
  if (typeof window === "undefined") return;
  try {
    const path = sanitizePublicPath(rawPath ?? window.location.pathname);
    if (!path) return;
    const sessionId = getOrCreateSessionId();
    if (hasStageBeenSent(sessionId, stage)) return;
    markStageSent(sessionId, stage);
    postTelemetry({ sessionId, kind: "event", path, stage, source });
  } catch {
    // Swallow all errors silently.
  }
}

export function sendPublicHeartbeat(rawPath?: string, force = false) {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  try {
    if (document.visibilityState !== "visible") return;
    const path = sanitizePublicPath(rawPath ?? window.location.pathname);
    if (!path) return;
    if (!force && !shouldSendHeartbeatNow()) return;
    if (force) {
      try {
        window.localStorage.setItem(HEARTBEAT_STORAGE_KEY, String(Date.now()));
      } catch {
        // Ignore storage errors.
      }
    }
    const sessionId = getOrCreateSessionId();
    postTelemetry({ sessionId, kind: "heartbeat", path });
  } catch {
    // Swallow all errors silently.
  }
}

export function startPublicPresenceLoop(getPath: () => string): () => void {
  if (typeof window === "undefined" || typeof document === "undefined") return () => {};
  let timer: number | null = null;

  const clearTimer = () => {
    if (timer !== null) {
      window.clearInterval(timer);
      timer = null;
    }
  };

  const tick = () => {
    if (document.visibilityState !== "visible") {
      clearTimer();
      return;
    }
    sendPublicHeartbeat(getPath(), false);
  };

  const startTimer = () => {
    clearTimer();
    if (document.visibilityState !== "visible") return;
    if (!sanitizePublicPath(getPath())) return;
    timer = window.setInterval(tick, HEARTBEAT_INTERVAL_MS);
  };

  const handleVisibility = () => {
    if (document.visibilityState === "visible") {
      sendPublicHeartbeat(getPath(), false);
      startTimer();
    } else {
      clearTimer();
    }
  };

  startTimer();
  document.addEventListener("visibilitychange", handleVisibility);

  return () => {
    clearTimer();
    document.removeEventListener("visibilitychange", handleVisibility);
  };
}