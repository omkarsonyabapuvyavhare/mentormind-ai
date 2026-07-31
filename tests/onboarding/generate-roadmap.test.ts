import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockGeminiGenerateContent = vi.hoisted(() => vi.fn());

vi.mock("@google/genai", () => ({
  GoogleGenAI: class MockGoogleGenAI {
    models = {
      generateContent: mockGeminiGenerateContent,
    };
  },
}));

import { POST } from "@/app/api/onboarding/generate-roadmap/route";
import { containsAwsSpecificTopic } from "@/lib/ai/roadmap-schema";
import { createDeterministicRoadmapFromOnboarding } from "@/lib/ai/roadmap-deterministic";
import { generateRoadmapForOnboarding } from "@/lib/ai/roadmap-service";
import { buildRoadmapFromAiMilestones } from "@/lib/ai/roadmap-fallback";
import { generateDemoRoadmap } from "@/lib/roadmap/generate-initial";
import { aiRoadmapTaskTypeSchema } from "@/lib/ai/roadmap-schema";
import { createRoadmapFromOnboarding } from "@/lib/onboarding/create-from-input";
import { azureTestInput, buildTestOnboardingInput } from "../helpers/onboarding-input";
import { awsOnboardingDefaults, onboardingDefaults } from "@/lib/onboarding/schema";
import type { OnboardingInput } from "@/lib/onboarding/schema";

const START = "2026-07-17T00:00:00.000Z";
const TWIN_ID = "learner-20260717000000";

function buildMilestones(count: number, goalLabel: string) {
  return Array.from({ length: count }, (_, index) => ({
    title: `${goalLabel} Milestone ${index + 1}`,
    description: `Learn milestone ${index + 1} concepts.`,
    week: index + 1,
    topicTitle: `${goalLabel} Topic ${index + 1}`,
    tasks: [
      {
        title: `${goalLabel} Lesson ${index + 1}`,
        type: "lesson" as const,
        durationMinutes: 45,
        description: "Core lesson content.",
        learningObjectives: ["Understand the topic"],
      },
      {
        title: `${goalLabel} Quiz ${index + 1}`,
        type: "quiz" as const,
        durationMinutes: 20,
        description: "Knowledge check.",
        learningObjectives: ["Validate understanding"],
      },
    ],
  }));
}

const azureInput: OnboardingInput = azureTestInput;

const customInput: OnboardingInput = buildTestOnboardingInput({
  goalSlug: "frontend-development",
  goalTitle: "Frontend development",
  goalCategory: "Web Development",
  goalType: "Skill",
  skillLevel: "beginner",
  durationWeeks: 8,
  studyHoursPerWeek: 6,
  studyTimeOfDay: "morning",
  focusDurationMinutes: 30,
  preferredFormats: ["reading", "quiz"],
});

describe("deterministic roadmap fallbacks", () => {
  it("Azure input never produces AWS topics", () => {
    const result = createDeterministicRoadmapFromOnboarding(azureInput, TWIN_ID, START, {
      recommendedFocusAreas: ["Cloud Concepts", "Azure Services"],
    });

    const haystack = JSON.stringify(result.roadmap);

    expect(haystack.toLowerCase()).not.toContain("aws");
    expect(haystack.toLowerCase()).not.toContain("ec2");
    expect(haystack.toLowerCase()).not.toContain("vpc networking");
    expect(result.roadmap.goalId).toBe("azure-fundamentals");
  });

  it("AWS input remains compatible with the seed roadmap", () => {
    const roadmap = createRoadmapFromOnboarding(awsOnboardingDefaults, TWIN_ID, START);

    expect(roadmap.milestones).toHaveLength(8);
    expect(roadmap.goalId).toBe("aws-saa-c03");
    expect(roadmap.tasks.some((task) => task.title.includes("AWS"))).toBe(true);
  });

  it("unknown custom goal produces a generic roadmap from focus areas", () => {
    const result = createDeterministicRoadmapFromOnboarding(customInput, TWIN_ID, START, {
      goal: "Frontend development",
      recommendedFocusAreas: ["HTML Semantics", "CSS Layout", "JavaScript Basics"],
    });

    expect(result.roadmap.goalId).toBe("frontend-development");
    expect(result.roadmap.milestones.length).toBeGreaterThanOrEqual(4);
    expect(JSON.stringify(result.roadmap).toLowerCase()).not.toContain("aws global infrastructure");
  });

  it("Data Science goal produces domain topics instead of Foundations", () => {
    const result = createDeterministicRoadmapFromOnboarding(
      buildTestOnboardingInput({
        goalSlug: "learn-data-science",
        goalTitle: "Learn Data Science",
        goalCategory: "Data",
        goalType: "Skill",
        durationWeeks: 8,
      }),
      TWIN_ID,
      START,
      {
        goal: "Learn Data Science",
        recommendedFocusAreas: ["Foundations", "Core Concepts", "Applied Practice", "Review"],
      },
    );

    const topicTitles = result.roadmap.milestones.map((milestone) => milestone.title);
    expect(topicTitles.some((title) => /pandas|numpy|python for data science|data cleaning/i.test(title))).toBe(
      true,
    );
    expect(JSON.stringify(result.roadmap)).not.toMatch(/Explain key ideas in/i);
    expect(result.roadmap.tasks.some((task) => /foundations — core lesson/i.test(task.title))).toBe(false);
  });
});

