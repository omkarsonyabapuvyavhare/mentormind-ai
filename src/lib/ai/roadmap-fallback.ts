import { addWeeks, parseISO } from "date-fns";

import { generateInitialRoadmap } from "@/lib/roadmap/generate-initial";
import {
  areGenericFocusAreas,
  inferFocusAreas,
  isAwsCertificationGoal,
  isGenericFocusArea,
} from "@/lib/goals/goal-identity";
import type { OnboardingInput } from "@/lib/onboarding/schema";
import type { Roadmap, TaskType } from "@/types/roadmap";

import { buildMilestoneId, buildTaskId, slugifyTitle } from "@/lib/ai/slug-id";
import type { AiRoadmapMilestone, AiRoadmapTask } from "@/lib/ai/roadmap-schema";

export interface RoadmapGenerationContext {
  goal?: string;
  domain?: string;
  targetOutcome?: string;
  recommendedFocusAreas?: string[];
}

interface FallbackMilestoneSeed {
  title: string;
  description: string;
  topicTitle: string;
  tasks: Array<{
    title: string;
    type: "lesson" | "quiz" | "lab";
    durationMinutes: number;
    description: string;
    learningObjectives: string[];
  }>;
}

const AZURE_FALLBACK_MILESTONES: FallbackMilestoneSeed[] = [
  {
    title: "Cloud Concepts",
    description: "Understand cloud models, benefits, and Azure's role in modern workloads.",
    topicTitle: "Cloud Concepts",
    tasks: [
      {
        title: "Introduction to Cloud Computing",
        type: "lesson",
        durationMinutes: 45,
        description: "Learn IaaS, PaaS, SaaS, and shared responsibility.",
        learningObjectives: ["Explain cloud service models", "Compare CapEx vs OpEx"],
      },
      {
        title: "Cloud Concepts Check-in",
        type: "quiz",
        durationMinutes: 20,
        description: "Validate foundational cloud terminology.",
        learningObjectives: ["Recall core cloud definitions"],
      },
    ],
  },
  {
    title: "Core Azure Services",
    description: "Explore compute, storage, and networking services in Azure.",
    topicTitle: "Core Azure Services",
    tasks: [
      {
        title: "Azure Compute and Storage Overview",
        type: "lesson",
        durationMinutes: 50,
        description: "Survey VMs, App Service, Blob Storage, and Azure SQL.",
        learningObjectives: ["Match workloads to Azure services"],
      },
      {
        title: "Core Services Lab",
        type: "lab",
        durationMinutes: 60,
        description: "Provision a sample Azure resource group and storage account.",
        learningObjectives: ["Navigate the Azure portal", "Create basic resources"],
      },
    ],
  },
  {
    title: "Azure Identity and Governance",
    description: "Learn Azure AD, RBAC, subscriptions, and resource management.",
    topicTitle: "Azure Identity and Governance",
    tasks: [
      {
        title: "Identity, RBAC, and Subscriptions",
        type: "lesson",
        durationMinutes: 45,
        description: "Understand tenants, subscriptions, and role assignments.",
        learningObjectives: ["Explain Azure AD vs RBAC", "Describe governance basics"],
      },
      {
        title: "Governance Quiz",
        type: "quiz",
        durationMinutes: 25,
        description: "Check understanding of identity and governance concepts.",
        learningObjectives: ["Apply RBAC scenarios"],
      },
    ],
  },
  {
    title: "Azure Networking and Storage",
    description: "Study virtual networks, connectivity, and durable storage options.",
    topicTitle: "Azure Networking and Storage",
    tasks: [
      {
        title: "Virtual Networks and Storage Classes",
        type: "lesson",
        durationMinutes: 50,
        description: "Cover VNets, subnets, peering, and storage redundancy.",
        learningObjectives: ["Design a basic VNet layout", "Choose storage tiers"],
      },
      {
        title: "Networking Lab",
        type: "lab",
        durationMinutes: 55,
        description: "Configure a virtual network and storage account pairing.",
        learningObjectives: ["Create subnets and storage endpoints"],
      },
    ],
  },
  {
    title: "Security, Pricing, and Support",
    description: "Review Azure security tools, cost management, and support plans.",
    topicTitle: "Security Pricing and Support",
    tasks: [
      {
        title: "Security Center and Cost Management",
        type: "lesson",
        durationMinutes: 40,
        description: "Learn Defender, Policy, pricing calculators, and SLAs.",
        learningObjectives: ["Identify security tooling", "Estimate Azure costs"],
      },
      {
        title: "AZ-900 Readiness Check",
        type: "quiz",
        durationMinutes: 30,
        description: "Mixed review across Azure fundamentals domains.",
        learningObjectives: ["Assess exam readiness"],
      },
    ],
  },
];

function toIso(date: Date): string {
  return date.toISOString();
}

function distributeWeeks(count: number, durationWeeks: number): number[] {
  if (count <= 0) {
    return [];
  }

  if (count === 1) {
    return [1];
  }

  const weeks: number[] = [];

  for (let index = 0; index < count; index += 1) {
    const week = Math.min(
      durationWeeks,
      Math.max(1, Math.round(((index + 1) / count) * durationWeeks)),
    );
    weeks.push(week);
  }

  for (let index = 1; index < weeks.length; index += 1) {
    if (weeks[index]! <= weeks[index - 1]!) {
      weeks[index] = Math.min(durationWeeks, weeks[index - 1]! + 1);
    }
  }

  return weeks;
}

function fallbackSeedToAiMilestones(
  seeds: FallbackMilestoneSeed[],
  durationWeeks: number,
): AiRoadmapMilestone[] {
  const weeks = distributeWeeks(seeds.length, durationWeeks);

  return seeds.map((seed, index) => ({
    title: seed.title,
    description: seed.description,
    week: weeks[index] ?? index + 1,
    topicTitle: seed.topicTitle,
    tasks: seed.tasks as AiRoadmapTask[],
  }));
}

