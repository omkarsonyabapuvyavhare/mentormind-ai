import type { ParseIntentResponse } from "@/lib/onboarding/parse-intent-schema";

import { isGeminiConfigured } from "@/lib/onboarding/parse-intent-ai";
import { resolveGoalIdentityFromText } from "@/lib/goals/goal-identity";

import { logGeminiIntentParsed } from "@/lib/dev/architecture-log";



/** Development-only server log for runtime verification. Never logs secrets. */

export function logParseIntentDevVerification(text: string, result: ParseIntentResponse): void {

  logGeminiIntentParsed({

    source: result.source,

    geminiConfigured: isGeminiConfigured(),

    model: process.env.GEMINI_MODEL?.trim() || "gemini-3-flash-preview",

    timeoutMs: process.env.AI_INTENT_PARSE_TIMEOUT_MS ?? "8000",

    textLength: text.length,

    goal: result.parsed.goal,

    skillLevel: result.parsed.currentSkillLevel,

    durationWeeks: result.parsed.durationWeeks,

    studyHoursPerWeek: result.parsed.studyHoursPerWeek,

    goalId: resolveGoalIdentityFromText(result.parsed.goal, result.parsed.targetOutcome).goalSlug,
    fallbackReason: result.fallbackReason,

  });

}


