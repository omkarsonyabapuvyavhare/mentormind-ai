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
  knowledgeCheckSchema,
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

function validLesson(title: string) {
  const knowledgeCheck = (question: string, conceptTag: string) => ({
    question,
    options: [
      "Apply the concept in practice",
      "Use invalid syntax for this concept",
      "Confuse this with an unrelated feature",
      "Skip validating the result",
    ] as [string, string, string, string],
    correctIndex: 0,
    explanation: "Practice reinforces the lesson objective.",
    conceptTag,
  });

  return {
    title,
    estimatedMinutes: 45,
    learningObjectives: [`Understand ${title}`],
    sections: [
      {
        heading: "Core concepts",
        content: "Focused lesson content for the requested topic with practical framing.",
        practicalExample: "Apply the concept in a realistic scenario tied to the learner goal.",
        commonMistakes: ["Studying without connecting concepts to practice"],
        summary: ["Review the core idea before moving to the next task"],
        knowledgeCheck: [
          knowledgeCheck(`Which statement best describes a core idea in ${title}?`, "core-concept-a"),
          knowledgeCheck(`Which example applies ${title} correctly?`, "core-concept-b"),
          knowledgeCheck(`Which mistake should you avoid in ${title}?`, "core-concept-c"),
        ],
      },
      {
        heading: "Applied practice",
        content: "Second section content continues the lesson with applied learning.",
        practicalExample: "Walk through one scenario and identify the key decisions.",
        commonMistakes: ["Memorizing without understanding"],
        summary: ["Connect this topic to your next roadmap milestone"],
        knowledgeCheck: [
          knowledgeCheck(`Which applied scenario fits ${title}?`, "applied-concept-a"),
          knowledgeCheck(`Which decision validates understanding of ${title}?`, "applied-concept-b"),
        ],
      },
    ],
  };
}

describe("deterministic lesson fallbacks", () => {
  it("AWS fallback uses existing seed lesson content", () => {
    const lesson = resolveDeterministicLesson({
      goalId: "aws-saa-c03",
      topicId: "vpc-networking",
      topicTitle: "VPC Networking",
    });

    expect(lesson.title).toContain("VPC");
    expect(JSON.stringify(lesson).toLowerCase()).toContain("aws");
  });

  it("Azure fallback never includes AWS lesson content", () => {
    const lesson = resolveDeterministicLesson({
      goalId: "azure-fundamentals",
      topicId: "core-azure-services",
      topicTitle: "Core Azure Services",
    });

    expect(JSON.stringify(lesson).toLowerCase()).not.toContain("aws global infrastructure");
    expect(JSON.stringify(lesson).toLowerCase()).not.toContain("ec2");
    expect(lesson.title).toContain("Core Azure Services");
  });

  it("custom Kubernetes goal produces a generic topic lesson", () => {
    const lesson = createDeterministicLessonForLearner({
      goalId: "learn-kubernetes",
      topicId: "kubernetes-networking",
      topicTitle: "Kubernetes Networking",
    }).lesson;

    expect(lesson.title).toContain("Kubernetes Networking");
    expect(JSON.stringify(lesson).toLowerCase()).not.toContain("amazon web services");
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
      text: JSON.stringify(validLesson("AWS VPC Networking Essentials")),
    });

    const result = await generateLessonForLearner(baseInput);

    expect(result.source).toBe("ai");
    expect(result.lesson.title).toContain("AWS VPC");
  });

  it("returns AI lesson for Azure goal", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    mockGeminiGenerateContent.mockResolvedValue({
      text: JSON.stringify(validLesson("Azure Cloud Concepts Overview")),
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
  });

  it("falls back when API key is missing", async () => {
    delete process.env.GEMINI_API_KEY;

    const result = await generateLessonForLearner(azureInput);

    expect(result.source).toBe("deterministic");
    expect(JSON.stringify(result.lesson).toLowerCase()).not.toContain("aws global infrastructure");
  });

  it("rejects Azure AI output containing AWS-specific content", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    mockGeminiGenerateContent.mockResolvedValue({
      text: JSON.stringify(validLesson("Amazon EC2 Compute Essentials")),
    });

    const result = await generateLessonForLearner(azureInput);

    expect(result.source).toBe("deterministic");
    expect(result.fallbackReason).toBe("structure-validation");
  });
});

describe("lesson schema validation", () => {
  it("accepts valid lesson structure", () => {
    const parsed = aiLessonResponseSchema.safeParse(validLesson("Valid Lesson"));
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
      ...validLesson("Cached Azure Lesson"),
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
  });
});
