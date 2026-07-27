import { describe, expect, it } from "vitest";

import { buildInactivityNudgeContent } from "@/lib/engine/nudge-content";
import { evaluate } from "@/lib/engine/index";
import { applyEngineResult } from "@/lib/engine/apply";
import type { EngineContext } from "@/types/decisions";
import type { LearningTwin } from "@/types/learning-twin";
import type { Roadmap } from "@/types/roadmap";

const TIMESTAMP = "2026-07-27T18:00:00.000Z";

function inactivityEvent(days = 3) {
  return {
    type: "INACTIVITY_TICK" as const,
    days,
    timestamp: TIMESTAMP,
  };
}

function buildContext(
  twinOverrides: Partial<LearningTwin>,
  roadmap: Roadmap,
): EngineContext {
  const baseTwin: LearningTwin = {
    id: "twin-test",
    goal: {
      title: "Learn Python Programming",
      targetDate: "2026-09-01",
      slug: "python",
      category: "Programming",
      type: "Skill",
    },
    skillLevel: "beginner",
    strengths: [],
    weaknesses: [],
    knownChallenges: [],
    preferences: {
      studyTimeOfDay: "evening",
      focusDurationMinutes: 45,
      preferredFormats: ["quiz"],
    },
    consistencyScore: 70,
    quizHistory: [],
    lastActiveAt: "2026-07-24",
    inactivityDays: 0,
    currentStreakDays: 5,
    totalStudyMinutes: 120,
    plannedStudyMinutes: 240,
    dropoutRisk: 20,
    learningVelocity: 1,
    createdAt: "2026-07-01",
    updatedAt: "2026-07-24",
    ...twinOverrides,
  };

  return { twin: baseTwin, roadmap, nudges: [] };
}

function pythonRoadmap(): Roadmap {
  return {
    id: "roadmap-python",
    goalId: "python",
    version: 1,
    updatedAt: TIMESTAMP,
    milestones: [
      {
        id: "ms-1",
        title: "Functions",
        order: 1,
        status: "current",
        topicIds: ["python-functions"],
        targetDate: "2026-08-01",
      },
      {
        id: "ms-2",
        title: "OOP",
        order: 2,
        status: "pending",
        topicIds: ["python-oop"],
        targetDate: "2026-08-15",
      },
    ],
    tasks: [
      {
        id: "task-functions",
        milestoneId: "ms-1",
        topicId: "python-functions",
        type: "lesson",
        title: "Python Functions",
        estimatedMinutes: 45,
        priority: 1,
        status: "pending",
        unlocked: true,
      },
      {
        id: "task-oop",
        milestoneId: "ms-2",
        topicId: "python-oop",
        type: "lesson",
        title: "Object-Oriented Programming",
        estimatedMinutes: 60,
        priority: 1,
        status: "pending",
        unlocked: true,
      },
    ],
  };
}

function azureRoadmap(): Roadmap {
  return {
    id: "roadmap-azure",
    goalId: "azure-fundamentals",
    version: 1,
    updatedAt: TIMESTAMP,
    milestones: [
      {
        id: "ms-net",
        title: "Networking",
        order: 1,
        status: "current",
        topicIds: ["azure-networking"],
        targetDate: "2026-08-01",
      },
      {
        id: "ms-storage",
        title: "Storage",
        order: 2,
        status: "pending",
        topicIds: ["azure-storage"],
        targetDate: "2026-08-15",
      },
    ],
    tasks: [
      {
        id: "task-vnets",
        milestoneId: "ms-net",
        topicId: "azure-networking",
        type: "revision",
        title: "Azure VNets Review",
        estimatedMinutes: 40,
        priority: 1,
        status: "pending",
        unlocked: true,
      },
      {
        id: "task-storage",
        milestoneId: "ms-storage",
        topicId: "azure-storage",
        type: "lesson",
        title: "Azure Storage",
        estimatedMinutes: 50,
        priority: 1,
        status: "pending",
        unlocked: true,
      },
    ],
  };
}

