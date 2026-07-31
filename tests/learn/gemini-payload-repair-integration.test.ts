import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { normalizeGeminiLessonPayload } from "@/lib/ai/generate-lesson";
import {
  aiLessonResponseSchema,
  validateAiLessonStructure,
} from "@/lib/ai/lesson-schema";

describe("Gemini payload repair integration", () => {
  it("normalizes the captured failing Gemini lesson into a valid ai lesson", () => {
    const rawPath = path.resolve(process.cwd(), ".tmp/gemini-lesson-raw.json");
    if (!fs.existsSync(rawPath)) {
      console.warn("SKIP: .tmp/gemini-lesson-raw.json missing");
      return;
    }

    const raw = JSON.parse(fs.readFileSync(rawPath, "utf8"));
    const normalized = normalizeGeminiLessonPayload(raw);
    const parsed = aiLessonResponseSchema.safeParse(normalized);
    expect(parsed.success, JSON.stringify(parsed.success ? null : parsed.error.issues)).toBe(
      true,
    );
    if (!parsed.success) return;

    const structureError = validateAiLessonStructure(parsed.data, {
      goalSlug: "learn-python",
      goalCategory: "Programming",
      topicId: "python-syntax-and-basic-data-types",
      topicTitle: "Python Syntax and Basic Data Types",
      learningObjectives: [
        "Declare Python variables with correct syntax",
        "Identify basic Python data types",
      ],
    });
    expect(structureError).toBeNull();
  });
});
