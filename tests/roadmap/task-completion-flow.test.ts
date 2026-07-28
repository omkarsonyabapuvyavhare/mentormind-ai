import { describe, expect, it } from "vitest";

import { buildDeterministicTopicAssessment } from "@/lib/assessment/assessment-fallback";
import { createDeterministicRoadmapFromOnboarding } from "@/lib/ai/roadmap-deterministic";
import { formatTopicTitle } from "@/lib/format/topic-title";
import { inferFocusAreas } from "@/lib/goals/goal-identity";
import { createTwinFromOnboarding } from "@/lib/onboarding/create-from-input";
import {
  createDraftFromParsedIntent,
  draftToOnboardingInput,
} from "@/lib/onboarding/onboarding-draft";
import { parseGoalIntentDeterministic } from "@/lib/onboarding/parse-intent-deterministic";
import {
  applyQuizSubmissionTaskCompletion,
  findPendingRoadmapTask,
  resolveLessonTaskId,
  resolveQuizTaskId,
  summarizeRoadmapTaskStatuses,
} from "@/lib/roadmap/complete-roadmap-task";
import {
  buildPresenterQuizCompletedEvent,
  PRESENTER_MASTERY_SCORE,
  PRESENTER_WEAK_SCORE,
} from "@/lib/presenter/simulate-quiz-score";
import { selectTodayMission } from "@/lib/tutor/mission";
import {
  computeRoadmapCompletion,
  selectInjectedRemedialTaskCount,
  selectRoadmapCompletion,
} from "@/stores/selectors";
import { createTestAppStore } from "@/stores/use-app-store";
import { initialAppState } from "@/stores/store-types";
import type { TaskStatus } from "@/types/roadmap";

const START = "2026-07-17T00:00:00.000Z";

function buildPythonLearnerStore() {
  const store = createTestAppStore();
  const parsed = parseGoalIntentDeterministic("I want to learn Python in 8 weeks.")!;
  const draft = createDraftFromParsedIntent(parsed, "I want to learn Python in 8 weeks.");
  draft.skillLevel = { value: "beginner", source: "manual" };
  draft.skillLevelConfirmed = true;

  const input = draftToOnboardingInput(draft);
  const twin = createTwinFromOnboarding(input, START);
  const { roadmap } = createDeterministicRoadmapFromOnboarding(input, twin.id, START, {
    goal: input.goalTitle,
    recommendedFocusAreas: inferFocusAreas(input.goalTitle, input.goalCategory),
  });

  store.setState({
    ...initialAppState,
    isInitialized: true,
    isHydrated: true,
    twin,
    roadmap,
  });

  return store;
}

function buildAssessment(store: ReturnType<typeof buildPythonLearnerStore>) {
  const state = store.getState();
  const mission = selectTodayMission(state);
  return {
    mission,
    assessment: buildDeterministicTopicAssessment({
      topicId: mission.topicId,
      topicTitle: formatTopicTitle(mission.topicId),
      goalSlug: state.roadmap!.goalId,
      goalCategory: state.twin!.goal.category,
      learningObjectives: ["Understand core concepts"],
      sections: [
        {
          heading: "Foundations",
          summary: ["Key idea"],
          content: "Practice concept application.",
        },
      ],
    }),
  };
}

