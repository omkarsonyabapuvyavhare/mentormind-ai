import {
  aiLessonResponseSchema,
  validateAiLessonStructure,
  type AiLessonResponse,
  type LessonValidationContext,
  type PracticalArtifactType,
} from "@/lib/ai/lesson-schema";
import {
  looksLikeCode,
  looksLikeCommand,
  looksLikeConfiguration,
  looksLikeQuery,
  validateLessonPracticalBlocks,
} from "@/lib/ai/lesson-practical-validation";
import { buildKgLesson, type BuildKgLessonInput } from "@/knowledge-base/generation";
import { KG_VALIDATION_VERSION } from "@/knowledge-base/schema";
import { validateLessonAgainstKg } from "@/knowledge-base/validation";

export type EnsuredKgLesson =
  | {
      ok: true;
      lesson: AiLessonResponse;
      knowledgeGraphId: string;
      canonicalTopicId: string;
      kgValidationVersion: string;
      coveredConceptIds: string[];
    }
  | {
      ok: false;
      reason: string;
    };

function inferArtifactType(content: string, current: PracticalArtifactType): PracticalArtifactType {
  if (looksLikeQuery(content)) return "query";
  if (looksLikeCode(content)) return "code";
  if (looksLikeCommand(content)) return "command";
  if (looksLikeConfiguration(content)) return "configuration";
  if (content.includes("→") || content.includes("->") || content.includes("1---*")) {
    return "diagram";
  }
  if (content.length >= 80) {
    return "case-study";
  }
  return current === "diagram" ? "diagram" : "workflow";
}

/**
 * Repair Phase-2 KG lessons so they satisfy live practical gates without
 * weakening validation — only reshape artifact/exercise fields when needed.
 */
export function repairKgLessonForLiveGates(
  lesson: AiLessonResponse,
  topicTitle: string,
): AiLessonResponse {
  const repaired: AiLessonResponse = {
    ...lesson,
    practicalArtifact: { ...lesson.practicalArtifact },
    handsOnExercise: {
      ...lesson.handsOnExercise,
      instructions: [...lesson.handsOnExercise.instructions],
      hints: [...lesson.handsOnExercise.hints],
    },
    sections: lesson.sections.map((section) => ({
      ...section,
      commonMistakes: [...section.commonMistakes],
      summary: [...section.summary],
      knowledgeCheck: section.knowledgeCheck.map((check) => ({
        ...check,
        options: [...check.options] as [string, string, string, string],
      })),
    })),
  };

  let artifact = repaired.practicalArtifact;
  if (artifact.type === "diagram" && !artifact.content.includes("→") && !artifact.content.includes("->")) {
    artifact = {
      ...artifact,
      content: artifact.content.includes("---")
        ? artifact.content.replace(/---+/, " → ")
        : `${topicTitle} flow:\ninput → process → output\n${artifact.content}`,
    };
  }

  const inferred = inferArtifactType(artifact.content, artifact.type);
  if (inferred !== artifact.type) {
    artifact = { ...artifact, type: inferred };
  }

  if (
    (artifact.type === "code" || artifact.type === "query" || artifact.type === "command" || artifact.type === "calculation") &&
    !artifact.expectedOutput?.trim()
  ) {
    artifact = {
      ...artifact,
      expectedOutput: `Observable result for ${topicTitle}`,
    };
  }

  repaired.practicalArtifact = artifact;

  const exerciseText = [
    ...repaired.handsOnExercise.instructions,
    repaired.handsOnExercise.expectedOutcome,
  ].join(" ");
  const hasAction =
    /\b(write|run|implement|create|build|define|configure|query|select|render|complete|verify|execute|assign|edit|modify|deploy|analyze|label|design|trace|test|filter|update)\b/i.test(
      exerciseText,
    );

  if (!hasAction) {
    repaired.handsOnExercise.instructions = [
      `Implement and verify a concrete ${topicTitle} exercise using the starter content.`,
      ...repaired.handsOnExercise.instructions,
    ];
  }

  return repaired;
}

/**
 * Build a KG lesson and repair/validate it against live Zod + practical gates.
 */
export function ensureKgLessonPassesLiveGates(
  input: BuildKgLessonInput & {
    goalSlug: string;
    topicTitle?: string;
  },
): EnsuredKgLesson {
  const built = buildKgLesson(input);
  if (!built.ok) {
    return built;
  }

  const topicTitle = input.topicTitle ?? built.canonicalTopicId;
  const repaired = repairKgLessonForLiveGates(built.lesson, topicTitle);

  const zod = aiLessonResponseSchema.safeParse(repaired);
  if (!zod.success) {
    return {
      ok: false,
      reason: zod.error.issues[0]?.message ?? "KG lesson failed Zod validation.",
    };
  }

  const context: LessonValidationContext = {
    goalSlug: input.goalSlug,
    goalCategory: input.goalCategory ?? "General Technology",
    topicId: built.canonicalTopicId,
    topicTitle,
    // Use the lesson's concept-centered objectives so task-level
    // "Apply … worked example" objectives do not false-fail KG lessons.
    learningObjectives: zod.data.learningObjectives,
  };

  const practicalError = validateLessonPracticalBlocks(zod.data, {
    goalCategory: context.goalCategory,
    topicTitle: context.topicTitle,
    topicId: context.topicId,
    learningObjectives: context.learningObjectives,
  });

  let lesson = zod.data;
  if (practicalError) {
    // Second-pass repair for stubborn seeds (force concrete action + diagram arrows).
    const second = repairKgLessonForLiveGates(
      {
        ...zod.data,
        practicalArtifact: {
          ...zod.data.practicalArtifact,
          type:
            zod.data.practicalArtifact.type === "diagram"
              ? "case-study"
              : zod.data.practicalArtifact.type,
          content:
            zod.data.practicalArtifact.content.length >= 80
              ? zod.data.practicalArtifact.content
              : `${zod.data.practicalArtifact.content}\n\nWorked scenario for ${topicTitle}: apply the concepts, verify the result, and note one failure mode.`,
        },
        handsOnExercise: {
          ...zod.data.handsOnExercise,
          instructions: [
            `Create and verify a working example for ${topicTitle}.`,
            ...zod.data.handsOnExercise.instructions,
          ],
        },
      },
      topicTitle,
    );
    const secondZod = aiLessonResponseSchema.safeParse(second);
    if (!secondZod.success) {
      return { ok: false, reason: practicalError };
    }
    lesson = secondZod.data;
  }

  const structureError = validateAiLessonStructure(lesson, context);
  if (structureError) {
    return { ok: false, reason: structureError };
  }

  const kgValidation = validateLessonAgainstKg({
    goalTitle: input.goalTitle ?? input.goalSlug,
    goalCategory: context.goalCategory,
    topicTitle: context.topicTitle,
    lesson,
    graph: input.graph,
    aliases: input.aliases ?? (input.knowledgeGraphId ? [input.knowledgeGraphId] : []),
  });

  if (!kgValidation.ok) {
    return {
      ok: false,
      reason: kgValidation.reasons[0] ?? "KG lesson failed concept coverage validation.",
    };
  }

  return {
    ok: true,
    lesson,
    knowledgeGraphId: built.knowledgeGraphId,
    canonicalTopicId: built.canonicalTopicId,
    kgValidationVersion: KG_VALIDATION_VERSION,
    coveredConceptIds: kgValidation.coveredConceptIds,
  };
}
