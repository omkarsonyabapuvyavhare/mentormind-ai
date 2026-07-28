import type { LearningTask, Roadmap, TaskType } from "@/types/roadmap";

export interface RoadmapTaskStatusDistribution {
  pending: number;
  in_progress: number;
  completed: number;
  skipped: number;
}

export function summarizeRoadmapTaskStatuses(tasks: LearningTask[]): RoadmapTaskStatusDistribution {
  const distribution: RoadmapTaskStatusDistribution = {
    pending: 0,
    in_progress: 0,
    completed: 0,
    skipped: 0,
  };

  for (const task of tasks) {
    switch (task.status) {
      case "pending":
        distribution.pending += 1;
        break;
      case "in_progress":
        distribution.in_progress += 1;
        break;
      case "completed":
        distribution.completed += 1;
        break;
      case "skipped":
        distribution.skipped += 1;
        break;
      default:
        break;
    }
  }

  return distribution;
}

export function findPendingRoadmapTask(
  tasks: LearningTask[],
  topicId: string,
  types: TaskType | TaskType[],
): LearningTask | null {
  const typeSet = new Set(Array.isArray(types) ? types : [types]);
  const candidates = tasks.filter(
    (task) =>
      task.topicId === topicId &&
      typeSet.has(task.type) &&
      task.status !== "completed" &&
      task.status !== "skipped",
  );

  if (candidates.length === 0) {
    return null;
  }

  return [...candidates].sort((a, b) => a.priority - b.priority)[0] ?? null;
}

export function markRoadmapTaskCompleted(roadmap: Roadmap, taskId: string): Roadmap {
  return {
    ...roadmap,
    tasks: roadmap.tasks.map((task) =>
      task.id === taskId && task.status !== "completed"
        ? { ...task, status: "completed" as const }
        : task,
    ),
  };
}

/** Mark the quiz task complete after assessment submission. */
export function applyQuizSubmissionTaskCompletion(
  roadmap: Roadmap,
  topicId: string,
): Roadmap {
  const quizTask = findPendingRoadmapTask(roadmap.tasks, topicId, "quiz");
  if (quizTask) {
    return markRoadmapTaskCompleted(roadmap, quizTask.id);
  }

  return roadmap;
}

export function resolveLessonTaskId(roadmap: Roadmap | null | undefined, topicId: string): string | null {
  if (!roadmap) {
    return null;
  }

  return findPendingRoadmapTask(roadmap.tasks, topicId, "lesson")?.id ?? null;
}

export function resolveQuizTaskId(roadmap: Roadmap | null | undefined, topicId: string): string | null {
  if (!roadmap) {
    return null;
  }

  return findPendingRoadmapTask(roadmap.tasks, topicId, "quiz")?.id ?? null;
}