describe("roadmap task completion flow", () => {
  it("fresh Python journey starts at 0% with all tasks pending", () => {
    const store = buildPythonLearnerStore();
    const completion = selectRoadmapCompletion(store.getState());

    expect(completion.completedTasks).toBe(0);
    expect(completion.percentage).toBe(0);
    expect(completion.totalTasks).toBeGreaterThan(0);
    expect(summarizeRoadmapTaskStatuses(store.getState().roadmap!.tasks)).toMatchObject({
      pending: completion.totalTasks,
      completed: 0,
      skipped: 0,
    });
  });

  it("uses canonical task status values only", () => {
    const allowed: TaskStatus[] = ["pending", "in_progress", "completed", "skipped"];
    const store = buildPythonLearnerStore();

    for (const task of store.getState().roadmap!.tasks) {
      expect(allowed).toContain(task.status);
      expect(["complete", "done", "mastered"]).not.toContain(task.status);
    }
  });

  it("matches lesson and quiz tasks by shared topicId", () => {
    const store = buildPythonLearnerStore();
    const { mission } = buildAssessment(store);
    const tasks = store.getState().roadmap!.tasks.filter((task) => task.topicId === mission.topicId);

    expect(tasks.some((task) => task.type === "lesson")).toBe(true);
    expect(tasks.some((task) => task.type === "quiz")).toBe(true);
    expect(resolveLessonTaskId(store.getState().roadmap, mission.topicId)).toBeTruthy();
    expect(resolveQuizTaskId(store.getState().roadmap, mission.topicId)).toBeTruthy();
  });

  it("completing a lesson marks its roadmap task completed and increases percentage", () => {
    const store = buildPythonLearnerStore();
    const { mission } = buildAssessment(store);
    const lessonTaskId = resolveLessonTaskId(store.getState().roadmap, mission.topicId)!;
    const before = selectRoadmapCompletion(store.getState());

    store.getState().completeTask(lessonTaskId, START);

    const after = store.getState();
    const completion = selectRoadmapCompletion(after);
    expect(after.roadmap?.tasks.find((task) => task.id === lessonTaskId)?.status).toBe("completed");
    expect(completion.completedTasks).toBe(before.completedTasks + 1);
    expect(completion.percentage).toBeGreaterThan(before.percentage);
  });

  it("completing an assessment marks its quiz task completed and increases percentage again", () => {
    const store = buildPythonLearnerStore();
    const { mission, assessment } = buildAssessment(store);
    const lessonTaskId = resolveLessonTaskId(store.getState().roadmap, mission.topicId)!;
    const quizTaskId = resolveQuizTaskId(store.getState().roadmap, mission.topicId)!;

    store.getState().completeTask(lessonTaskId, START);
    const afterLesson = selectRoadmapCompletion(store.getState());

    store.getState().dispatchLearnerEvent(
      buildPresenterQuizCompletedEvent(assessment, PRESENTER_MASTERY_SCORE, "2026-07-18T12:00:00.000Z"),
    );

    const afterQuiz = store.getState();
    const completion = selectRoadmapCompletion(afterQuiz);
    expect(afterQuiz.roadmap?.tasks.find((task) => task.id === quizTaskId)?.status).toBe("completed");
    expect(completion.completedTasks).toBe(afterLesson.completedTasks + 1);
    expect(completion.percentage).toBeGreaterThan(afterLesson.percentage);
  });

  it("42% remediation increases denominator without marking quiz incomplete", () => {
    const store = buildPythonLearnerStore();
    const { mission, assessment } = buildAssessment(store);
    const lessonTaskId = resolveLessonTaskId(store.getState().roadmap, mission.topicId)!;
    const quizTaskId = resolveQuizTaskId(store.getState().roadmap, mission.topicId)!;

    store.getState().completeTask(lessonTaskId, START);
    store.getState().dispatchLearnerEvent(
      buildPresenterQuizCompletedEvent(assessment, PRESENTER_WEAK_SCORE, "2026-07-18T12:00:00.000Z"),
    );

    const completion = selectRoadmapCompletion(store.getState());
    expect(store.getState().roadmap?.tasks.find((task) => task.id === quizTaskId)?.status).toBe("completed");
    expect(selectInjectedRemedialTaskCount(store.getState())).toBeGreaterThan(0);
    expect(completion.totalTasks).toBeGreaterThan(completion.completedTasks);
  });

  it("95% mastery removes injected remedial tasks from the roadmap", () => {
    const store = buildPythonLearnerStore();
    const { mission, assessment } = buildAssessment(store);
    const lessonTaskId = resolveLessonTaskId(store.getState().roadmap, mission.topicId)!;

    store.getState().completeTask(lessonTaskId, START);
    store.getState().dispatchLearnerEvent(
      buildPresenterQuizCompletedEvent(assessment, PRESENTER_WEAK_SCORE, "2026-07-18T12:00:00.000Z"),
    );

    const revisionTask = findPendingRoadmapTask(
      store.getState().roadmap!.tasks,
      mission.topicId,
      "revision",
    );
    expect(revisionTask).toBeTruthy();

    store.getState().dispatchLearnerEvent(
      buildPresenterQuizCompletedEvent(assessment, PRESENTER_MASTERY_SCORE, "2026-07-24T18:00:00.000Z"),
    );

    expect(
      store.getState().roadmap?.tasks.some((task) => task.id === revisionTask!.id),
    ).toBe(false);
  });

  it("applyQuizSubmissionTaskCompletion prefers quiz before revision", () => {
    const store = buildPythonLearnerStore();
    const topicId = selectTodayMission(store.getState()).topicId;
    const roadmap = store.getState().roadmap!;
    const quizTask = findPendingRoadmapTask(roadmap.tasks, topicId, "quiz")!;

    const updated = applyQuizSubmissionTaskCompletion(roadmap, topicId);
    expect(updated.tasks.find((task) => task.id === quizTask.id)?.status).toBe("completed");
  });

  it("computeRoadmapCompletion respects completed task statuses", () => {
    const store = buildPythonLearnerStore();
    const tasks = store.getState().roadmap!.tasks.map((task, index) =>
      index === 0 ? { ...task, status: "completed" as const } : task,
    );

    const completion = computeRoadmapCompletion(tasks);
    expect(completion.completedTasks).toBe(1);
    expect(completion.percentage).toBe(Math.round((1 / completion.totalTasks) * 100));
  });
});
