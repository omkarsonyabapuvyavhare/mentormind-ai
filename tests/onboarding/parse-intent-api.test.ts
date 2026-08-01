import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockGeminiGenerateContent = vi.hoisted(() => vi.fn());

vi.mock("@google/genai", () => ({
  GoogleGenAI: class MockGoogleGenAI {
    models = {
      generateContent: mockGeminiGenerateContent,
    };
  },
}));

import { POST } from "@/app/api/onboarding/parse-intent/route";
import * as parseIntentAi from "@/lib/onboarding/parse-intent-ai";
import { parseLearnerIntent } from "@/lib/onboarding/parse-intent-service";
import { createDraftFromParsedIntent } from "@/lib/onboarding/onboarding-draft";
import { resolveGoalIdentityFromText } from "@/lib/goals/goal-identity";

const AWS_EXAMPLE =
  "I want to pass the AWS Solutions Architect exam in 8 weeks. I know basic cloud concepts and can study 1 hour per day.";

const VALID_AI_PAYLOAD = {
  goal: "Pass AWS Solutions Architect Associate",
  domain: "Cloud Computing",
  goalCategory: "Cloud" as const,
  goalType: "Certification" as const,
  currentSkillLevel: "intermediate" as const,
  targetOutcome: "Pass the AWS SAA-C03 certification",
  durationWeeks: 8,
  studyHoursPerWeek: 7,
  recommendedFocusAreas: ["VPC Networking", "EC2", "S3", "IAM"],
};

describe("parseLearnerIntent service", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    delete process.env.GEMINI_API_KEY;
  });

  it("uses deterministic parsing when no API key is configured", async () => {
    delete process.env.GEMINI_API_KEY;
    delete process.env.XAI_API_KEY;
    const aiSpy = vi.spyOn(parseIntentAi, "parseGoalIntentWithProviders");

    const result = await parseLearnerIntent(AWS_EXAMPLE);

    expect(aiSpy).not.toHaveBeenCalled();
    expect(result.source).toBe("deterministic");
    expect(result.fallbackReason).toBe("missing-api-key");
    expect(
      resolveGoalIdentityFromText(result.parsed.goal, result.parsed.targetOutcome).goalSlug,
    ).toBe("aws-saa-c03");
  });

  it("returns neutral defaults for empty input", async () => {
    const result = await parseLearnerIntent("");

    expect(result.source).toBe("deterministic");
    expect(result.fallbackReason).toBe("empty-input");
    expect(result.parsed.goal).toBe("Personal learning goal");
    expect(result.parsed.goalCategory).toBe("General Technology");
  });

  it("uses AI output when Gemini parsing succeeds", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    vi.spyOn(parseIntentAi, "parseGoalIntentWithProviders").mockResolvedValue({
      ok: true,
      parsed: VALID_AI_PAYLOAD,
      provider: "gemini",
      model: "mock",
    });

    const result = await parseLearnerIntent(AWS_EXAMPLE);

    expect(result.source).toBe("ai");
    expect(result.parsed.currentSkillLevel).toBe("intermediate");
    expect(result.fallbackReason).toBeUndefined();
  });

  it("falls back to deterministic parsing on timeout/null AI response", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    delete process.env.XAI_API_KEY;
    vi.spyOn(parseIntentAi, "parseGoalIntentWithProviders").mockResolvedValue({
      ok: false,
      reason: "validation",
      message: "provider failed",
    });

    const result = await parseLearnerIntent(AWS_EXAMPLE);

    expect(result.source).toBe("deterministic");
    expect(result.fallbackReason).toBe("validation");
    expect(
      resolveGoalIdentityFromText(result.parsed.goal, result.parsed.targetOutcome).goalSlug,
    ).toBe("aws-saa-c03");
    expect(result.parsed.currentSkillLevel).toBe("beginner");
  });

  it("clamps out-of-range AI values in the final response", async () => {
    process.env.GEMINI_API_KEY = "test-key";
    vi.spyOn(parseIntentAi, "parseGoalIntentWithProviders").mockResolvedValue({
      ok: true,
      parsed: {
        ...VALID_AI_PAYLOAD,
        durationWeeks: 2,
        studyHoursPerWeek: 0.5,
      },
      provider: "gemini",
      model: "mock",
    });

    const result = await parseLearnerIntent(AWS_EXAMPLE);

    expect(result.source).toBe("ai");
    expect(result.parsed.durationWeeks).toBe(4);
    expect(result.parsed.studyHoursPerWeek).toBe(1);
  });

  it("does not finalize onboarding input — draft requires learner confirmation", async () => {
    const result = await parseLearnerIntent("I want to learn Python");
    const draft = createDraftFromParsedIntent(result.parsed, "I want to learn Python");

    expect(draft.skillLevel).toBeNull();
    expect(draft.skillLevelConfirmed).toBe(false);
  });
});

describe("POST /api/onboarding/parse-intent", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    delete process.env.GEMINI_API_KEY;
  });

  it("returns parsed intent only", async () => {
    const response = await POST(
      new Request("http://localhost/api/onboarding/parse-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: AWS_EXAMPLE }),
      }),
    );

    expect(response.status).toBe(200);
    const body = await response.json();

    expect(body.source).toBe("deterministic");
    expect(body.parsed.goal).toContain("AWS");
    expect(body.onboardingInput).toBeUndefined();
  });

  it("never fails the request for invalid JSON bodies", async () => {
    const response = await POST(
      new Request("http://localhost/api/onboarding/parse-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{not-json",
      }),
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.source).toBe("deterministic");
    expect(body.fallbackReason).toBe("empty-input");
    expect(body.parsed.goal).toBe("Personal learning goal");
  });
});

describe("parseGoalIntentWithGemini", () => {
  beforeEach(() => {
    mockGeminiGenerateContent.mockReset();
    process.env.GEMINI_API_KEY = "test-key";
  });

  afterEach(() => {
    delete process.env.GEMINI_API_KEY;
  });

  it("returns null when Gemini returns invalid JSON content", async () => {
    const { parseGoalIntentWithGemini } = await import("@/lib/onboarding/parse-intent-ai");

    mockGeminiGenerateContent.mockResolvedValue({
      text: "not-json",
    });

    const result = await parseGoalIntentWithGemini(AWS_EXAMPLE);
    expect(result).toBeNull();
  });

  it("returns null when Gemini times out", async () => {
    const { parseGoalIntentWithGemini } = await import("@/lib/onboarding/parse-intent-ai");

    mockGeminiGenerateContent.mockRejectedValue(new Error("Aborted"));

    const result = await parseGoalIntentWithGemini(AWS_EXAMPLE);
    expect(result).toBeNull();
  });
});
