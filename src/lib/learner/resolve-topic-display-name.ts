import { formatTopicTitle } from "@/lib/format/topic-title";
import type { AppState } from "@/stores/store-types";
import { selectLastQuizEvent } from "@/stores/selectors";

/** Strip task suffixes like "Cluster Architecture — Core Lesson". */
function cleanRoadmapTaskTitle(title: string): string {
  return title.replace(/\s*(—|-)\s*.+$/, "").trim() || title;
}

/**
 * Deterministic topic label for post-assessment UI.
 * Priority: roadmap task title → twin topic name → formatted topicId.
 * Never calls Gemini and never uses AWS/VPC seed name maps.
 */
export function resolveTopicDisplayName(
  state: Pick<AppState, "twin" | "roadmap">,
  topicId: string,
): string {
  const roadmapTask = state.roadmap?.tasks.find((task) => task.topicId === topicId);
  if (roadmapTask?.title?.trim()) {
    return cleanRoadmapTaskTitle(roadmapTask.title);
  }

  const fromTwin =
    state.twin?.strengths.find((entry) => entry.topicId === topicId)?.topicName ??
    state.twin?.weaknesses.find((entry) => entry.topicId === topicId)?.topicName ??
    state.twin?.knownChallenges.find((entry) => entry.topicId === topicId)?.topicName;

  if (fromTwin?.trim()) {
    return fromTwin;
  }

  return formatTopicTitle(topicId);
}

/** Topic id from the most recent QUIZ_COMPLETED event — the active assessment. */
export function resolveActiveAssessmentTopicId(
  state: Pick<AppState, "learnerEvents">,
): string | null {
  return selectLastQuizEvent(state)?.topicId ?? null;
}

export function resolveActiveAssessmentTopicName(
  state: Pick<AppState, "twin" | "roadmap" | "learnerEvents">,
): string {
  const topicId = resolveActiveAssessmentTopicId(state);
  if (!topicId) {
    return "This topic";
  }

  return resolveTopicDisplayName(state, topicId);
}
