export type MilestoneStatus = "upcoming" | "current" | "completed" | "delayed";

export type TaskType = "lesson" | "quiz" | "revision" | "lab" | "review";

export type TaskStatus = "pending" | "in_progress" | "completed" | "skipped";

export interface Milestone {
  id: string;
  title: string;
  targetDate: string;
  status: MilestoneStatus;
  topicIds: string[];
  order: number;
  /** Optional Knowledge Graph provenance (Phase 3). */
  knowledgeGraphId?: string;
  canonicalTopicId?: string;
  prerequisiteIds?: string[];
  relatedTopicIds?: string[];
  kgValidationVersion?: string;
}

export interface LearningTask {
  id: string;
  milestoneId: string;
  topicId: string;
  type: TaskType;
  title: string;
  estimatedMinutes: number;
  status: TaskStatus;
  priority: number;
  injectedBy?: string;
  unlocked: boolean;
  learningObjectives?: string[];
  /** Optional Knowledge Graph provenance (Phase 3). */
  knowledgeGraphId?: string;
  canonicalTopicId?: string;
  prerequisiteIds?: string[];
  relatedTopicIds?: string[];
  kgValidationVersion?: string;
}

export interface Roadmap {
  id: string;
  goalId: string;
  milestones: Milestone[];
  tasks: LearningTask[];
  version: number;
  updatedAt: string;
  /** Optional Knowledge Graph provenance (Phase 3). */
  knowledgeGraphId?: string;
  kgValidationVersion?: string;
}

/** Fields required when the engine injects new tasks (id assigned at apply time). */
export type NewLearningTask = Omit<LearningTask, "id">;
