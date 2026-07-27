import type { OnboardingInput } from "@/lib/onboarding/schema";
import type { RoadmapGenerationContext } from "@/lib/ai/roadmap-service";
import {
  generateRoadmapResponseSchema,
  type GenerateRoadmapResponse,
} from "@/lib/onboarding/generate-roadmap-schema";
import { createDeterministicRoadmapFromOnboarding } from "@/lib/ai/roadmap-deterministic";
import { logApiFallbackTransparency } from "@/lib/dev/architecture-log";

const STORAGE_KEY = "mentormind-pending-onboarding";

export interface PendingOnboardingPayload {
  input: OnboardingInput;
  context?: RoadmapGenerationContext;
}

export function savePendingOnboarding(payload: PendingOnboardingPayload): void {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function readPendingOnboarding(): PendingOnboardingPayload | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.sessionStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as PendingOnboardingPayload;
  } catch {
    return null;
  }
}

export function clearPendingOnboarding(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(STORAGE_KEY);
}

function createLearnerId(timestamp: string): string {
  return `learner-${timestamp.replace(/[^\d]/g, "").slice(0, 14)}`;
}

export async function fetchGeneratedRoadmap(
  payload: PendingOnboardingPayload,
  timestamp: string,
): Promise<GenerateRoadmapResponse> {
  const twinId = createLearnerId(timestamp);

  try {
    const response = await fetch("/api/onboarding/generate-roadmap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: payload.input,
        twinId,
        startTimestamp: timestamp,
        context: payload.context,
      }),
    });

    if (!response.ok) {
      const fallback = createDeterministicRoadmapFromOnboarding(
        payload.input,
        twinId,
        timestamp,
        payload.context,
        "network",
      );
      logApiFallbackTransparency("generate-roadmap", {
        source: fallback.source,
        fallbackReason: fallback.fallbackReason,
      });
      return fallback;
    }

    const body: unknown = await response.json();
    const validated = generateRoadmapResponseSchema.safeParse(body);

    if (!validated.success) {
      const fallback = createDeterministicRoadmapFromOnboarding(
        payload.input,
        twinId,
        timestamp,
        payload.context,
        "invalid-response",
      );
      logApiFallbackTransparency("generate-roadmap", {
        source: fallback.source,
        fallbackReason: fallback.fallbackReason,
      });
      return fallback;
    }

    logApiFallbackTransparency("generate-roadmap", {
      source: validated.data.source,
      fallbackReason: validated.data.fallbackReason,
    });
    return validated.data;
  } catch {
    const fallback = createDeterministicRoadmapFromOnboarding(
      payload.input,
      twinId,
      timestamp,
      payload.context,
      "network",
    );
    logApiFallbackTransparency("generate-roadmap", {
      source: fallback.source,
      fallbackReason: fallback.fallbackReason,
    });
    return fallback;
  }
}
