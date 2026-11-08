import { z } from "zod";

export const chatRequestSchema = z.object({
  query: z.string().trim().min(1).max(1000),
});

export type ChatRequestInput = z.infer<typeof chatRequestSchema>;