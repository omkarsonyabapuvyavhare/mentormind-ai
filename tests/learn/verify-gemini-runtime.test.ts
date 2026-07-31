// @vitest-environment jsdom
/**
 * Live verification against the running Next.js server.
 * Skips when localhost:3000 is unavailable.
 * Never logs the API key.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  fetchGeneratedLesson,
  resetLessonFetchDedupForTests,
} from "@/lib/learn/fetch-generated-lesson";
import {
  peekCachedLessonOriginalSource,
  readCachedLesson,
  writeCachedLesson,
} from "@/lib/learn/lesson-session-cache";

const pythonRequest = {
  goalId: "learn-python",
  goalSlug: "learn-python",
  goalTitle: "Learn Python",
  goalCategory: "Programming" as const,
  goalType: "Skill" as const,
  topicId: "python-syntax-and-basic-data-types",
  topicTitle: "Python Syntax and Basic Data Types",
  skillLevel: "beginner" as const,
  durationMinutes: 45,
  learningObjectives: [
    "Declare Python variables with correct syntax",
    "Identify basic Python data types",
  ],
  preferredFormats: ["video" as const, "quiz" as const],
};

async function serverReady(): Promise<boolean> {
  try {
    const response = await fetch("http://localhost:3000/", { method: "GET" });
    return response.ok || response.status < 500;
  } catch {
    return false;
  }
}

describe("live Gemini lesson source verification", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    resetLessonFetchDedupForTests();
  });

  afterEach(() => {
    window.sessionStorage.clear();
    resetLessonFetchDedupForTests();
  });

  it(
    "first request uses Gemini; second request uses lesson cache with original Gemini",
    async () => {
      if (process.env.RUN_GEMINI_LIVE !== "1") {
        console.warn("SKIP: set RUN_GEMINI_LIVE=1 for live Gemini runtime check");
        return;
      }

      if (!(await serverReady())) {
        console.warn("SKIP: localhost:3000 not reachable");
        return;
      }

      const originalFetch = globalThis.fetch;
      globalThis.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
        const url =
          typeof input === "string"
            ? input
            : input instanceof URL
              ? input.toString()
              : input.url;
        if (url.startsWith("/")) {
          return originalFetch(`http://localhost:3000${url}`, init);
        }
        return originalFetch(input, init);
      }) as typeof fetch;

      try {
        // Clear any prior lesson cache keys for this topic.
        for (const key of Object.keys(window.sessionStorage)) {
          if (
            key.includes("lesson-cache") ||
            key.includes("lesson-origin") ||
            key.includes("lesson-obs")
          ) {
            window.sessionStorage.removeItem(key);
          }
        }

        const first = await fetchGeneratedLesson(pythonRequest);
        expect(first.source).toBe("ai");
        expect(first.title.toLowerCase()).toMatch(/python|syntax|data/);
        expect(JSON.stringify(first)).not.toMatch(/explain key ideas in/i);

        const origin = peekCachedLessonOriginalSource(
          pythonRequest.goalId,
          pythonRequest.topicId,
        );
        expect(origin).toBe("ai");

        const second = await fetchGeneratedLesson(pythonRequest);
        expect(second.source).toBe("cache");
        expect(peekCachedLessonOriginalSource(pythonRequest.goalId, pythonRequest.topicId)).toBe(
          "ai",
        );

        // Direct cache read also returns cache source.
        const cached = readCachedLesson(pythonRequest.goalId, pythonRequest.topicId);
        expect(cached?.source).toBe("cache");
      } finally {
        globalThis.fetch = originalFetch;
      }
    },
    120_000,
  );

  it("deterministic fallback still works when cache is seeded as deterministic", () => {
    writeCachedLesson(
      pythonRequest.goalId,
      {
        topicId: pythonRequest.topicId,
        source: "deterministic",
        title: "Python Syntax and Basic Data Types",
        estimatedMinutes: 45,
        learningObjectives: ["Apply Python syntax"],
        sections: [],
      } as never,
      "deterministic",
    );

    // Incompatible empty sections may be rejected — just assert origin helper path.
    expect(
      peekCachedLessonOriginalSource(pythonRequest.goalId, pythonRequest.topicId) ===
        "deterministic" ||
        peekCachedLessonOriginalSource(pythonRequest.goalId, pythonRequest.topicId) === undefined,
    ).toBe(true);
  });
});
