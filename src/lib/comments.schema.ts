import { z } from "zod";

export const MIN_FILL_MS = 3000;
export const MAX_LINKS = 1;
export const RATE_LIMIT = { max: 3, windowMinutes: 10 };

export const commentInputSchema = z.object({
  slug: z.string().trim().min(1).max(200),
  displayName: z
    .string()
    .trim()
    .min(2, "Informe um nome com pelo menos 2 caracteres.")
    .max(60, "O nome deve ter no máximo 60 caracteres.")
    .refine((v) => !/(https?:\/\/|www\.)/i.test(v), "O nome não pode conter links."),
  body: z
    .string()
    .trim()
    .min(10, "O comentário deve ter pelo menos 10 caracteres.")
    .max(1500, "O comentário deve ter no máximo 1500 caracteres.")
    .refine(
      (v) => (v.match(/(https?:\/\/|www\.)/gi) ?? []).length <= MAX_LINKS,
      "Use no máximo um link no comentário.",
    ),
  // Honeypot: real visitors never see or fill this field.
  website: z.string().max(0).optional().default(""),
  // Milliseconds between form render and submit.
  elapsedMs: z.number().int().nonnegative(),
});

export type CommentInput = z.input<typeof commentInputSchema>;

export type SpamVerdict = "ok" | "honeypot" | "too_fast";

export function checkSpamSignals(input: { website?: string; elapsedMs: number }): SpamVerdict {
  if (input.website && input.website.length > 0) return "honeypot";
  if (input.elapsedMs < MIN_FILL_MS) return "too_fast";
  return "ok";
}