describe("roadmap normalization", () => {
  it("every task references an existing milestone", () => {
    const milestones = buildMilestones(6, "Azure");
    const roadmap = buildRoadmapFromAiMilestones(
      milestones,
      "azure-fundamentals",
      TWIN_ID,
      START,
    );
    const milestoneIds = new Set(roadmap.milestones.map((milestone) => milestone.id));

    for (const task of roadmap.tasks) {
      expect(milestoneIds.has(task.milestoneId)).toBe(true);
    }
  });

  it("uses the actual goalId on the roadmap", () => {
    const roadmap = buildRoadmapFromAiMilestones(
      buildMilestones(4, "Azure"),
      "azure-fundamentals",
      TWIN_ID,
      START,
    );

    expect(roadmap.goalId).toBe("azure-fundamentals");
    expect(roadmap.goalId).not.toBe(TWIN_ID);
  });

  it("creates deterministic task IDs", () => {
    const roadmap = buildRoadmapFromAiMilestones(
      buildMilestones(4, "Azure"),
      "azure-fundamentals",
      TWIN_ID,
      START,
    );

    expect(roadmap.tasks[0]?.id).toMatch(/^task-ms-week-/);
    expect(new Set(roadmap.tasks.map((task) => task.id)).size).toBe(roadmap.tasks.length);
  });

  it("only unlocks first-week tasks initially", () => {
    const roadmap = buildRoadmapFromAiMilestones(
      buildMilestones(6, "Azure"),
      "azure-fundamentals",
      TWIN_ID,
      START,
    );

    const unlocked = roadmap.tasks.filter((task) => task.unlocked);
    const locked = roadmap.tasks.filter((task) => !task.unlocked);

    expect(unlocked.length).toBeGreaterThan(0);
    expect(locked.length).toBeGreaterThan(0);
    expect(unlocked.every((task) => task.milestoneId === "ms-week-1")).toBe(true);
  });
});

describe("generateRoadmapForOnboarding service", () => {
  beforeEach(() => {
    mockGeminiGenerateContent.mockReset();
  });

  afterEach(() => {
    delete process.env.GEMINI_API_KEY;
  });

  it("returns AI roadmap when Gemini succeeds", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    mockGeminiGenerateContent.mockResolvedValue({
      text: JSON.stringify({ milestones: buildMilestones(8, "AWS SAA") }),
    });

    const result = await generateRoadmapForOnboarding(awsOnboardingDefaults, TWIN_ID, START, {
      goal: "AWS Solutions Architect Associate",
      recommendedFocusAreas: ["VPC", "IAM"],
    });

    expect(result.source).toBe("ai");
    expect(result.roadmap.goalId).toBe("aws-saa-c03");
  });

  it("falls back when Gemini returns invalid JSON", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    mockGeminiGenerateContent.mockResolvedValue({ text: "not-json" });

    const result = await generateRoadmapForOnboarding(onboardingDefaults, TWIN_ID, START);

    expect(result.source).toBe("deterministic");
    expect(result.fallbackReason).toBe("invalid-json");
  });

  it("falls back when Gemini times out", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    mockGeminiGenerateContent.mockRejectedValue(new Error("Aborted"));

    const result = await generateRoadmapForOnboarding(azureInput, TWIN_ID, START);

    expect(result.source).toBe("deterministic");
    expect(result.fallbackReason).toBe("request-error");
    expect(JSON.stringify(result.roadmap).toLowerCase()).not.toContain("ec2");
  });

  it("falls back when API key is missing", async () => {
    delete process.env.GEMINI_API_KEY;

    const result = await generateRoadmapForOnboarding(azureInput, TWIN_ID, START);

    expect(result.source).toBe("deterministic");
    expect(result.fallbackReason).toBe("missing-api-key");
  });

  it("rejects Azure AI output that includes AWS topics", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    const awsMilestones = buildMilestones(6, "AWS EC2");
    awsMilestones[0]!.topicTitle = "Amazon EC2 Compute";

    mockGeminiGenerateContent.mockResolvedValue({
      text: JSON.stringify({ milestones: awsMilestones }),
    });

    const result = await generateRoadmapForOnboarding(azureInput, TWIN_ID, START);

    expect(result.source).toBe("deterministic");
    expect(result.fallbackReason).toBe("structure-validation");
  });
});

describe("Zod schema guards", () => {
  it("rejects invalid task types", () => {
    expect(aiRoadmapTaskTypeSchema.safeParse("review").success).toBe(false);
    expect(aiRoadmapTaskTypeSchema.safeParse("lesson").success).toBe(true);
  });

  it("detects AWS-specific topic strings", () => {
    expect(containsAwsSpecificTopic("Amazon EC2 Compute")).toBe(true);
    expect(containsAwsSpecificTopic("Cloud Concepts")).toBe(false);
  });
});

describe("demo roadmap stability", () => {
  it("keeps the AWS demo roadmap unchanged", () => {
    const demoRoadmap = generateDemoRoadmap(START);

    expect(demoRoadmap.milestones).toHaveLength(8);
    expect(demoRoadmap.tasks.some((task) => task.title.includes("VPC"))).toBe(true);
    expect(demoRoadmap.version).toBeGreaterThan(0);
  });
});

describe("POST /api/onboarding/generate-roadmap", () => {
  afterEach(() => {
    delete process.env.GEMINI_API_KEY;
  });

  it("returns a validated roadmap payload", async () => {
    delete process.env.GEMINI_API_KEY;

    const response = await POST(
      new Request("http://localhost/api/onboarding/generate-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: azureInput,
          twinId: TWIN_ID,
          startTimestamp: START,
        }),
      }),
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.source).toBe("deterministic");
    expect(body.roadmap.goalId).toBe("azure-fundamentals");
  });
});
