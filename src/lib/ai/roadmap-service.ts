import "server-only";

import { buildKgRoadmap } from "@/knowledge-base/generation";
import { resolveKnowledgeGraph } from "@/knowledge-base/registry";
import { generateRoadmapWithGemini, getRoadmapGeminiModel } from "@/lib/ai/generate-roadmap";
import {
  isAnyAiProviderConfigured,
  logAiProviderSuccess,
} from "@/lib/ai/providers";
import { buildDeterministicRoadmap } from "@/lib/ai/roadmap-deterministic";
import {
  buildRoadmapFromAiMilestones,
  type RoadmapGenerationContext,
} from "@/lib/ai/roadmap-fallback";
import {
  logRoadmapGenerationDevVerification,
  summarizeRoadmap,
  type GenerateRoadmapResult,
} from "@/lib/ai/roadmap-dev-log";
import { isAwsCertificationGoal } from "@/lib/goals/goal-identity";
import {
  buildRoadmapFromKgResult,
  buildRoadmapFromValidatedAiMilestones,
  logKgPipelineDev,
} from "@/lib/knowledge-graph";
import type { OnboardingInput } from "@/lib/onboarding/schema";

export type { RoadmapGenerationContext } from "@/lib/ai/roadmap-fallback";
export type { GenerateRoadmapResult } from "@/lib/ai/roadmap-dev-log";

function tryBuildKgRoadmapFallback(
  input: OnboardingInput,
  twinId: string,
  startTimestamp: string,
  reason: string,
): GenerateRoadmapResult | null {
  const kgResult = buildKgRoadmap({
    goalTitle: input.goalTitle,
    goalCategory: input.goalCategory,
    aliases: [input.goalSlug, input.goalId],
  });

  if (!kgResult.ok) {
    return null;
  }

  const roadmap = buildRoadmapFromKgResult(
    kgResult,
    input.goalId,
    twinId,
    startTimestamp,
    input.durationWeeks,
  );

  logKgPipelineDev({
    flow: "roadmap",
    providersTried: ["gemini", "grok"],
    providerAccepted: null,
    finalSource: "kg",
    knowledgeGraphId: kgResult.knowledgeGraphId,
    kgConfidence: 1,
    canonicalTopics: kgResult.topics.map((topic) => topic.canonicalTopicId),
    goalId: input.goalId,
    reasons: [reason],
  });

  return {
    roadmap,
    source: "kg",
    fallbackReason: reason,
  };
}

