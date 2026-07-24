import { routes } from "@/constants/routes";
import { formatInactivityLastSeenLabel } from "@/lib/learner/engagement-display";
import { selectLearnerGoalLabel, withGoalReference } from "@/lib/ai/reasoning-summary";
import { selectTodayMission } from "@/lib/tutor/mission";
import type { AppState } from "@/stores/store-types";
import {
  selectDecisionTransparency,
  selectLatestDecision,
  selectUnreadNudges,
  selectWeakestTopic,
  selectWeakTopics,
} from "@/stores/selectors";
import type { Decision } from "@/types/decisions";
import type { Nudge } from "@/types/nudge";

export type AccountabilityTemplateId =
  | "inactivity"
  | "performance_recovery"
  | "mastery_celebration";

export interface AccountabilityPartnerAction {
  label: "Resume Today's Session" | "Review Updated Plan" | "Continue Learning";
  href: string;
}

export interface AccountabilityPartnerMessage {
  id: string;
  templateId: AccountabilityTemplateId;
  title: string;
  goal: string;
  signal: string;
  reasoning: string;
  action: AccountabilityPartnerAction;
  severity: Nudge["severity"];
  createdAt: string;
  source: "nudge" | "decision" | "welcome_back";
  lastSeenLabel?: string;
  weakTopicLabel?: string;
}

export function isInactivityNudge(nudge: Nudge): boolean {
  return nudge.id.includes("inactivity") || /inactive/i.test(nudge.body);
}

export function classifyAccountabilityTemplate(
  state: AppState,
  nudge?: Nudge | null,
  decision: Decision | null = selectLatestDecision(state),
): AccountabilityTemplateId | null {
  if (nudge && isInactivityNudge(nudge)) {
    return "inactivity";
  }

  if (decision?.reasons.includes("QUIZ_MASTERY_ACHIEVED")) {
    return "mastery_celebration";
  }

  if (decision?.reasons.includes("QUIZ_BELOW_THRESHOLD")) {
    return "performance_recovery";
  }

  if (decision?.reasons.includes("INACTIVITY_ESCALATION")) {
    return "inactivity";
  }

  if (nudge) {
    return "performance_recovery";
  }

  return null;
}

function buildAction(
  templateId: AccountabilityTemplateId,
  state: AppState,
): AccountabilityPartnerAction {
  const mission = selectTodayMission(state);

  switch (templateId) {
    case "inactivity":
      return { label: "Resume Today's Session", href: mission.lessonHref };
    case "performance_recovery":
      return { label: "Review Updated Plan", href: routes.planUpdated };
    case "mastery_celebration":
      return { label: "Continue Learning", href: routes.dashboard };
  }
}

function buildInactivityMessage(state: AppState, nudge: Nudge): AccountabilityPartnerMessage {
  const goal = selectLearnerGoalLabel(state);
  const weak = selectWeakestTopic(state) ?? selectWeakTopics(state)[0];
  const inactivityDays = Math.max(state.twin?.inactivityDays ?? 0, 3);
  const focusTopic = weak?.topicName ?? "your focus topic";
  const lastSeenLabel = formatInactivityLastSeenLabel(inactivityDays);

  return {
    id: nudge.id,
    templateId: "inactivity",
    title: "Your mentor noticed you've been away",
    goal,
    signal: `${lastSeenLabel} · ${focusTopic}`,
    lastSeenLabel,
    weakTopicLabel: focusTopic,
    reasoning: `Your recent assessment showed ${focusTopic} is still below mastery. To keep your certification plan achievable, today's session has been shortened.`,
    action: buildAction("inactivity", state),
    severity: nudge.severity,
    createdAt: nudge.createdAt,
    source: "nudge",
  };
}

function buildPerformanceMessage(
  state: AppState,
  decision: Decision,
  nudge?: Nudge | null,
): AccountabilityPartnerMessage {
  const goal = selectLearnerGoalLabel(state);
  const transparency = selectDecisionTransparency(state, decision);
  const weak = selectWeakestTopic(state) ?? selectWeakTopics(state)[0];

  return {
    id: nudge?.id ?? `decision-${decision.id}`,
    templateId: "performance_recovery",
    title: "Let's recover this together",
    goal,
    signal: transparency?.trigger ?? `${weak?.topicName ?? "Focus topic"} quiz below threshold`,
    reasoning:
      decision.explanation.split(".")[0] ??
      transparency?.why ??
      `Targeted practice now prevents this gap from blocking ${goal}.`,
    action: buildAction("performance_recovery", state),
    severity: nudge?.severity ?? "warning",
    createdAt: nudge?.createdAt ?? decision.createdAt,
    source: nudge ? "nudge" : "decision",
  };
}

