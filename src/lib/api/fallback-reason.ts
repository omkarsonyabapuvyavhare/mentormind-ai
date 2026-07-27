import { z } from "zod";

/** Known fallback reasons surfaced in API responses for dev transparency. */
export const fallbackReasonSchema = z.string().min(1).max(64).optional();

export type FallbackReason = z.infer<typeof fallbackReasonSchema>;
