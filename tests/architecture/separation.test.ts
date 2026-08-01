import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { demo } from "@/constants/demo";
import { thresholds } from "@/constants/thresholds";
import { evaluate } from "@/lib/engine/index";
import { createDemoTwin, generateDemoRoadmap } from "@/lib/roadmap/generate-initial";
import type { EngineContext } from "@/types/decisions";

const SRC_ROOT = join(process.cwd(), "src");

function collectSourceFiles(directory: string): string[] {
  const entries = readdirSync(directory);
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = join(directory, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      files.push(...collectSourceFiles(fullPath));
      continue;
    }

    if (fullPath.endsWith(".ts") || fullPath.endsWith(".tsx")) {
      files.push(fullPath);
    }
  }

  return files;
}

const START = "2026-07-17T00:00:00.000Z";

function createBaseContext(): EngineContext {
  return {
    twin: createDemoTwin(START),
    roadmap: generateDemoRoadmap(START),
    nudges: [],
  };
}

describe("architecture separation audit", () => {
  it("keeps Gemini SDK out of the Decision Engine", () => {
    const engineFiles = collectSourceFiles(join(SRC_ROOT, "lib", "engine"));
    const violations = engineFiles.filter((file) => {
      const content = readFileSync(file, "utf8");
      return content.includes("@google/genai") || content.includes("GoogleGenAI");
    });

    expect(violations).toEqual([]);
  });

  it("limits direct Gemini generateContent calls to content modules", () => {
    const sourceFiles = collectSourceFiles(SRC_ROOT);
    const allowed = new Set([
      join(SRC_ROOT, "lib", "ai", "providers", "gemini-provider.ts"),
    ]);

    const violations = sourceFiles.filter((file) => {
      const content = readFileSync(file, "utf8");
      return content.includes("generateContent(") && !allowed.has(file);
    });

    expect(violations).toEqual([]);
  });

  it("routes quiz adaptation only through the deterministic engine", () => {
    const context = createBaseContext();
    const weakResult = evaluate(
      {
        type: "QUIZ_COMPLETED",
        topicId: demo.primaryTopicId,
        score: demo.weakQuizScore,
        totalQuestions: 5,
        timestamp: "2026-07-24T18:00:00.000Z",
      },
      context,
    );

    expect(weakResult.decision.reasons).toContain("QUIZ_BELOW_THRESHOLD");
    expect(weakResult.actions.some((action) => action.action === "ADD_TASKS")).toBe(true);
    expect(weakResult.actions.some((action) => action.action === "MARK_WEAKNESS")).toBe(true);

    const masteryResult = evaluate(
      {
        type: "QUIZ_COMPLETED",
        topicId: demo.primaryTopicId,
        score: demo.masteryQuizScore,
        totalQuestions: 5,
        timestamp: "2026-07-28T20:00:00.000Z",
      },
      {
        ...context,
        twin: {
          ...context.twin,
          weaknesses: [
            {
              topicId: demo.primaryTopicId,
              topicName: "VPC Networking",
              score: demo.weakQuizScore,
              lastAssessedAt: "2026-07-24T18:00:00.000Z",
            },
          ],
        },
      },
    );

    expect(masteryResult.decision.reasons).toContain("QUIZ_MASTERY_ACHIEVED");
    expect(masteryResult.actions.some((action) => action.action === "MARK_STRENGTH")).toBe(true);
    expect(
      masteryResult.actions.some((action) => action.action === "COMPRESS_ROADMAP"),
    ).toBe(true);
  });

  it("does not adapt roadmap on neutral quiz scores", () => {
    const context = createBaseContext();
    const neutralScore = thresholds.weakQuizScore + 1;

    const result = evaluate(
      {
        type: "QUIZ_COMPLETED",
        topicId: demo.primaryTopicId,
        score: neutralScore,
        totalQuestions: 5,
        timestamp: "2026-07-25T12:00:00.000Z",
      },
      context,
    );

    expect(result.actions).toEqual([]);
    expect(result.decision.reasons).toEqual([]);
  });
});
