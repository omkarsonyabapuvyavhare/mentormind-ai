import { z } from "zod";

export const skillLevelSchema = z.enum(["beginner", "intermediate", "advanced"]);

export const studyTimeOfDaySchema = z.enum(["morning", "afternoon", "evening"]);

export const learningFormatSchema = z.enum(["video", "reading", "lab", "quiz"]);

import { goalCategorySchema, goalTypeSchema } from "@/lib/goals/goal-identity";

export const goalSchema = z.object({
  title: z.string().min(1),
  targetDate: z.string().datetime(),
  examCode: z.string().optional(),
  slug: z.string().min(1).max(64),
  category: goalCategorySchema,
  type: goalTypeSchema,
});

export const learningPreferencesSchema = z.object({
  studyTimeOfDay: studyTimeOfDaySchema,
  focusDurationMinutes: z.number().int().positive(),
  preferredFormats: z.array(learningFormatSchema).min(1),
});

export const topicScoreSchema = z.object({
  topicId: z.string().min(1),
  topicName: z.string().min(1),
  score: z.number().min(0).max(100),
  lastAssessedAt: z.string().datetime(),
});

export const quizAttemptSchema = z.object({
  id: z.string().min(1),
  topicId: z.string().min(1),
  score: z.number().min(0).max(100),
  totalQuestions: z.number().int().positive(),
  completedAt: z.string().datetime(),
  correctCount: z.number().int().min(0).optional(),
  incorrectCount: z.number().int().min(0).optional(),
  masteredConceptTags: z.array(z.string().min(1).max(64)).optional(),
  weakConceptTags: z.array(z.string().min(1).max(64)).optional(),
});

export const learningTwinSchema = z.object({
  id: z.string().min(1),
  goal: goalSchema,
  skillLevel: skillLevelSchema,
  strengths: z.array(topicScoreSchema),
  weaknesses: z.array(topicScoreSchema),
  knownChallenges: z
    .array(
      z.object({
        topicId: z.string().min(1),
        topicName: z.string().min(1),
      }),
    )
    .default([]),
  preferences: learningPreferencesSchema,
  consistencyScore: z.number().min(0).max(100),
  quizHistory: z.array(quizAttemptSchema),
  lastActiveAt: z.string().datetime(),
  inactivityDays: z.number().int().min(0),
  currentStreakDays: z.number().int().min(0),
  totalStudyMinutes: z.number().int().min(0),
  plannedStudyMinutes: z.number().int().positive(),
  dropoutRisk: z.number().min(0).max(100),
  learningVelocity: z.number().min(0),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const milestoneStatusSchema = z.enum([
  "upcoming",
  "current",
  "completed",
  "delayed",
]);

export const taskTypeSchema = z.enum(["lesson", "quiz", "revision", "lab", "review"]);

export const taskStatusSchema = z.enum([
  "pending",
  "in_progress",
  "completed",
  "skipped",
]);

export const milestoneSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  targetDate: z.string().datetime(),
  status: milestoneStatusSchema,
  topicIds: z.array(z.string().min(1)),
  order: z.number().int().nonnegative(),
});

export const learningTaskSchema = z.object({
  id: z.string().min(1),
  milestoneId: z.string().min(1),
  topicId: z.string().min(1),
  type: taskTypeSchema,
  title: z.string().min(1),
  estimatedMinutes: z.number().int().positive(),
  status: taskStatusSchema,
  priority: z.number().int(),
  injectedBy: z.string().optional(),
  unlocked: z.boolean(),
  learningObjectives: z.array(z.string().min(1).max(200)).max(6).optional(),
});

export const roadmapSchema = z.object({
  id: z.string().min(1),
  goalId: z.string().min(1),
  milestones: z.array(milestoneSchema),
  tasks: z.array(learningTaskSchema),
  version: z.number().int().nonnegative(),
  updatedAt: z.string().datetime(),
});

export const nudgeSeveritySchema = z.enum(["info", "warning", "urgent"]);

export const nudgeSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  body: z.string().min(1),
  severity: nudgeSeveritySchema,
  createdAt: z.string().datetime(),
  read: z.boolean(),
});

export const reasonCodeSchema = z.enum([
  "QUIZ_BELOW_THRESHOLD",
  "QUIZ_MASTERY_ACHIEVED",
  "INACTIVITY_ESCALATION",
  "REVISION_NO_LONGER_NEEDED",
  "MILESTONE_DELAYED_FOR_REMEDIATION",
  "ROADMAP_ACCELERATED",
  "TASK_COMPLETED",
  "SESSION_MISSED",
]);

export const learnerEventSchema = z.discriminatedUnion("type", [
  z.object({
    id: z.string().min(1).optional(),
    type: z.literal("ONBOARDING_COMPLETED"),
    twin: learningTwinSchema,
    timestamp: z.string().datetime(),
  }),
  z.object({
    id: z.string().min(1).optional(),
    type: z.literal("QUIZ_COMPLETED"),
    topicId: z.string().min(1),
    score: z.number().min(0).max(100),
    totalQuestions: z.number().int().positive(),
    correctCount: z.number().int().min(0).optional(),
    incorrectCount: z.number().int().min(0).optional(),
    masteredConceptTags: z.array(z.string().min(1).max(64)).optional(),
    weakConceptTags: z.array(z.string().min(1).max(64)).optional(),
    timestamp: z.string().datetime(),
  }),
  z.object({
    id: z.string().min(1).optional(),
    type: z.literal("TASK_COMPLETED"),
    taskId: z.string().min(1),
    timestamp: z.string().datetime(),
  }),
  z.object({
    id: z.string().min(1).optional(),
    type: z.literal("TASK_SKIPPED"),
    taskId: z.string().min(1),
    timestamp: z.string().datetime(),
  }),
  z.object({
    id: z.string().min(1).optional(),
    type: z.literal("SESSION_MISSED"),
    timestamp: z.string().datetime(),
  }),
  z.object({
    id: z.string().min(1).optional(),
    type: z.literal("INACTIVITY_TICK"),
    days: z.number().int().positive(),
    timestamp: z.string().datetime(),
  }),
  z.object({
    id: z.string().min(1).optional(),
    type: z.literal("STUDY_SESSION_LOGGED"),
    durationMinutes: z.number().int().positive(),
    timestamp: z.string().datetime(),
  }),
]);

export type LearningTwinInput = z.infer<typeof learningTwinSchema>;
export type RoadmapInput = z.infer<typeof roadmapSchema>;
export type LearnerEventInput = z.infer<typeof learnerEventSchema>;