export function buildAwsSeedFallbackRoadmap(
  twinId: string,
  goalId: string,
  startTimestamp: string,
): Roadmap {
  const base = generateInitialRoadmap({ twinId, startTimestamp });

  return {
    ...base,
    goalId,
  };
}

export function buildAzureFallbackMilestones(durationWeeks: number): AiRoadmapMilestone[] {
  const cappedDuration = Math.min(Math.max(durationWeeks, 4), 8);
  const seeds = AZURE_FALLBACK_MILESTONES.slice(0, cappedDuration);

  return fallbackSeedToAiMilestones(seeds, cappedDuration);
}

function buildTechnicalObjectives(area: string): [string, string] {
  return [
    `Apply ${area} in a concrete worked example`,
    `Identify and correct common mistakes when using ${area}`,
  ];
}

function resolveDomainFocusAreas(
  input: OnboardingInput,
  context: RoadmapGenerationContext | undefined,
): string[] {
  const candidates = context?.recommendedFocusAreas?.filter((area) => area.trim().length > 0) ?? [];

  if (!areGenericFocusAreas(candidates)) {
    return candidates;
  }

  const inferred = inferFocusAreas(context?.goal ?? input.goalTitle, input.goalCategory);
  if (!areGenericFocusAreas(inferred)) {
    return inferred;
  }

  return inferFocusAreas(input.goalTitle, input.goalCategory);
}

export function buildCustomFallbackMilestones(
  focusAreas: string[],
  durationWeeks: number,
): AiRoadmapMilestone[] {
  const cappedDuration = Math.min(Math.max(durationWeeks, 4), 8);
  const minMilestones = Math.min(cappedDuration, 4);
  const concreteAreas = focusAreas.filter((area) => !isGenericFocusArea(area));
  const areas =
    concreteAreas.length > 0
      ? [...concreteAreas]
      : ["Core Techniques", "Practical Workflows", "Applied Skills", "Integration Project"];

  // Stretch with numbered applied modules derived from the last concrete topic — never "Foundations".
  while (areas.length < minMilestones) {
    const base = areas[areas.length - 1] ?? "Applied Techniques";
    areas.push(`${base} Practice ${areas.length + 1}`);
  }

  const selectedAreas = areas.slice(0, cappedDuration);

  const seeds: FallbackMilestoneSeed[] = selectedAreas.map((area, index) => {
    const objectives = buildTechnicalObjectives(area);

    return {
      title: `Week ${index + 1} — ${area}`,
      description: `Build practical competence in ${area} with worked examples and verification.`,
      topicTitle: area,
      tasks: [
        {
          title: `${area} — Core Lesson`,
          type: "lesson" as const,
          durationMinutes: 45,
          description: `Learn and practice the technical skills required for ${area}.`,
          learningObjectives: [objectives[0], objectives[1]],
        },
        {
          title: `${area} — Knowledge Check`,
          type: "quiz" as const,
          durationMinutes: 20,
          description: `Validate technical progress in ${area}.`,
          learningObjectives: [`Demonstrate correct use of ${area}`],
        },
      ],
    };
  });

  return fallbackSeedToAiMilestones(seeds, cappedDuration);
}

export function buildUniversalFallbackMilestones(
  input: OnboardingInput,
  context: RoadmapGenerationContext | undefined,
): AiRoadmapMilestone[] {
  return buildCustomFallbackMilestones(resolveDomainFocusAreas(input, context), input.durationWeeks);
}

export function resolveDeterministicFallbackMilestones(
  input: OnboardingInput,
  context: RoadmapGenerationContext | undefined,
): AiRoadmapMilestone[] | null {
  if (isAwsCertificationGoal(input.goalSlug)) {
    return null;
  }

  return buildUniversalFallbackMilestones(input, context);
}

export function buildRoadmapFromAiMilestones(
  milestones: AiRoadmapMilestone[],
  goalId: string,
  twinId: string,
  startTimestamp: string,
): Roadmap {
  const startDate = parseISO(startTimestamp);
  const normalizedMilestones = [...milestones].sort((a, b) => a.week - b.week);
  const firstWeek = normalizedMilestones[0]?.week ?? 1;
  const unlockThroughWeek = Math.min(firstWeek, normalizedMilestones.at(-1)?.week ?? firstWeek);

  const roadmapMilestones = normalizedMilestones.map((milestone) => {
    const topicId = slugifyTitle(milestone.topicTitle);
    const milestoneId = buildMilestoneId(milestone.week);

    return {
      id: milestoneId,
      title: milestone.title,
      targetDate: toIso(addWeeks(startDate, milestone.week)),
      status:
        milestone.week === firstWeek
          ? ("current" as const)
          : ("upcoming" as const),
      topicIds: [topicId],
      order: milestone.week,
    };
  });

  const tasks = normalizedMilestones.flatMap((milestone) => {
    const milestoneId = buildMilestoneId(milestone.week);
    const topicId = slugifyTitle(milestone.topicTitle);
    const unlocked = milestone.week <= unlockThroughWeek;

    return milestone.tasks.map((task, index) => ({
      id: buildTaskId(milestoneId, topicId, task.type, index),
      milestoneId,
      topicId,
      type: task.type as TaskType,
      title: task.title,
      estimatedMinutes: task.durationMinutes,
      status: "pending" as const,
      priority: index + 1,
      unlocked,
      learningObjectives: task.learningObjectives,
    }));
  });

  return {
    id: `roadmap-${twinId}`,
    goalId,
    milestones: roadmapMilestones,
    tasks,
    version: 1,
    updatedAt: startTimestamp,
  };
}
