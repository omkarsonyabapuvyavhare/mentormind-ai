import { z } from "zod";

import { validateContentForGoalCategory } from "@/lib/goals/domain-validation";
import type { GoalCategory } from "@/lib/goals/goal-identity";

export const aiRoadmapTaskTypeSchema = z.enum(["lesson", "quiz", "lab"]);

export const aiRoadmapTaskSchema = z.object({
  title: z.string().min(1).max(200),
  type: aiRoadmapTaskTypeSchema,
  durationMinutes: z.number().int().min(5).max(180),
  description: z.string().min(1).max(500),
  learningObjectives: z.array(z.string().min(1).max(200)).min(1).max(5),
});

export const aiRoadmapMilestoneSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(500),
  week: z.number().int().min(1).max(16),
  topicTitle: z.string().min(1).max(200),
  tasks: z.array(aiRoadmapTaskSchema).min(1).max(6),
});

export const aiRoadmapResponseSchema = z.object({
  milestones: z.array(aiRoadmapMilestoneSchema).min(4).max(8),
});

export type AiRoadmapTask = z.infer<typeof aiRoadmapTaskSchema>;
export type AiRoadmapMilestone = z.infer<typeof aiRoadmapMilestoneSchema>;
export type AiRoadmapResponse = z.infer<typeof aiRoadmapResponseSchema>;

export const roadmapGenerationSourceSchema = z.enum(["ai", "deterministic"]);

export type RoadmapGenerationSource = z.infer<typeof roadmapGenerationSourceSchema>;

export const MAX_TOTAL_TASKS = 48;

const AWS_TOPIC_PATTERN =
  /\b(aws|amazon web services|ec2|s3\b|vpc\b|iam\b|lambda|rds|dynamodb|cloudfront|saa-c03|solutions architect)\b/i;

export function containsAwsSpecificTopic(text: string): boolean {
  return AWS_TOPIC_PATTERN.test(text);
}

export interface RoadmapValidationContext {
  goalSlug: string;
  goalCategory: GoalCategory;
}

export function validateAiRoadmapStructure(
  parsed: AiRoadmapResponse,
  durationWeeks: number,
  context: RoadmapValidationContext,
): string | null {
  const expectedMilestones = Math.min(Math.max(durationWeeks, 4), 8);

  if (parsed.milestones.length !== expectedMilestones) {
    return `Expected ${expectedMilestones} milestones for ${durationWeeks}-week plan, got ${parsed.milestones.length}.`;
  }

  const weeks = parsed.milestones.map((milestone) => milestone.week);
  const uniqueWeeks = new Set(weeks);

  if (uniqueWeeks.size !== weeks.length) {
    return "Duplicate milestone week numbers are not allowed.";
  }

  if (weeks.some((week) => week < 1 || week > durationWeeks)) {
    return "Milestone week values must fall within the requested duration.";
  }

  let totalTasks = 0;

  for (const milestone of parsed.milestones) {
    totalTasks += milestone.tasks.length;

    const milestoneError = validateContentForGoalCategory(
      `${milestone.title} ${milestone.topicTitle} ${milestone.description}`,
      context.goalCategory,
      context.goalSlug,
    );

    if (milestoneError) {
      return milestoneError;
    }

    for (const task of milestone.tasks) {
      const taskError = validateContentForGoalCategory(
        `${task.title} ${task.description}`,
        context.goalCategory,
        context.goalSlug,
      );

      if (taskError) {
        return taskError;
      }
    }
  }

  if (totalTasks > MAX_TOTAL_TASKS) {
    return `Too many tasks (${totalTasks}). Maximum is ${MAX_TOTAL_TASKS}.`;
  }

  return null;
}
