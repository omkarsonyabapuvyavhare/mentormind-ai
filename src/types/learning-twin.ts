import type { GoalCategory, GoalType } from "@/lib/goals/goal-identity";

export type SkillLevel = "beginner" | "intermediate" | "advanced";

export type StudyTimeOfDay = "morning" | "afternoon" | "evening";

export type LearningFormat = "video" | "reading" | "lab" | "quiz";

export interface Goal {
  title: string;
  targetDate: string;
  examCode?: string;
  slug: string;
  category: GoalCategory;
  type: GoalType;
}

export interface LearningPreferences {
  studyTimeOfDay: StudyTimeOfDay;
  focusDurationMinutes: number;
  preferredFormats: LearningFormat[];
}

export interface TopicScore {
  topicId: string;
  topicName: string;
  score: number;
  lastAssessedAt: string;
}

export interface QuizAttempt {
  id: string;
  topicId: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
  correctCount?: number;
  incorrectCount?: number;
  masteredConceptTags?: string[];
  weakConceptTags?: string[];
}

export interface KnownChallenge {
  topicId: string;
  topicName: string;
}

export interface LearningTwin {
  id: string;
  goal: Goal;
  skillLevel: SkillLevel;
  strengths: TopicScore[];
  weaknesses: TopicScore[];
  knownChallenges: KnownChallenge[];
  preferences: LearningPreferences;
  consistencyScore: number;
  quizHistory: QuizAttempt[];
  lastActiveAt: string;
  inactivityDays: number;
  currentStreakDays: number;
  totalStudyMinutes: number;
  plannedStudyMinutes: number;
  dropoutRisk: number;
  learningVelocity: number;
  createdAt: string;
  updatedAt: string;
}