function buildMasteryMessage(
  state: AppState,
  decision: Decision,
  nudge?: Nudge | null,
): AccountabilityPartnerMessage {
  const goal = selectLearnerGoalLabel(state);
  const transparency = selectDecisionTransparency(state, decision);

  return {
    id: nudge?.id ?? `decision-${decision.id}`,
    templateId: "mastery_celebration",
    title: "Mastery unlocked — momentum is on your side",
    goal,
    signal: transparency?.trigger ?? "Mastery achieved on latest assessment",
    reasoning:
      decision.explanation.split(".")[0] ??
      (transparency ? withGoalReference(transparency.expectedBenefit, goal) : `I accelerated your plan because you've proven readiness for the next step toward ${goal}.`),
    action: buildAction("mastery_celebration", state),
    severity: "info",
    createdAt: nudge?.createdAt ?? decision.createdAt,
    source: nudge ? "nudge" : "decision",
  };
}

export function buildAccountabilityPartnerMessage(
  state: AppState,
  templateId: AccountabilityTemplateId,
  nudge?: Nudge | null,
  decision: Decision | null = selectLatestDecision(state),
): AccountabilityPartnerMessage | null {
  if (templateId === "inactivity" && nudge) {
    return buildInactivityMessage(state, nudge);
  }

  if (templateId === "inactivity" && decision?.reasons.includes("INACTIVITY_ESCALATION")) {
    const syntheticNudge: Nudge = {
      id: `synthetic-inactivity-${decision.id}`,
      title: "Stay on track with your AWS goal",
      body: decision.explanation,
      severity: "warning",
      createdAt: decision.createdAt,
      read: false,
    };
    return buildInactivityMessage(state, syntheticNudge);
  }

  if (!decision) {
    return null;
  }

  if (templateId === "mastery_celebration") {
    return buildMasteryMessage(state, decision, nudge);
  }

  if (templateId === "performance_recovery") {
    return buildPerformanceMessage(state, decision, nudge);
  }

  return null;
}

export function buildReturnWelcomeMessage(state: AppState): string {
  const goal = selectLearnerGoalLabel(state);
  const mission = selectTodayMission(state);
  return `Welcome back — returning today keeps ${goal} within reach. Your next step: ${mission.goal}.`;
}

export function selectReturnWelcomeMessage(state: AppState): AccountabilityPartnerMessage | null {
  if (!state.returnWelcomeMessage) {
    return null;
  }

  return {
    id: "welcome-back",
    templateId: "inactivity",
    title: "Great to see you again",
    goal: selectLearnerGoalLabel(state),
    signal: "Consistency restored — you're back on track",
    reasoning: state.returnWelcomeMessage,
    action: buildAction("inactivity", state),
    severity: "info",
    createdAt: new Date().toISOString(),
    source: "welcome_back",
  };
}

export function selectActiveAccountabilityPartner(state: AppState): AccountabilityPartnerMessage | null {
  const welcome = selectReturnWelcomeMessage(state);
  if (welcome) {
    return welcome;
  }

  const unread = selectUnreadNudges(state);
  const latestUnread = unread[unread.length - 1] ?? null;
  const decision = selectLatestDecision(state);

  if (latestUnread) {
    const template = classifyAccountabilityTemplate(state, latestUnread, decision);
    if (template) {
      return buildAccountabilityPartnerMessage(state, template, latestUnread, decision);
    }
  }

  if (state.adaptationReveal?.visible && decision) {
    const template = classifyAccountabilityTemplate(state, null, decision);
    if (template === "performance_recovery" || template === "mastery_celebration") {
      return buildAccountabilityPartnerMessage(state, template, null, decision);
    }
  }

  if (decision?.reasons.includes("INACTIVITY_ESCALATION") && latestUnread) {
    return buildAccountabilityPartnerMessage(state, "inactivity", latestUnread, decision);
  }

  return null;
}

export function selectRoadmapAccountabilityPartner(state: AppState): AccountabilityPartnerMessage | null {
  const partner = selectActiveAccountabilityPartner(state);
  if (!partner) {
    return null;
  }

  if (partner.source === "welcome_back") {
    return null;
  }

  const decision = selectLatestDecision(state);
  const isRoadmapRelevant =
    partner.templateId !== "inactivity" ||
    decision?.reasons.includes("INACTIVITY_ESCALATION") ||
    Boolean(decision?.actions.some((action) => action.action === "UPDATE_ROADMAP_VERSION"));

  return isRoadmapRelevant ? partner : null;
}

export function selectUnreadInactivityNudges(state: AppState): Nudge[] {
  return state.nudges.filter((nudge) => !nudge.read && isInactivityNudge(nudge));
}
