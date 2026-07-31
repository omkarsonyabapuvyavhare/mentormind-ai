// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockGeminiGenerateContent = vi.hoisted(() => vi.fn());

vi.mock("@google/genai", () => ({
  GoogleGenAI: class MockGoogleGenAI {
    models = {
      generateContent: mockGeminiGenerateContent,
    };
  },
}));

import { POST } from "@/app/api/learn/generate-lesson/route";
import { containsAwsSpecificTopic } from "@/lib/ai/roadmap-schema";
import {
  aiLessonResponseSchema,
  containsGenericLessonPhrases,
  containsLessonMetaLanguage,
  knowledgeCheckSchema,
  validateAiLessonStructure,
} from "@/lib/ai/lesson-schema";
import {
  createDeterministicLessonForLearner,
  resolveDeterministicLesson,
} from "@/lib/ai/lesson-fallback";
import { generateLessonForLearner } from "@/lib/ai/lesson-service";
import {
  readCachedLesson,
  writeCachedLesson,
} from "@/lib/learn/lesson-session-cache";
import type { GenerateLessonRequest } from "@/lib/learn/generate-lesson-request-schema";
import { buildMentorLessonFixture } from "../helpers/mentor-lesson-fixture";
import { mentorSectionHeadings } from "@/lib/ai/lesson-mentor-fallback";

const baseInput: GenerateLessonRequest = {
  goalId: "aws-saa-c03",
  goalSlug: "aws-saa-c03",
  goalTitle: "Pass AWS Solutions Architect Associate",
  goalCategory: "Cloud",
  goalType: "Certification",
  topicId: "vpc-networking",
  topicTitle: "VPC Networking",
  skillLevel: "intermediate",
  durationMinutes: 45,
  preferredFormats: ["video", "lab", "quiz"],
};

const azureInput: GenerateLessonRequest = {
  ...baseInput,
  goalId: "azure-fundamentals",
  goalSlug: "azure-fundamentals",
  goalTitle: "Azure Fundamentals AZ-900",
  goalCategory: "Cloud",
  goalType: "Certification",
  topicId: "cloud-concepts",
  topicTitle: "Cloud Concepts",
  skillLevel: "beginner",
};

const kubernetesInput: GenerateLessonRequest = {
  ...baseInput,
  goalId: "learn-kubernetes",
  goalSlug: "learn-kubernetes",
  goalTitle: "Kubernetes for platform engineers",
  goalCategory: "DevOps",
  goalType: "Skill",
  topicId: "kubernetes-networking",
  topicTitle: "Kubernetes Networking",
  skillLevel: "intermediate",
};

const pythonInput: GenerateLessonRequest = {
  ...baseInput,
  goalId: "learn-python",
  goalSlug: "learn-python",
  goalTitle: "Learn Python programming",
  goalCategory: "Programming",
  goalType: "Skill",
  topicId: "python-functions",
  topicTitle: "Python Functions",
  skillLevel: "beginner",
};

const pythonSyntaxInput: GenerateLessonRequest = {
  topicId: "python-syntax-data-types",
  topicTitle: "Python Syntax and Basic Data Types",
  learningObjectives: ["Declare variables", "Use int, float, bool, and str", "Call print()"],
};

const sqlInput: GenerateLessonRequest = {
  ...baseInput,
  goalId: "master-sql",
  goalSlug: "master-sql",
  goalTitle: "Master SQL for data analysis",
  goalCategory: "Data",
  goalType: "Skill",
  topicId: "sql-joins",
  topicTitle: "SQL JOINs",
  skillLevel: "intermediate",
  learningObjectives: ["Write INNER and LEFT JOINs", "Explain join cardinality"],
};

const gitInput: GenerateLessonRequest = {
  ...baseInput,
  goalId: "learn-git",
  goalSlug: "learn-git",
  goalTitle: "Learn Git version control",
  goalCategory: "DevOps",
  goalType: "Skill",
  topicId: "git-branching",
  topicTitle: "Git Branching",
  skillLevel: "beginner",
};

