import { z } from "zod";

export const leadInputSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(2).max(100),
  phone: z
    .string()
    .trim()
    .max(24)
    .regex(/^\+?(?:[ .()\-]*[0-9]){10,15}[ .()\-]*$/),
  email: z
    .string()
    .trim()
    .email()
    .max(254)
    .transform((email) => email.toLowerCase()),
});

export type LeadInput = z.input<typeof leadInputSchema>;
export type Lead = z.output<typeof leadInputSchema> & { created_at: string };

export type LeadsDatabase = {
  public: {
    Tables: {
      site_leads: {
        Row: Lead;
        Insert: z.output<typeof leadInputSchema>;
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
  };
};
