import { isAwsCertificationGoal } from "@/lib/goals/goal-identity";
import {
  buildAwsSeedFallbackRoadmap,
  buildRoadmapFromAiMilestones,
  buildUniversalFallbackMilestones,
  resolveDeterministicFallbackMilestones,
  type RoadmapGenerationContext,
} from "@/lib/ai/roadmap-fallback";
import type { RoadmapGenerationSource } from "@/lib/ai/roadmap-schema";
import { summarizeRoadmap } from "@/lib/ai/roadmap-dev-log";
import type { OnboardingInput } from "@/lib/onboarding/schema";
import type { Roadmap } from "@/types/roadmap";

export interface DeterministicRoadmapResult {
  roadmap: Roadmap;
  source: RoadmapGenerationSource;
  fallbackReason?: string;
}

function buildDeterministicRoadmap(
  input: OnboardingInput,
  twinId: string,
  startTimestamp: string,
  context: RoadmapGenerationContext | undefined,
  reason: string,
): DeterministicRoadmapResult & { milestoneCount: number; taskCount: number } {
  if (isAwsCertificationGoal(input.goalSlug)) {
    const roadmap = buildAwsSeedFallbackRoadmap(twinId, input.goalId, startTimestamp);
    const summary = summarizeRoadmap(roadmap);
    return {
      roadmap,
      source: "deterministic",
      fallbackReason: reason,
      ...summary,
    };
  }

  const fallbackMilestones =
    resolveDeterministicFallbackMilestones(input, context) ??
    buildUniversalFallbackMilestones(input, context);

  const roadmap = buildRoadmapFromAiMilestones(
    fallbackMilestones,
    input.goalId,
    twinId,
    startTimestamp,
  );
  const summary = summarizeRoadmap(roadmap);

  return {
    roadmap,
    source: "deterministic",
    fallbackReason: reason,
    ...summary,
  };
}

/** Synchronous deterministic roadmap — safe for client fallback and tests. */
export function createDeterministicRoadmapFromOnboarding(
  input: OnboardingInput,
  twinId: string,
  startTimestamp: string,
  context?: RoadmapGenerationContext,
  reason = "deterministic-request",
): DeterministicRoadmapResult {
  const result = buildDeterministicRoadmap(input, twinId, startTimestamp, context, reason);
  return {
    roadmap: result.roadmap,
    source: result.source,
    fallbackReason: result.fallbackReason,
  };
}

export { buildDeterministicRoadmap };
