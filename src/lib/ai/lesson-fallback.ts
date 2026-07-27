import { isAwsCertificationGoal } from "@/lib/goals/goal-identity";
import { getAwsSeedLessonContent, type LessonContent } from "@/data/lesson-content";
import type { GeneratedLesson } from "@/lib/ai/lesson-schema";
import { formatTopicTitle } from "@/lib/format/topic-title";

export { formatTopicTitle } from "@/lib/format/topic-title";

export interface LessonFallbackContext {
  goalId: string;
  topicId: string;
  topicTitle: string;
  durationMinutes?: number;
}

function legacyLessonToGenerated(legacy: LessonContent): GeneratedLesson {
  return {
    topicId: legacy.topicId,
    source: "deterministic",
    title: legacy.title,
    estimatedMinutes: legacy.estimatedMinutes,
    learningObjectives: [legacy.subtitle],
    sections: legacy.concepts.map((concept) => ({
      heading: concept.title,
      content: concept.body,
      practicalExample: legacy.diagramCaption,
      commonMistakes: ["Skipping hands-on practice with the concepts covered."],
      summary: [legacy.takeaway],
      knowledgeCheck: [
        {
          question: `Which idea best summarizes ${concept.title}?`,
          options: [
            concept.body.slice(0, 80),
            "Ignore foundational concepts and move to advanced topics immediately.",
            "Memorize service names without understanding use cases.",
            "Avoid reviewing mistakes after practice.",
          ],
          correctIndex: 0,
          explanation: "Focus on the core idea from this section before advancing.",
        },
      ],
    })),
  };
}

function buildGenericLesson(context: LessonFallbackContext): GeneratedLesson {
  const title = context.topicTitle || formatTopicTitle(context.topicId);
  const minutes = context.durationMinutes ?? 45;

  return {
    topicId: context.topicId,
    source: "deterministic",
    title,
    estimatedMinutes: minutes,
    learningObjectives: [
      `Understand the core ideas behind ${title}`,
      `Apply ${title} concepts to realistic learning scenarios`,
      `Identify common mistakes learners make in ${title}`,
    ],
    sections: [
      {
        heading: `Foundations of ${title}`,
        content: `${title} is a key topic in your personalized learning path. Start with the core vocabulary, how the pieces fit together, and why the topic matters for your goal.`,
        practicalExample: `Imagine you are explaining ${title} to a teammate who needs a concise overview before a project milestone.`,
        commonMistakes: [
          "Trying to memorize details before understanding the overall model",
          "Skipping practice because the topic feels familiar",
        ],
        summary: [
          `Anchor your study of ${title} in practical use cases tied to your goal.`,
        ],
        knowledgeCheck: [
          {
            question: `What is the best first step when learning ${title}?`,
            options: [
              "Understand the core concepts and how they connect",
              "Memorize every detail without context",
              "Skip foundational review entirely",
              "Jump directly to the hardest advanced scenario",
            ],
            correctIndex: 0,
            explanation: "Strong foundations make later practice and assessments more effective.",
          },
        ],
      },
      {
        heading: `Applying ${title}`,
        content: `Move from theory to practice by connecting ${title} to the tasks in your roadmap. Focus on one realistic scenario, walk through the decisions you would make, and note where you need more depth.`,
        practicalExample: `Pick one milestone from your roadmap and describe how ${title} supports that milestone outcome.`,
        commonMistakes: [
          "Studying in isolation without linking back to the roadmap",
          "Ignoring weak areas that appear in knowledge checks",
        ],
        summary: [
          `Use your roadmap milestones as the context for practicing ${title}.`,
        ],
        knowledgeCheck: [
          {
            question: `How should ${title} connect to your learning plan?`,
            options: [
              "Relate it to upcoming roadmap tasks and milestones",
              "Treat it as unrelated background reading",
              "Study it once and never revisit it",
              "Avoid checking understanding with practice questions",
            ],
            correctIndex: 0,
            explanation: "Lessons are most valuable when they support your active roadmap tasks.",
          },
        ],
      },
    ],
  };
}

function buildAzureGenericLesson(context: LessonFallbackContext): GeneratedLesson {
  const title = context.topicTitle || formatTopicTitle(context.topicId);

  return {
    ...buildGenericLesson(context),
    title: title.includes("Azure") ? title : `Azure: ${title}`,
    learningObjectives: [
      `Explain ${title} in the context of Microsoft Azure fundamentals`,
      "Connect the topic to AZ-900-style cloud concepts",
      "Recognize common misunderstandings before moving forward",
    ],
  };
}

export function resolveDeterministicLesson(context: LessonFallbackContext): GeneratedLesson {
  if (isAwsCertificationGoal(context.goalId)) {
    const legacy = getAwsSeedLessonContent(context.topicId);
    return legacyLessonToGenerated(legacy);
  }

  return buildGenericLesson(context);
}

export interface DeterministicLessonInput {
  goalId: string;
  topicId: string;
  topicTitle: string;
  durationMinutes?: number;
}

export function createDeterministicLessonForLearner(
  input: DeterministicLessonInput,
  reason = "deterministic-request",
): { lesson: GeneratedLesson; source: "deterministic"; fallbackReason: string } {
  const lesson = resolveDeterministicLesson({
    goalId: input.goalId,
    topicId: input.topicId,
    topicTitle: input.topicTitle,
    durationMinutes: input.durationMinutes,
  });

  return {
    lesson,
    source: "deterministic",
    fallbackReason: reason,
  };
}
