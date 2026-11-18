import { describe, expect, it } from "vitest";
import { checkSpamSignals, commentInputSchema } from "@/lib/comments.schema";

const base = { slug: "x", displayName: "Ana", body: "Um comentário válido aqui.", elapsedMs: 5000 };

describe("comment rules", () => {
  it("accepts a valid comment", () => expect(commentInputSchema.safeParse(base).success).toBe(true));
  it("rejects names shorter than 2 characters", () =>
    expect(commentInputSchema.safeParse({ ...base, displayName: "A" }).success).toBe(false));
  it("rejects comments over 1500 characters", () =>
    expect(commentInputSchema.safeParse({ ...base, body: "a".repeat(1501) }).success).toBe(false));
  it("rejects more than one link", () =>
    expect(commentInputSchema.safeParse({ ...base, body: "veja http://a.com e http://b.com" }).success).toBe(false));
  it("flags a filled honeypot", () => expect(checkSpamSignals({ website: "x", elapsedMs: 9000 })).toBe("honeypot"));
  it("flags submissions faster than 3 seconds", () => expect(checkSpamSignals({ elapsedMs: 2999 })).toBe("too_fast"));
});