describe("buildInactivityNudgeContent", () => {
  it("generates Python-specific nudge without AWS wording", () => {
    const context = buildContext(
      {
        goal: {
          title: "Learn Python Programming",
          targetDate: "2026-09-01",
          slug: "python",
          category: "Programming",
          type: "Skill",
        },
        weaknesses: [
          {
            topicId: "python-functions",
            topicName: "Python Functions",
            score: 55,
            lastAssessedAt: "2026-07-20",
          },
        ],
      },
      pythonRoadmap(),
    );

    const content = buildInactivityNudgeContent(inactivityEvent(), context, 15);

    expect(content.body).toMatch(/python functions/i);
    expect(content.body).toMatch(/object-oriented programming/i);
    expect(content.body).toMatch(/15 minutes/i);
    expect(content.body).not.toMatch(/aws/i);
    expect(content.body).not.toMatch(/vpc/i);
    expect(content.title).not.toMatch(/aws/i);
  });

  it("generates Azure-specific nudge without Python wording", () => {
    const context = buildContext(
      {
        goal: {
          title: "Pass Azure Fundamentals (AZ-900)",
          targetDate: "2026-09-01",
          examCode: "AZ-900",
          slug: "azure-fundamentals",
          category: "Cloud",
          type: "Certification",
        },
        weaknesses: [
          {
            topicId: "azure-networking",
            topicName: "Azure Networking",
            score: 48,
            lastAssessedAt: "2026-07-20",
          },
        ],
      },
      azureRoadmap(),
    );

    const content = buildInactivityNudgeContent(inactivityEvent(), context, 20);

    expect(content.body).toMatch(/azure networking/i);
    expect(content.body).toMatch(/azure storage/i);
    expect(content.body).not.toMatch(/python/i);
    expect(content.body).not.toMatch(/vpc/i);
    expect(content.title).toMatch(/AZ-900/i);
  });

  it("generates AWS nudge from assessment context", () => {
    const context = buildContext(
      {
        goal: {
          title: "Pass AWS Solutions Architect Associate (SAA-C03) in 8 weeks",
          targetDate: "2026-09-01",
          examCode: "SAA-C03",
          slug: "aws-saa-c03",
          category: "Cloud",
          type: "Certification",
        },
        weaknesses: [
          {
            topicId: "vpc-networking",
            topicName: "VPC Networking",
            score: 42,
            lastAssessedAt: "2026-07-20",
          },
        ],
      },
      {
        id: "roadmap-aws",
        goalId: "aws-saa-c03",
        version: 1,
        updatedAt: TIMESTAMP,
        milestones: [
          {
            id: "ms-vpc",
            title: "Networking",
            order: 1,
            status: "current",
            topicIds: ["vpc-networking"],
            targetDate: "2026-08-01",
          },
          {
            id: "ms-iam",
            title: "Security",
            order: 2,
            status: "pending",
            topicIds: ["iam-security"],
            targetDate: "2026-08-15",
          },
        ],
        tasks: [
          {
            id: "task-vpc",
            milestoneId: "ms-vpc",
            topicId: "vpc-networking",
            type: "revision",
            title: "VPC Networking Review",
            estimatedMinutes: 45,
            priority: 1,
            status: "pending",
            unlocked: true,
          },
          {
            id: "task-iam",
            milestoneId: "ms-iam",
            topicId: "iam-security",
            type: "lesson",
            title: "IAM and Security",
            estimatedMinutes: 50,
            priority: 1,
            status: "pending",
            unlocked: true,
          },
        ],
      },
    );

    const content = buildInactivityNudgeContent(inactivityEvent(), context, 15);

    expect(content.body).toMatch(/vpc networking/i);
    expect(content.body).toMatch(/iam/i);
    expect(content.body).not.toMatch(/python/i);
    expect(content.body).not.toMatch(/azure/i);
  });

  it("generates React-specific nudge without cross-goal wording", () => {
    const context = buildContext(
      {
        goal: {
          title: "Master React Development",
          targetDate: "2026-09-01",
          slug: "react",
          category: "Programming",
          type: "Skill",
        },
        weaknesses: [
          {
            topicId: "react-hooks",
            topicName: "React Hooks",
            score: 52,
            lastAssessedAt: "2026-07-20",
          },
        ],
      },
      {
        id: "roadmap-react",
        goalId: "react",
        version: 1,
        updatedAt: TIMESTAMP,
        milestones: [
          {
            id: "ms-hooks",
            title: "Hooks",
            order: 1,
            status: "current",
            topicIds: ["react-hooks"],
            targetDate: "2026-08-01",
          },
          {
            id: "ms-state",
            title: "State Management",
            order: 2,
            status: "pending",
            topicIds: ["react-state"],
            targetDate: "2026-08-15",
          },
        ],
        tasks: [
          {
            id: "task-hooks",
            milestoneId: "ms-hooks",
            topicId: "react-hooks",
            type: "revision",
            title: "React Hooks Review",
            estimatedMinutes: 35,
            priority: 1,
            status: "pending",
            unlocked: true,
          },
          {
            id: "task-state",
            milestoneId: "ms-state",
            topicId: "react-state",
            type: "lesson",
            title: "State Management Patterns",
            estimatedMinutes: 45,
            priority: 1,
            status: "pending",
            unlocked: true,
          },
        ],
      },
    );

    const content = buildInactivityNudgeContent(inactivityEvent(), context, 20);

    expect(content.body).toMatch(/react hooks/i);
    expect(content.body).toMatch(/state management/i);
    expect(content.body).not.toMatch(/aws|vpc|python|azure/i);
  });

  it("generates Kubernetes-specific nudge without cross-goal wording", () => {
    const context = buildContext(
      {
        goal: {
          title: "Learn Kubernetes Administration",
          targetDate: "2026-09-01",
          slug: "kubernetes",
          category: "DevOps",
          type: "Skill",
        },
        weaknesses: [
          {
            topicId: "k8s-networking",
            topicName: "Kubernetes Networking",
            score: 46,
            lastAssessedAt: "2026-07-20",
          },
        ],
      },
      {
        id: "roadmap-k8s",
        goalId: "kubernetes",
        version: 1,
        updatedAt: TIMESTAMP,
        milestones: [
          {
            id: "ms-net",
            title: "Networking",
            order: 1,
            status: "current",
            topicIds: ["k8s-networking"],
            targetDate: "2026-08-01",
          },
          {
            id: "ms-deploy",
            title: "Deployments",
            order: 2,
            status: "pending",
            topicIds: ["k8s-deployments"],
            targetDate: "2026-08-15",
          },
        ],
        tasks: [
          {
            id: "task-net",
            milestoneId: "ms-net",
            topicId: "k8s-networking",
            type: "revision",
            title: "Kubernetes Networking Review",
            estimatedMinutes: 40,
            priority: 1,
            status: "pending",
            unlocked: true,
          },
          {
            id: "task-deploy",
            milestoneId: "ms-deploy",
            topicId: "k8s-deployments",
            type: "lesson",
            title: "Deployment Strategies",
            estimatedMinutes: 50,
            priority: 1,
            status: "pending",
            unlocked: true,
          },
        ],
      },
    );

    const content = buildInactivityNudgeContent(inactivityEvent(), context, 15);

    expect(content.body).toMatch(/kubernetes networking/i);
    expect(content.body).toMatch(/deployment strategies/i);
    expect(content.body).not.toMatch(/aws|python|azure|react hooks/i);
  });
});

describe("inactivity engine integration", () => {
  it("updates twin inactivityDays through evaluate and applyEngineResult", () => {
    const context = buildContext(
      {
        weaknesses: [
          {
            topicId: "python-functions",
            topicName: "Python Functions",
            score: 50,
            lastAssessedAt: "2026-07-20",
          },
        ],
      },
      pythonRoadmap(),
    );

    const result = evaluate(inactivityEvent(), context);
    const applied = applyEngineResult(context, result);

    expect(applied.twin.inactivityDays).toBe(3);
    expect(applied.twin.currentStreakDays).toBe(0);
    expect(applied.nudges).toHaveLength(1);
    expect(applied.nudges[0]?.body).not.toMatch(/aws/i);
    expect(result.decision.reasons).toContain("INACTIVITY_ESCALATION");
  });
});
