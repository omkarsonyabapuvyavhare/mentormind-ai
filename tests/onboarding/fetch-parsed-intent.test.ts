import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  buildClientFallbackParseIntent,
  fetchParsedIntent,
  fetchParsedIntentWithMinimumDelay,
} from "@/lib/onboarding/fetch-parsed-intent";
import { createDraftFromParsedIntent } from "@/lib/onboarding/onboarding-draft";
import { resolveGoalIdentityFromText } from "@/lib/goals/goal-identity";

const AWS_EXAMPLE =
  "I want to pass the AWS Solutions Architect exam in 8 weeks. I know basic cloud concepts and can study 1 hour per day.";

describe("fetchParsedIntent", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns validated API response on success", async () => {
    const mockResponse = buildClientFallbackParseIntent(AWS_EXAMPLE);
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await fetchParsedIntent(AWS_EXAMPLE);

    expect(fetch).toHaveBeenCalledWith("/api/onboarding/parse-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: AWS_EXAMPLE }),
    });
    expect(
      resolveGoalIdentityFromText(result.parsed.goal, result.parsed.targetOutcome).goalSlug,
    ).toBe("aws-saa-c03");
    expect(result.parsed).toBeDefined();
  });

  it("falls back silently when the API request fails", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("network error"));

    const result = await fetchParsedIntent(AWS_EXAMPLE);

    expect(result.source).toBe("deterministic");
    expect(result.fallbackReason).toBe("network");
    expect(
      resolveGoalIdentityFromText(result.parsed.goal, result.parsed.targetOutcome).goalSlug,
    ).toBe("aws-saa-c03");
  });

  it("falls back silently when the API returns a non-OK status", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      json: async () => ({}),
    } as Response);

    const result = await fetchParsedIntent(AWS_EXAMPLE);

    expect(result.source).toBe("deterministic");
    expect(result.fallbackReason).toBe("network");
  });

  it("waits for both the API response and the minimum loading delay", async () => {
    vi.useFakeTimers();
    const mockResponse = buildClientFallbackParseIntent(AWS_EXAMPLE);

    vi.mocked(fetch).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => mockResponse,
            } as Response);
          }, 500);
        }),
    );

    const promise = fetchParsedIntentWithMinimumDelay(AWS_EXAMPLE, 2_000);
    await vi.advanceTimersByTimeAsync(2_000);
    const result = await promise;

    expect(
      resolveGoalIdentityFromText(result.parsed.goal, result.parsed.targetOutcome).goalSlug,
    ).toBe("aws-saa-c03");
    vi.useRealTimers();
  });
});

describe("buildClientFallbackParseIntent", () => {
  it("builds a deterministic fallback from free text without finalized onboarding input", () => {
    const result = buildClientFallbackParseIntent(AWS_EXAMPLE);

    expect(result.source).toBe("deterministic");
    expect(result.parsed.goal).toContain("AWS");
    expect(result.fallbackReason).toBe("network");

    const draft = createDraftFromParsedIntent(result.parsed, AWS_EXAMPLE);
    expect(draft.skillLevelConfirmed).toBe(false);
  });
});
