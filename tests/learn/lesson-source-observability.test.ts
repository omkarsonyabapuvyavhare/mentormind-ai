import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockGenerateLessonWithGemini = vi.hoisted(() => vi.fn());
const mockIsGeminiConfigured = vi.hoisted(() => vi.fn());

vi.mock("@/lib/ai/generate-lesson", () => ({
  generateLessonWithGemini: mockGenerateLessonWithGemini,
  getLessonGeminiModel: () => "mock-gemini",
}));

vi.mock("@/lib/onboarding/parse-intent-ai", () => ({
  isGeminiConfigured: mockIsGeminiConfigured,
}));

import { generateLessonForLearner } from "@/lib/ai/lesson-service";
import { createDeterministicLessonForLearner } from "@/lib/ai/lesson-fallback";
import {
  getServerLessonFallbackPath,
  resetServerLessonFallbackPath,
  setServerLessonFallbackPath,
} from "@/lib/dev/lesson-source-observability";
import { buildMentorLessonFixture } from "../helpers/mentor-lesson-fixture";

const input = {
  goalId: "learn-data-science",
  goalSlug: "learn-data-science",
  goalTitle: "Learn Data Science",
  goalCategory: "Data" as const,
  goalType: "Skill" as const,
  topicId: "python-for-data-science",
  topicTitle: "Python for Data Science",
  skillLevel: "beginner" as const,
  durationMinutes: 45,
  preferredFormats: ["video" as const, "quiz" as const],
  learningObjectives: [
    "Apply Python for Data Science in a concrete worked example",
    "Identify and correct common mistakes when using Python for Data Science",
  ],
};

describe("lesson source observability paths", () => {
  beforeEach(() => {
    mockGenerateLessonWithGemini.mockReset();
    mockIsGeminiConfigured.mockReset();
    resetServerLessonFallbackPath();
  });

  afterEach(() => {
    resetServerLessonFallbackPath();
  });

  it("Gemini success → source ai / generationPath ai", async () => {
    mockIsGeminiConfigured.mockReturnValue(true);
    mockGenerateLessonWithGemini.mockResolvedValue({
      ok: true,
      data: buildMentorLessonFixture("Python for Data Science", {
        topicId: "python-for-data-science",
      }),
    });

    const result = await generateLessonForLearner(input);

    expect(result.source).toBe("ai");
    expect(result.generationPath).toBe("ai");
    expect(result.fallbackReason).toBeUndefined();
    expect(mockGenerateLessonWithGemini).toHaveBeenCalledTimes(1);
  });

  it("Gemini invalid response → deterministic fallback with reason", async () => {
    mockIsGeminiConfigured.mockReturnValue(true);
    mockGenerateLessonWithGemini.mockResolvedValue({
      ok: false,
      reason: "schema-validation",
    });

    const result = await generateLessonForLearner(input);

    expect(result.source).toBe("deterministic");
    expect(result.fallbackReason).toBe("schema-validation");
    expect(["deterministic", "emergency"]).toContain(result.generationPath);
    expect(mockGenerateLessonWithGemini).toHaveBeenCalledTimes(1);
  });

  it("Gemini timeout/request-error → deterministic fallback", async () => {
    mockIsGeminiConfigured.mockReturnValue(true);
    mockGenerateLessonWithGemini.mockResolvedValue({
      ok: false,
      reason: "request-error",
    });

    const result = await generateLessonForLearner(input);

    expect(result.source).toBe("deterministic");
    expect(result.fallbackReason).toBe("request-error");
    expect(result.generationPath).toBeDefined();
  });

  it("missing API key skips Gemini entirely", async () => {
    mockIsGeminiConfigured.mockReturnValue(false);

    const result = await generateLessonForLearner(input);

    expect(result.source).toBe("deterministic");
    expect(result.fallbackReason).toBe("missing-api-key");
    expect(mockGenerateLessonWithGemini).not.toHaveBeenCalled();
  });

  it("emergency path marker is set when requested", () => {
    setServerLessonFallbackPath("emergency");
    expect(getServerLessonFallbackPath()).toBe("emergency");
    resetServerLessonFallbackPath();
    expect(getServerLessonFallbackPath()).toBe("deterministic");
  });

  it("client/server deterministic helper remains deterministic source", () => {
    const fallback = createDeterministicLessonForLearner(input, "structure-validation");
    expect(fallback.source).toBe("deterministic");
    expect(fallback.lesson.title.toLowerCase()).toContain("python");
  });
});