const promptEngineeringInput: GenerateLessonRequest = {
  ...baseInput,
  goalId: "learn-prompt-engineering",
  goalSlug: "learn-prompt-engineering",
  goalTitle: "Learn Prompt Engineering",
  goalCategory: "AI / Machine Learning",
  goalType: "Skill",
  topicId: "prompt-structure",
  topicTitle: "Prompt Structure",
  skillLevel: "intermediate",
};

function fallbackContext(overrides: Partial<GenerateLessonRequest> = {}) {
  const input = { ...kubernetesInput, ...overrides };

  return {
    goalId: input.goalId,
    goalSlug: input.goalSlug,
    goalTitle: input.goalTitle,
    goalCategory: input.goalCategory,
    topicId: input.topicId,
    topicTitle: input.topicTitle,
    skillLevel: input.skillLevel,
    learningObjectives: input.learningObjectives,
    durationMinutes: input.durationMinutes,
  };
}

describe("deterministic lesson fallbacks", () => {
  it("AWS fallback uses mentor structure with seed teaching content", () => {
    const lesson = resolveDeterministicLesson(
      fallbackContext({
        goalId: "aws-saa-c03",
        goalSlug: "aws-saa-c03",
        topicId: "vpc-networking",
        topicTitle: "VPC Networking",
      }),
    );

    expect(lesson.title).toContain("VPC");
    expect(lesson.sections.map((section) => section.heading)).toEqual([...mentorSectionHeadings()]);
    expect(lesson.sections[2].content.toLowerCase()).toContain("subnet");
    expect(lesson.sections[3].handsOnPractice?.exercise).toBeTruthy();
    expect(containsGenericLessonPhrases(JSON.stringify(lesson))).toBe(false);
  });

  it("Azure fallback uses mentor structure without AWS seed leakage", () => {
    const lesson = resolveDeterministicLesson(
      fallbackContext({
        goalId: "azure-fundamentals",
        goalSlug: "azure-fundamentals",
        goalTitle: "Azure Fundamentals AZ-900",
        goalCategory: "Cloud",
        topicId: "core-azure-services",
        topicTitle: "Core Azure Services",
        skillLevel: "beginner",
      }),
    );

    expect(JSON.stringify(lesson).toLowerCase()).not.toContain("aws global infrastructure");
    expect(JSON.stringify(lesson).toLowerCase()).not.toContain("ec2");
    expect(lesson.title).toContain("Core Azure Services");
    expect(lesson.sections[0].heading).toBe("Lesson Overview");
    expect(lesson.sections[0].content).toContain("Core Azure Services");
    expect(containsGenericLessonPhrases(JSON.stringify(lesson))).toBe(false);
  });

  it("Kubernetes fallback teaches the topic without hardcoded platform snippets", () => {
    const lesson = createDeterministicLessonForLearner(
      fallbackContext({
        goalId: "learn-kubernetes",
        goalSlug: "learn-kubernetes",
        topicId: "kubernetes-networking",
        topicTitle: "Kubernetes Networking",
        learningObjectives: ["Explain Pod networking", "Configure Services"],
      }),
    ).lesson;

    expect(lesson.title).toContain("Kubernetes Networking");
    expect(lesson.sections[0].heading).toBe("Lesson Overview");
    expect(lesson.sections[0].content).toContain("Kubernetes Networking");
    expect(containsGenericLessonPhrases(JSON.stringify(lesson))).toBe(false);
    expect(containsLessonMetaLanguage(JSON.stringify(lesson))).toBe(false);
  });

  it("Python fallback teaches the topic without meta instructional language", () => {
    const lesson = createDeterministicLessonForLearner(
      fallbackContext({
        ...pythonSyntaxInput,
        learningObjectives: pythonSyntaxInput.learningObjectives,
      }),
    ).lesson;

    const body = JSON.stringify(lesson);
    expect(lesson.sections[0].content).toContain("Python Syntax and Basic Data Types");
    expect(body).toMatch(/int|float|bool|str|assignment|print\(/i);
    expect(body).not.toMatch(/today you will work through/i);
    expect(body).not.toMatch(/your roadmap/i);
    expect(body).not.toMatch(/session focus/i);
    expect(containsLessonMetaLanguage(body)).toBe(false);
  });

  it("SQL fallback teaches JOIN concepts from the topic title", () => {
    const lesson = createDeterministicLessonForLearner(fallbackContext(sqlInput)).lesson;

    const body = JSON.stringify(lesson.sections);
    expect(body).toMatch(/INNER JOIN/i);
    expect(body).toMatch(/LEFT JOIN/i);
    expect(body).toMatch(/cardinality/i);
    expect(body).not.toMatch(/Write INNER and LEFT JOINs/i);
    expect(containsLessonMetaLanguage(body)).toBe(false);
  });

  it.each([
    ["Git", gitInput],
    ["Prompt Engineering", promptEngineeringInput],
  ])("%s fallback produces eight mentor sections with hands-on practice", (_label, input) => {
    const lesson = createDeterministicLessonForLearner(fallbackContext(input)).lesson;

    expect(lesson.sections).toHaveLength(8);
    expect(lesson.sections[3].heading).toBe("Hands-on Practice");
    expect(lesson.sections[3].handsOnPractice?.expectedOutcome).toBeTruthy();
    expect(lesson.sections[0].heading).toBe("Lesson Overview");
    expect(lesson.sections[0].content).toContain(input.topicTitle);
    expect(containsGenericLessonPhrases(JSON.stringify(lesson))).toBe(false);
  });
});

describe("generateLessonForLearner service", () => {
  beforeEach(() => {
    mockGeminiGenerateContent.mockReset();
  });

  afterEach(() => {
    delete process.env.GEMINI_API_KEY;
  });

  it("returns AI lesson for AWS goal", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    mockGeminiGenerateContent.mockResolvedValue({
      text: JSON.stringify(buildMentorLessonFixture("AWS VPC Networking Essentials", { cloud: "aws" })),
    });

    const result = await generateLessonForLearner(baseInput);

    expect(result.source).toBe("ai");
    expect(result.lesson.title).toContain("AWS VPC");
  });

  it("returns AI lesson for Azure goal", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    mockGeminiGenerateContent.mockResolvedValue({
      text: JSON.stringify(buildMentorLessonFixture("Azure Cloud Concepts Overview", { cloud: "azure" })),
    });

    const result = await generateLessonForLearner(azureInput);

    expect(result.source).toBe("ai");
    expect(result.lesson.title.toLowerCase()).toContain("azure");
  });

  it("falls back on malformed Gemini output", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    mockGeminiGenerateContent.mockResolvedValue({ text: "not-json" });

    const result = await generateLessonForLearner(kubernetesInput);

    expect(result.source).toBe("deterministic");
    expect(result.fallbackReason).toBe("invalid-json");
    expect(containsGenericLessonPhrases(JSON.stringify(result.lesson))).toBe(false);
  });

  it("falls back when API key is missing", async () => {
    delete process.env.GEMINI_API_KEY;

    const result = await generateLessonForLearner(azureInput);

    expect(result.source).toBe("deterministic");
    expect(JSON.stringify(result.lesson).toLowerCase()).not.toContain("aws global infrastructure");
    expect(containsGenericLessonPhrases(JSON.stringify(result.lesson))).toBe(false);
  });

  it("rejects Azure AI output containing AWS-specific content", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    mockGeminiGenerateContent.mockResolvedValue({
      text: JSON.stringify(buildMentorLessonFixture("Amazon EC2 Compute Essentials", { cloud: "aws" })),
    });

    const result = await generateLessonForLearner(azureInput);

    expect(result.source).toBe("deterministic");
    expect(result.fallbackReason).toBe("structure-validation");
  });

  it("rejects AI output with generic placeholder phrasing", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    const genericLesson = buildMentorLessonFixture("VPC Lesson", { cloud: "aws" });
    genericLesson.sections[0].practicalExample =
      "Imagine you are explaining VPCs to a teammate who needs a concise overview.";

    mockGeminiGenerateContent.mockResolvedValue({
      text: JSON.stringify(genericLesson),
    });

    const result = await generateLessonForLearner(baseInput);

    expect(result.source).toBe("deterministic");
    expect(result.fallbackReason).toBe("structure-validation");
  });

  it("rejects AI output with instructional meta language", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    const metaLesson = buildMentorLessonFixture("VPC Lesson", { cloud: "aws" });
    metaLesson.sections[0].content =
      "Today you will work through VPC networking as part of your learning goal. Session focus: explain key ideas from your roadmap.";

    mockGeminiGenerateContent.mockResolvedValue({
      text: JSON.stringify(metaLesson),
    });

    const result = await generateLessonForLearner(baseInput);

    expect(result.source).toBe("deterministic");
    expect(result.fallbackReason).toBe("structure-validation");
  });
});

