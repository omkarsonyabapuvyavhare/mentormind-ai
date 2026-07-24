/** PPT-aligned initial dashboard profile for the AWS SAA demo learner. */
export const demo = {
  goalTitle: "Pass AWS Solutions Architect Associate (SAA-C03) in 8 weeks",
  examCode: "SAA-C03",
  durationWeeks: 8,
  primaryTopicId: "vpc-networking",
  weakQuizScore: 42,
  masteryQuizScore: 95,
  inactivityDays: 3,
  defaultSkillLevel: "intermediate" as const,
  defaultFocusDurationMinutes: 45,
  defaultStudyTimeOfDay: "evening" as const,
  initialStreakDays: 12,
  initialConsistencyScore: 82,
  initialDropoutRisk: 10,
  initialStudyMinutes: 18 * 60,
  initialPlannedMinutes: 24 * 60,
  initialLearningVelocity: 2.4,
  initialRoadmapVersion: 3,
} as const;

export const demoInitialRecommendation =
  "Prioritize the VPC Networking Lab today. It is a prerequisite for upcoming cloud architecture milestones.";

export const demoNoDecisionMessage =
  "No roadmap changes yet. Complete an assessment to activate adaptive planning.";

export const demoNoWeaknessMessage = "No confirmed weaknesses yet. Your profile will adapt after assessments.";

export const demoInitialNextTaskId = "task-vpc-lab";