export async function generateRoadmapForOnboarding(
  input: OnboardingInput,
  twinId: string,
  startTimestamp: string,
  context?: RoadmapGenerationContext,
): Promise<GenerateRoadmapResult> {
  const startedAt = Date.now();
  const resolvedGraph = resolveKnowledgeGraph(input.goalTitle, input.goalCategory, [
    input.goalSlug,
    input.goalId,
  ]);
  const kgResolved = resolvedGraph.status === "resolved" && Boolean(resolvedGraph.graph);

  if (isAnyAiProviderConfigured()) {
    const aiResult = await generateRoadmapWithGemini(input, context);

    if (aiResult.ok) {
      const roadmap = aiResult.kg
        ? buildRoadmapFromValidatedAiMilestones(
            aiResult.data.milestones,
            aiResult.kg.normalizedTopics,
            aiResult.kg.knowledgeGraphId,
            input.goalId,
            twinId,
            startTimestamp,
          )
        : buildRoadmapFromAiMilestones(
            aiResult.data.milestones,
            input.goalId,
            twinId,
            startTimestamp,
          );
      const summary = summarizeRoadmap(roadmap);

      logAiProviderSuccess({
        flow: "roadmap",
        provider: aiResult.provider,
        model: aiResult.model,
        goalId: input.goalId,
      });

      logKgPipelineDev({
        flow: "roadmap",
        providersTried: [
          ...(aiResult.attempts?.map((attempt) => attempt.provider) ?? []),
          aiResult.provider,
        ],
        providerAccepted: aiResult.provider,
        finalSource: aiResult.provider,
        knowledgeGraphId: aiResult.kg?.knowledgeGraphId ?? null,
        kgConfidence: aiResult.kg?.confidence ?? resolvedGraph.confidence,
        canonicalTopics: aiResult.kg?.normalizedTopics.map((topic) => topic.canonicalTopicId),
        goalId: input.goalId,
      });

      logRoadmapGenerationDevVerification({
        goalId: input.goalId,
        source: "ai",
        model: aiResult.model,
        durationMs: Date.now() - startedAt,
        milestoneCount: summary.milestoneCount,
        taskCount: summary.taskCount,
      });

      return { roadmap, source: "ai" };
    }

    // Gemini + Grok failed. Prefer KG curriculum when the goal resolves.
    if (kgResolved && !isAwsCertificationGoal(input.goalSlug)) {
      const kgFallback = tryBuildKgRoadmapFallback(
        input,
        twinId,
        startTimestamp,
        aiResult.reason,
      );
      if (kgFallback) {
        logAiProviderSuccess({
          flow: "roadmap",
          provider: "deterministic",
          goalId: input.goalId,
        });

        logRoadmapGenerationDevVerification({
          goalId: input.goalId,
          source: "kg",
          model: getRoadmapGeminiModel(),
          durationMs: Date.now() - startedAt,
          milestoneCount: summarizeRoadmap(kgFallback.roadmap).milestoneCount,
          taskCount: summarizeRoadmap(kgFallback.roadmap).taskCount,
          fallbackReason: aiResult.reason,
        });

        return {
          roadmap: kgFallback.roadmap,
          source: "kg",
          fallbackReason: aiResult.reason,
        };
      }
    }

    // AWS SAA keeps the seed path. Non-KG goals use universal deterministic (never random KG).
    if (isAwsCertificationGoal(input.goalSlug) || !kgResolved) {
      const deterministic = buildDeterministicRoadmap(
        input,
        twinId,
        startTimestamp,
        context,
        kgResolved ? aiResult.reason : "unsupported-curriculum",
      );

      logAiProviderSuccess({
        flow: "roadmap",
        provider: "deterministic",
        goalId: input.goalId,
      });

      logKgPipelineDev({
        flow: "roadmap",
        providersTried: aiResult.attempts?.map((attempt) => attempt.provider) ?? [
          "gemini",
          "grok",
        ],
        providerAccepted: null,
        finalSource: "deterministic",
        knowledgeGraphId: null,
        kgConfidence: resolvedGraph.confidence,
        goalId: input.goalId,
        reasons: [
          kgResolved
            ? aiResult.reason
            : "unsupported-curriculum: no high-confidence knowledge graph",
        ],
      });

      logRoadmapGenerationDevVerification({
        goalId: input.goalId,
        source: "deterministic",
        model: getRoadmapGeminiModel(),
        durationMs: Date.now() - startedAt,
        milestoneCount: deterministic.milestoneCount,
        taskCount: deterministic.taskCount,
        fallbackReason: kgResolved ? aiResult.reason : "unsupported-curriculum",
      });

      return {
        roadmap: deterministic.roadmap,
        source: "deterministic",
        fallbackReason: kgResolved ? aiResult.reason : "unsupported-curriculum",
      };
    }

    // KG-resolved but buildKgRoadmap failed unexpectedly — AWS-safe deterministic only for AWS.
    const deterministic = buildDeterministicRoadmap(
      input,
      twinId,
      startTimestamp,
      context,
      aiResult.reason,
    );

    logRoadmapGenerationDevVerification({
      goalId: input.goalId,
      source: "deterministic",
      model: getRoadmapGeminiModel(),
      durationMs: Date.now() - startedAt,
      milestoneCount: deterministic.milestoneCount,
      taskCount: deterministic.taskCount,
      fallbackReason: aiResult.reason,
    });

    return {
      roadmap: deterministic.roadmap,
      source: "deterministic",
      fallbackReason: aiResult.reason,
    };
  }

  // No providers configured.
  if (kgResolved && !isAwsCertificationGoal(input.goalSlug)) {
    const kgFallback = tryBuildKgRoadmapFallback(
      input,
      twinId,
      startTimestamp,
      "missing-api-key",
    );
    if (kgFallback) {
      logRoadmapGenerationDevVerification({
        goalId: input.goalId,
        source: "kg",
        durationMs: Date.now() - startedAt,
        milestoneCount: summarizeRoadmap(kgFallback.roadmap).milestoneCount,
        taskCount: summarizeRoadmap(kgFallback.roadmap).taskCount,
        fallbackReason: "missing-api-key",
      });

      return {
        roadmap: kgFallback.roadmap,
        source: "kg",
        fallbackReason: "missing-api-key",
      };
    }
  }

  const deterministic = buildDeterministicRoadmap(
    input,
    twinId,
    startTimestamp,
    context,
    kgResolved ? "missing-api-key" : "unsupported-curriculum",
  );

  logRoadmapGenerationDevVerification({
    goalId: input.goalId,
    source: "deterministic",
    durationMs: Date.now() - startedAt,
    milestoneCount: deterministic.milestoneCount,
    taskCount: deterministic.taskCount,
    fallbackReason: kgResolved ? "missing-api-key" : "unsupported-curriculum",
  });

  return {
    roadmap: deterministic.roadmap,
    source: "deterministic",
    fallbackReason: kgResolved ? "missing-api-key" : "unsupported-curriculum",
  };
}
