import { demo as demoConstants } from "@/constants/demo";
import { thresholds } from "@/constants/thresholds";
import { awsSaaQuizzes } from "@/data/aws-saa-seed";
import type { LearnerEventPayload } from "@/types";

export interface ExpectedOutcome {
  key: string;
  description: string;
  expected: string | number | boolean;
}

export interface DemoStepDefinition {
  id: string;
  label: string;
  /** INITIALIZE builds twin + roadmap; other steps dispatch learner events. */
  kind: "INITIALIZE" | "EVENT";
  buildEvent?: (timestamp: string) => LearnerEventPayload;
  expectedOutcomes: ExpectedOutcome[];
}

const vpcQuestionCount = awsSaaQuizzes["vpc-networking"].questions.length;

export const demoSteps: DemoStepDefinition[] = [
  {
    id: "initialize-aws-learner",
    label: "Initialize AWS learner",
    kind: "INITIALIZE",
    expectedOutcomes: [
      {
        key: "goalTitle",
        description: "Goal matches AWS SAA demo target",
        expected: demoConstants.goalTitle,
      },
      {
        key: "milestoneCount",
        description: "Eight-week roadmap is generated",
        expected: demoConstants.durationWeeks,
      },
      {
        key: "initialDropoutRisk",
        description: "Dropout risk starts at baseline",
        expected: 10,
      },
    ],
  },
  {
    id: "vpc-quiz-fail",
    label: "Complete VPC quiz with 42%",
    kind: "EVENT",
    buildEvent: (timestamp) => ({
      type: "QUIZ_COMPLETED",
      topicId: demoConstants.primaryTopicId,
      score: demoConstants.weakQuizScore,
      totalQuestions: vpcQuestionCount,
      timestamp,
    }),
    expectedOutcomes: [
      {
        key: "weaknessRecorded",
        description: "VPC Networking is marked as a weakness",
        expected: demoConstants.primaryTopicId,
      },
      {
        key: "tasksAdded",
        description: "Two revision tasks and one lab are injected",
        expected: thresholds.revisionTasksToAdd + thresholds.labTasksToAdd,
      },
      {
        key: "milestoneDelayed",
        description: "Next milestone shifts by configured delay days",
        expected: thresholds.milestoneDelayDays,
      },
      {
        key: "reasonCode",
        description: "Decision includes weak quiz reason",
        expected: "QUIZ_BELOW_THRESHOLD",
      },
    ],
  },
  {
    id: "simulate-inactivity",
    label: "Simulate 3 days of inactivity",
    kind: "EVENT",
    buildEvent: (timestamp) => ({
      type: "INACTIVITY_TICK",
      days: demoConstants.inactivityDays,
      timestamp,
    }),
    expectedOutcomes: [
      {
        key: "inactivityDays",
        description: "Inactivity days reflect simulated gap",
        expected: demoConstants.inactivityDays,
      },
      {
        key: "dropoutRiskIncreased",
        description: "Dropout risk increases on inactivity",
        expected: true,
      },
      {
        key: "nudgeSent",
        description: "A contextual nudge is created",
        expected: true,
      },
      {
        key: "nextTaskShortened",
        description: "Next pending task duration is reduced",
        expected: true,
      },
      {
        key: "reasonCode",
        description: "Decision includes inactivity reason",
        expected: "INACTIVITY_ESCALATION",
      },
    ],
  },
  {
    id: "vpc-quiz-mastery",
    label: "Complete VPC quiz with 95%",
    kind: "EVENT",
    buildEvent: (timestamp) => ({
      type: "QUIZ_COMPLETED",
      topicId: demoConstants.primaryTopicId,
      score: demoConstants.masteryQuizScore,
      totalQuestions: vpcQuestionCount,
      timestamp,
    }),
    expectedOutcomes: [
      {
        key: "weaknessRemoved",
        description: "VPC weakness is cleared after mastery",
        expected: true,
      },
      {
        key: "revisionTasksRemoved",
        description: "Injected revision tasks for VPC are removed",
        expected: true,
      },
      {
        key: "advancedUnlocked",
        description: "Advanced content for VPC is unlocked",
        expected: true,
      },
      {
        key: "roadmapCompressed",
        description: "Roadmap accelerates by configured days",
        expected: thresholds.roadmapAccelerationDays,
      },
      {
        key: "reasonCode",
        description: "Decision includes mastery reason",
        expected: "QUIZ_MASTERY_ACHIEVED",
      },
    ],
  },
];

export function getDemoStepById(stepId: string): DemoStepDefinition | undefined {
  return demoSteps.find((step) => step.id === stepId);
}
