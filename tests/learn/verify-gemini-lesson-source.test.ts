// @vitest-environment jsdom
/**
 * Live verification: Gemini lesson source + cache. Requires GEMINI_API_KEY.
 * Gated by RUN_GEMINI_LIVE=1 so CI stays offline-friendly.
 */
import fs from "node:fs";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { generateLessonForLearner } from "@/lib/ai/lesson-service";
import {
  fetchGeneratedLesson,
  resetLessonFetchDedupForTests,
} from "@/lib/learn/fetch-generated-lesson";
import { peekCachedLessonOriginalSource } from "@/lib/learn/lesson-session-cache";

function loadEnvLocal(): void {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match) continue;
    const key = match[1];
    const value = match[2].trim().replace(/^["']|["']$/g, "");
    // Always apply .env.local for live verification (do not skip non-empty process env).
    process.env[key] = value;
  }
}

const cases = [
  {
    name: "Python",
    goalId: "live-python",
    goalSlug: "learn-python",
    goalTitle: "I want to learn Python",
    goalCategory: "Programming" as const,
    topicId: "python-syntax-and-basic-data-types",
    topicTitle: "Python Syntax and Basic Data Types",
  },
  {
    name: "SQL",
    goalId: "live-sql",
    goalSlug: "learn-sql",
    goalTitle: "I want to learn SQL",
    goalCategory: "Data" as const,
    topicId: "sql-select-and-filtering",
    topicTitle: "SQL SELECT and Filtering",
  },
  {
    name: "React",
    goalId: "live-react",
    goalSlug: "learn-react",
    goalTitle: "I want to learn React",
    goalCategory: "Web Development" as const,
    topicId: "react-components-and-props",
    topicTitle: "React Components and Props",
  },
  {
    name: "Data Science",
    goalId: "live-ds",
    goalSlug: "learn-data-science",
    goalTitle: "I want to learn Data Science",
    goalCategory: "Data" as const,
    topicId: "exploratory-data-analysis",
    topicTitle: "Exploratory Data Analysis",
  },
];

describe("live Gemini lesson source (gated)", () => {
  beforeEach(() => {
    loadEnvLocal();
    process.env.AI_LESSON_GENERATE_TIMEOUT_MS = "60000";
  });

  it(
    "Python/SQL/React/Data Science return source=ai when Gemini succeeds",
    async () => {
      if (process.env.RUN_GEMINI_LIVE !== "1") {
        console.warn("SKIP: set RUN_GEMINI_LIVE=1 for live Gemini source checks");
        return;
      }
      if (!process.env.GEMINI_API_KEY?.trim()) {
        console.warn("SKIP: GEMINI_API_KEY missing");
        return;
      }

      const results: Array<{ name: string; source: string; reason?: string }> = [];

      for (const c of cases) {
        const result = await generateLessonForLearner({
          goalId: c.goalId,
          goalSlug: c.goalSlug,
          goalTitle: c.goalTitle,
          goalCategory: c.goalCategory,
          goalType: "Skill",
          topicId: c.topicId,
          topicTitle: c.topicTitle,
          skillLevel: "beginner",
          durationMinutes: 45,
          learningObjectives: [`Apply ${c.topicTitle}`, `Explain ${c.topicTitle}`],
          preferredFormats: ["video", "quiz"],
        });
        results.push({
          name: c.name,
          source: result.source,
          reason: result.fallbackReason,
          generationPath: result.generationPath,
          keyConfigured: Boolean(process.env.GEMINI_API_KEY?.trim()),
          timeoutMs: process.env.AI_LESSON_GENERATE_TIMEOUT_MS,
        });
        expect(
          result.source,
          `${c.name} should be ai (reason=${result.fallbackReason ?? "none"})`,
        ).toBe("ai");
        expect(result.generationPath).toBe("ai");
      }

      console.info("[verify-gemini-lesson-source]", results);
    },
    480_000,
  );
});

describe("live Gemini cache path via API (gated)", () => {
  beforeEach(() => {
    loadEnvLocal();
    process.env.AI_LESSON_GENERATE_TIMEOUT_MS = "60000";
    window.sessionStorage.clear();
    resetLessonFetchDedupForTests();
  });

  afterEach(() => {
    window.sessionStorage.clear();
    resetLessonFetchDedupForTests();
  });

  it(
    "first fetch ai, second fetch cache with original Gemini",
    async () => {
      if (process.env.RUN_GEMINI_LIVE !== "1") {
        console.warn("SKIP: set RUN_GEMINI_LIVE=1 for live cache check");
        return;
      }

      // Absolute URL for jsdom fetch
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
        const ready = await originalFetch("http://localhost:3000/").then(
          (r) => r.ok || r.status < 500,
          () => false,
        );
        if (!ready) {
          console.warn("SKIP: localhost:3000 not reachable");
          return;
        }

        const request = {
          goalId: "browser-python",
          goalSlug: "learn-python",
          goalTitle: "I want to learn Python",
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

        const first = await fetchGeneratedLesson(request);
        expect(first.source).toBe("ai");
        expect(peekCachedLessonOriginalSource(request.goalId, request.topicId)).toBe("ai");

        const second = await fetchGeneratedLesson(request);
        expect(second.source).toBe("cache");
        expect(peekCachedLessonOriginalSource(request.goalId, request.topicId)).toBe("ai");
      } finally {
        globalThis.fetch = originalFetch;
      }
    },
    180_000,
  );
});
