import "server-only";

import { generateRoadmapWithGemini, getRoadmapGeminiModel } from "@/lib/ai/generate-roadmap";
import { buildDeterministicRoadmap } from "@/lib/ai/roadmap-deterministic";
import { buildRoadmapFromAiMilestones, type RoadmapGenerationContext } from "@/lib/ai/roadmap-fallback";
import {
  logRoadmapGenerationDevVerification,
  summarizeRoadmap,
  type GenerateRoadmapResult,
} from "@/lib/ai/roadmap-dev-log";
import type { OnboardingInput } from "@/lib/onboarding/schema";
import { isGeminiConfigured } from "@/lib/onboarding/parse-intent-ai";

export type { RoadmapGenerationContext } from "@/lib/ai/roadmap-fallback";
export type { GenerateRoadmapResult } from "@/lib/ai/roadmap-dev-log";

export async function generateRoadmapForOnboarding(
  input: OnboardingInput,
  twinId: string,
  startTimestamp: string,
  context?: RoadmapGenerationContext,
): Promise<GenerateRoadmapResult> {
  const startedAt = Date.now();

  if (isGeminiConfigured()) {
    const geminiResult = await generateRoadmapWithGemini(input, context);

    if (geminiResult.ok) {
      const roadmap = buildRoadmapFromAiMilestones(
        geminiResult.data.milestones,
        input.goalId,
        twinId,
        startTimestamp,
      );
      const summary = summarizeRoadmap(roadmap);

      logRoadmapGenerationDevVerification({
        goalId: input.goalId,
        source: "ai",
        model: getRoadmapGeminiModel(),
        durationMs: Date.now() - startedAt,
        milestoneCount: summary.milestoneCount,
        taskCount: summary.taskCount,
      });

      return { roadmap, source: "ai" };
    }

    const deterministic = buildDeterministicRoadmap(
      input,
      twinId,
      startTimestamp,
      context,
      geminiResult.reason,
    );

    logRoadmapGenerationDevVerification({
      goalId: input.goalId,
      source: "deterministic",
      model: getRoadmapGeminiModel(),
      durationMs: Date.now() - startedAt,
      milestoneCount: deterministic.milestoneCount,
      taskCount: deterministic.taskCount,
      fallbackReason: geminiResult.reason,
    });

    return {
      roadmap: deterministic.roadmap,
      source: "deterministic",
      fallbackReason: geminiResult.reason,
    };
  }

  const deterministic = buildDeterministicRoadmap(
    input,
    twinId,
    startTimestamp,
    context,
    "missing-api-key",
  );

  logRoadmapGenerationDevVerification({
    goalId: input.goalId,
    source: "deterministic",
    durationMs: Date.now() - startedAt,
    milestoneCount: deterministic.milestoneCount,
    taskCount: deterministic.taskCount,
    fallbackReason: "missing-api-key",
  });

  return {
    roadmap: deterministic.roadmap,
    source: "deterministic",
    fallbackReason: "missing-api-key",
  };
}
