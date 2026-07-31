/**
 * Live diagnosis: capture one Gemini lesson JSON and list every Zod issue.
 * Never logs the API key. Skips when key missing.
 */
import fs from "node:fs";
import path from "node:path";
import { GoogleGenAI } from "@google/genai";
import { describe, expect, it } from "vitest";

import { aiLessonResponseSchema } from "@/lib/ai/lesson-schema";
import {
  buildSystemPrompt,
  buildUserPrompt,
  type GenerateLessonInput,
} from "@/lib/ai/generate-lesson";

function loadEnvLocal(): void {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match) continue;
    const key = match[1];
    const value = match[2].trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

function summarizeRaw(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== "object") {
    return { topType: typeof raw };
  }
  const obj = raw as Record<string, unknown>;
  const sections = Array.isArray(obj.sections) ? obj.sections : [];
  return {
    topKeys: Object.keys(obj),
    titleType: typeof obj.title,
    estimatedMinutesType: typeof obj.estimatedMinutes,
    learningObjectivesLen: Array.isArray(obj.learningObjectives)
      ? obj.learningObjectives.length
      : null,
    hasPracticalArtifact: Boolean(obj.practicalArtifact),
    practicalArtifactKeys:
      obj.practicalArtifact && typeof obj.practicalArtifact === "object"
        ? Object.keys(obj.practicalArtifact as object)
        : null,
    practicalArtifactType:
      obj.practicalArtifact && typeof obj.practicalArtifact === "object"
        ? (obj.practicalArtifact as { type?: unknown }).type
        : null,
    hasHandsOnExercise: Boolean(obj.handsOnExercise),
    handsOnExerciseKeys:
      obj.handsOnExercise && typeof obj.handsOnExercise === "object"
        ? Object.keys(obj.handsOnExercise as object)
        : null,
    handsOnInstructionsLen:
      obj.handsOnExercise &&
      typeof obj.handsOnExercise === "object" &&
      Array.isArray((obj.handsOnExercise as { instructions?: unknown }).instructions)
        ? (obj.handsOnExercise as { instructions: unknown[] }).instructions.length
        : null,
    handsOnHintsLen:
      obj.handsOnExercise &&
      typeof obj.handsOnExercise === "object" &&
      Array.isArray((obj.handsOnExercise as { hints?: unknown }).hints)
        ? (obj.handsOnExercise as { hints: unknown[] }).hints.length
        : null,
    sectionsLen: sections.length,
    sectionSummaries: sections.map((section, index) => {
      if (!section || typeof section !== "object") {
        return { index, type: typeof section };
      }
      const s = section as Record<string, unknown>;
      const kc = Array.isArray(s.knowledgeCheck) ? s.knowledgeCheck : [];
      return {
        index,
        heading: typeof s.heading === "string" ? s.heading : typeof s.heading,
        contentLen: typeof s.content === "string" ? s.content.length : null,
        practicalExampleLen:
          typeof s.practicalExample === "string" ? s.practicalExample.length : null,
        commonMistakesLen: Array.isArray(s.commonMistakes) ? s.commonMistakes.length : null,
        summaryLen: Array.isArray(s.summary) ? s.summary.length : null,
        knowledgeCheckLen: kc.length,
        knowledgeCheckOptionLens: kc.map((check) =>
          check && typeof check === "object" && Array.isArray((check as { options?: unknown }).options)
            ? (check as { options: unknown[] }).options.length
            : null,
        ),
        hasHandsOnPractice: Boolean(s.handsOnPractice),
      };
    }),
  };
}

function classifyIssue(pathStr: string, code: string, message: string): string {
  const lower = `${code} ${message}`.toLowerCase();
  if (lower.includes("required") || code === "invalid_type" && message.includes("undefined")) {
    return "missing-or-wrong-type";
  }
  if (lower.includes("enum") || code === "invalid_enum_value" || code === "invalid_value") {
    return "enum-mismatch";
  }
  if (pathStr.includes("options") || lower.includes("tuple")) {
    return "array-or-tuple-mismatch";
  }
  if (lower.includes("too_small") || lower.includes("too_big") || lower.includes("max") || lower.includes("min")) {
    return "length-violation";
  }
  if (pathStr.includes("practicalArtifact")) return "practicalArtifact";
  if (pathStr.includes("handsOnExercise")) return "handsOnExercise";
  if (pathStr.includes("knowledgeCheck")) return "knowledgeChecks";
  return code || "other";
}

describe("diagnose Gemini lesson schema (live)", () => {
  it(
    "captures raw Gemini JSON and lists Zod failures",
    async () => {
      if (process.env.RUN_GEMINI_DIAGNOSE !== "1") {
        console.warn("SKIP: set RUN_GEMINI_DIAGNOSE=1 to run live diagnosis");
        return;
      }

      loadEnvLocal();
      const apiKey = process.env.GEMINI_API_KEY?.trim();
      if (!apiKey) {
        console.warn("SKIP: GEMINI_API_KEY not set");
        return;
      }

      process.env.AI_LESSON_GENERATE_TIMEOUT_MS = "120000";

      const input: GenerateLessonInput = {
        goalId: "diagnose-python",
        goalSlug: "learn-python",
        goalTitle: "I want to learn Python",
        goalCategory: "Programming",
        goalType: "Skill",
        topicId: "python-syntax-and-basic-data-types",
        topicTitle: "Python Syntax and Basic Data Types",
        skillLevel: "beginner",
        durationMinutes: 45,
        learningObjectives: [
          "Declare Python variables with correct syntax",
          "Identify basic Python data types",
        ],
        preferredFormats: ["video", "quiz"],
      };

      const client = new GoogleGenAI({ apiKey });
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120_000);
      const started = Date.now();

      let content: string | undefined;
      try {
        const response = await client.models.generateContent({
          model: process.env.GEMINI_MODEL?.trim() || "gemini-3-flash-preview",
          contents: buildUserPrompt(input),
          config: {
            systemInstruction: buildSystemPrompt(),
            responseMimeType: "application/json",
            abortSignal: controller.signal,
          },
        });
        content = response.text;
      } finally {
        clearTimeout(timeoutId);
      }

      expect(content, "Gemini returned empty content").toBeTruthy();
      const raw = JSON.parse(content!);
      const summary = summarizeRaw(raw);
      const validated = aiLessonResponseSchema.safeParse(raw);

      const issues = validated.success
        ? []
        : validated.error.issues.map((issue) => ({
            path: issue.path.join("."),
            code: issue.code,
            message: issue.message,
            category: classifyIssue(issue.path.join("."), issue.code, issue.message),
          }));

      const report = {
        durationMs: Date.now() - started,
        schemaOk: validated.success,
        issueCount: issues.length,
        issues,
        categories: [...new Set(issues.map((i) => i.category))],
        rawSummary: summary,
      };

      const outDir = path.resolve(process.cwd(), ".tmp");
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(path.join(outDir, "gemini-lesson-raw.json"), JSON.stringify(raw, null, 2));
      fs.writeFileSync(
        path.join(outDir, "gemini-lesson-schema-report.json"),
        JSON.stringify(report, null, 2),
      );

      console.info("[diagnose-gemini-lesson-schema]", JSON.stringify(report, null, 2));

      // Diagnostic test always "passes" so we can read the report; assertions come after the fix.
      expect(report.durationMs).toBeGreaterThan(0);
    },
    150_000,
  );
});
