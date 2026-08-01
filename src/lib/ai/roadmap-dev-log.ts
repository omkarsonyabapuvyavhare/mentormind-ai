import type { RoadmapGenerationSource } from "@/lib/ai/roadmap-schema";
import type { OnboardingInput } from "@/lib/onboarding/schema";
import type { Roadmap } from "@/types/roadmap";
import {
  logGeminiRoadmapGenerated,
} from "@/lib/dev/architecture-log";

/** Development-only server log for roadmap generation. Never logs secrets. */
export function logRoadmapGenerationDevVerification(payload: {
  goalId: string;
  source: RoadmapGenerationSource;
  model?: string;
  durationMs: number;
  milestoneCount: number;
  taskCount: number;
  fallbackReason?: string;
}): void {
  if (payload.source === "ai") {
    logGeminiRoadmapGenerated({
      goalId: payload.goalId,
      model: payload.model,
      durationMs: payload.durationMs,
      milestoneCount: payload.milestoneCount,
      taskCount: payload.taskCount,
    });
    return;
  }

  if (process.env.NODE_ENV !== "development") {
    return;
  }

  console.info(
    payload.source === "kg" ? "[KG] Roadmap generated" : "[Fallback] Roadmap generated",
    payload,
  );
}

export function summarizeRoadmap(roadmap: Roadmap): {
  milestoneCount: number;
  taskCount: number;
} {
  return {
    milestoneCount: roadmap.milestones.length,
    taskCount: roadmap.tasks.length,
  };
}

export interface GenerateRoadmapResult {
  roadmap: Roadmap;
  source: RoadmapGenerationSource;
  fallbackReason?: string;
}

export function buildRoadmapGenerationContext(input: OnboardingInput): {
  goal: string;
  domain: string;
  targetOutcome: string;
  recommendedFocusAreas: string[];
} {
  return {
    goal: input.goalId,
    domain: "Professional learning",
    targetOutcome: "Reach the stated learning outcome",
    recommendedFocusAreas: input.knownChallengeTopicIds,
  };
}