describe("lesson schema validation", () => {
  it("accepts valid lesson structure", () => {
    const parsed = aiLessonResponseSchema.safeParse(buildMentorLessonFixture("Valid Lesson"));
    expect(parsed.success).toBe(true);
  });

  it("rejects invalid knowledge check structure", () => {
    const parsed = knowledgeCheckSchema.safeParse({
      question: "Test?",
      options: ["A", "B", "C"],
      correctIndex: 0,
      explanation: "Invalid options count.",
    });

    expect(parsed.success).toBe(false);
  });

  it("rejects lessons with fewer than three common mistakes", () => {
    const lesson = buildMentorLessonFixture("Too Few Mistakes");
    lesson.sections[0].commonMistakes = ["Only one mistake listed here"];

    const parsed = aiLessonResponseSchema.safeParse(lesson);
    expect(parsed.success).toBe(false);
  });

  it("detects generic placeholder phrasing", () => {
    expect(containsGenericLessonPhrases("Imagine you are explaining VPCs")).toBe(true);
    expect(containsGenericLessonPhrases("Create subnets with route tables")).toBe(false);
  });

  it("validates topic-specific AI structure", () => {
    const error = validateAiLessonStructure(buildMentorLessonFixture("VPC Lesson", { cloud: "aws" }), {
      goalSlug: "aws-saa-c03",
      goalCategory: "Cloud",
      topicId: "vpc-networking",
      topicTitle: "VPC Lesson",
    });

    expect(error).toBeNull();
  });

  it("detects AWS-specific text for Azure guardrails", () => {
    expect(containsAwsSpecificTopic("Amazon EC2 instances")).toBe(true);
    expect(containsAwsSpecificTopic("Azure virtual networks")).toBe(false);
  });
});

describe("lesson session cache", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it("reuses cached lesson in the same session", () => {
    const lesson = {
      ...buildMentorLessonFixture("Cached Azure Lesson", { cloud: "azure" }),
      topicId: "cloud-concepts",
      source: "ai" as const,
    };

    writeCachedLesson("azure-fundamentals", lesson);
    const cached = readCachedLesson("azure-fundamentals", "cloud-concepts");

    expect(cached?.title).toBe("Cached Azure Lesson");
    expect(cached?.source).toBe("cache");
  });
});

describe("POST /api/learn/generate-lesson", () => {
  afterEach(() => {
    delete process.env.GEMINI_API_KEY;
  });

  it("returns a validated lesson payload", async () => {
    delete process.env.GEMINI_API_KEY;

    const response = await POST(
      new Request("http://localhost/api/learn/generate-lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(azureInput),
      }),
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.source).toBe("deterministic");
    expect(body.lesson.topicId).toBe("cloud-concepts");
    expect(body.lesson.sections[0].commonMistakes.length).toBeGreaterThanOrEqual(3);
    expect(containsGenericLessonPhrases(JSON.stringify(body.lesson))).toBe(false);
  });
});
