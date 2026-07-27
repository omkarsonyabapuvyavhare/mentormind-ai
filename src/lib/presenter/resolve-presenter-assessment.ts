import { buildAssessmentFromLesson } from "@/lib/assessment/build-lesson-assessment";
import { readCachedAssessment } from "@/lib/assessment/assessment-session-cache";
import { buildDeterministicTopicAssessment } from "@/lib/assessment/assessment-fallback";
import type { TopicAssessment } from "@/lib/assessment/assessment-schema";
import { readCachedLesson } from "@/lib/learn/lesson-session-cache";
import { selectTodayMission } from "@/lib/tutor/mission";
import { resolveTopicTitle } from "@/lib/learn/resolve-lesson-context";
import type { AppState } from "@/stores/store-types";

export function resolvePresenterAssessment(state: AppState): TopicAssessment | null {
  if (!state.isInitialized || !state.roadmap || !state.twin) {
    return null;
  }

  const mission = selectTodayMission(state);
  const topicId = mission.topicId;

  if (!topicId) {
    return null;
  }

  const goalId = state.roadmap.goalId;
  const cached = readCachedAssessment(goalId, topicId);

  if (cached) {
    return cached;
  }

  const lesson = readCachedLesson(goalId, topicId);

  if (lesson) {
    try {
      return buildAssessmentFromLesson(lesson, {
        goalSlug: goalId,
        goalCategory: state.twin.goal.category,
      });
    } catch {
      // fall through to deterministic builder
    }
  }

  return buildDeterministicTopicAssessment({
    topicId,
    topicTitle: resolveTopicTitle(state, topicId),
    goalSlug: goalId,
    goalCategory: state.twin.goal.category,
    learningObjectives: lesson?.learningObjectives ?? [`Understand ${resolveTopicTitle(state, topicId)}`],
    sections:
      lesson?.sections.map((section) => ({
        heading: section.heading,
        summary: section.summary,
        content: section.content,
      })) ?? [
        {
          heading: resolveTopicTitle(state, topicId),
          summary: [`Core concepts for ${resolveTopicTitle(state, topicId)}`],
          content: `Study ${resolveTopicTitle(state, topicId)} fundamentals from your learning plan.`,
        },
      ],
  });
}
