import { beforeEach, describe, expect, it } from "vitest";

import { awsSaaQuizzes } from "@/data/aws-saa-seed";
import {
  shouldShowInactivityShortcut,
} from "@/lib/demo/session-actions";
import { selectLatestDecision, selectWeakTopics } from "@/stores/selectors";
import { createTestAppStore } from "@/stores/use-app-store";

const DEMO_ENTRY = "2026-07-17T09:00:00.000Z";
const QUIZ_FAIL = "2026-07-24T18:00:00.000Z";

function diagnose(state: ReturnType<ReturnType<typeof createTestAppStore>["getState"]>) {
  const latestDecision = selectLatestDecision(state);
  const latestQuiz = state.twin?.quizHistory[state.twin.quizHistory.length - 1];

  return {
    demoMode: state.demoMode,
    demoStepIndex: state.demoStepIndex,
    latestQuizScore: latestQuiz?.score ?? null,
    latestDecisionType: latestDecision?.eventType ?? null,
    latestDecisionReasons: latestDecision?.reasons ?? [],
    weakTopics: selectWeakTopics(state).map((topic) => topic.topicId),
    hasInactivityDecision: state.decisions.some((decision) =>
      decision.reasons.includes("INACTIVITY_ESCALATION"),
    ),
    unreadInactivityNudges: state.nudges.filter(
      (nudge) => !nudge.read && (nudge.id.includes("inactivity") || /inactive/i.test(nudge.body)),
    ).length,
    shouldShow: shouldShowInactivityShortcut(state),
  };
}

describe("inactivity shortcut after full weak-performance flow", () => {
  let store: ReturnType<typeof createTestAppStore>;

  beforeEach(() => {
    store = createTestAppStore();
  });

  it("shows after Start Live Demo path through plan dismiss", () => {
    store.getState().enterDemoFromLanding(DEMO_ENTRY);

    const afterEntry = diagnose(store.getState());
    expect(afterEntry.demoMode).toBe(true);
    expect(afterEntry.shouldShow).toBe(false);

    const questionCount = awsSaaQuizzes["vpc-networking"].questions.length;
    store.getState().dispatchLearnerEvent({
      type: "QUIZ_COMPLETED",
      topicId: "vpc-networking",
      score: 42,
      totalQuestions: questionCount,
      timestamp: QUIZ_FAIL,
    });

    const afterQuiz = diagnose(store.getState());
    expect(afterQuiz.latestDecisionReasons).toContain("QUIZ_BELOW_THRESHOLD");
    expect(afterQuiz.shouldShow).toBe(true);

    store.getState().showAdaptationReveal("weakness", 42);
    store.getState().dismissAdaptationReveal();

    const afterPlan = diagnose(store.getState());
    expect(afterPlan.demoMode).toBe(true);
    expect(afterPlan.latestDecisionReasons).toContain("QUIZ_BELOW_THRESHOLD");
    expect(afterPlan.shouldShow).toBe(true);
  });
});
