import { awsSaaGoal } from "@/data/aws-saa-seed";

export const onboardingGoalTemplates = [
  {
    id: "aws-saa-c03",
    title: awsSaaGoal.title.replace(" in 8 weeks", ""),
    shortTitle: "AWS Solutions Architect Associate",
    outcome: "Certification readiness",
    examCode: awsSaaGoal.examCode,
    durationWeeks: awsSaaGoal.durationWeeks,
    supported: true,
  },
  {
    id: "azure-fundamentals",
    title: "Pass Microsoft Azure Fundamentals (AZ-900)",
    shortTitle: "Azure Fundamentals",
    outcome: "Cloud certification readiness",
    examCode: "AZ-900",
    durationWeeks: 6,
    supported: false,
  },
  {
    id: "custom-skill",
    title: "Build a custom professional skill plan",
    shortTitle: "Custom skill plan",
    outcome: "Structured skill development",
    durationWeeks: 8,
    supported: false,
  },
] as const;

export type OnboardingGoalId = (typeof onboardingGoalTemplates)[number]["id"];

export const onboardingIntentMessage =
  "MentorMind converted your goal into a structured learner profile and an executable roadmap.";

export const onboardingPersonalizedLabel =
  "Personalized plan generated from your goal, availability, and learning preferences.";
