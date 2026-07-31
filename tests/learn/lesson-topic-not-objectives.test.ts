import { describe, expect, it } from "vitest";

import { buildSystemPrompt, buildUserPrompt } from "@/lib/ai/generate-lesson";
import { createDeterministicLessonForLearner } from "@/lib/ai/lesson-fallback";
import {
  findObjectiveEchoViolation,
  validateAiLessonStructure,
} from "@/lib/ai/lesson-schema";
import { deriveTopicTeachingConcepts } from "@/lib/ai/lesson-topic-concepts";
import { buildMentorLessonFixture } from "../helpers/mentor-lesson-fixture";

describe("topic-first lesson content", () => {
  it("derives Data Engineering concepts from the topic title, not objectives", () => {
    const concepts = deriveTopicTeachingConcepts({
      topicTitle: "Data Engineering Fundamentals",
      topicId: "data-engineering-fundamentals",
      goalTitle: "I want to learn Data Engineering",
      goalCategory: "Data",
    });

    expect(concepts.join(" ")).toMatch(/ETL vs ELT/i);
    expect(concepts.join(" ")).toMatch(/Batch vs Streaming/i);
    expect(concepts.join(" ")).toMatch(/Data Lakes/i);
    expect(concepts.join(" ")).not.toMatch(/Apply Data Engineering Fundamentals/i);
  });

  it("fallback Data Engineering lesson teaches the topic instead of echoing objectives", () => {
    const { lesson } = createDeterministicLessonForLearner({
      goalId: "learn-data-engineering",
      goalSlug: "learn-data-engineering",
      goalTitle: "I want to learn Data Engineering",
      goalCategory: "Data",
      topicId: "data-engineering-fundamentals",
      topicTitle: "Data Engineering Fundamentals",
      skillLevel: "beginner",
      learningObjectives: [
        "Apply Data Engineering Fundamentals in a concrete worked example",
        "Explain core mechanics of Data Engineering Fundamentals",
      ],
    });

    const body = JSON.stringify(lesson.sections);
    expect(body).toMatch(/ETL/i);
    expect(body).toMatch(/ELT/i);
    expect(body).toMatch(/batch/i);
    expect(body).toMatch(/streaming/i);
    expect(body).toMatch(/data lake/i);
    expect(body).toMatch(/warehouse/i);
    expect(body).toMatch(/Spark/i);
    expect(body).toMatch(/Airflow/i);
    expect(body).not.toMatch(/Apply Data Engineering Fundamentals in a concrete worked example/i);
    expect(body).not.toMatch(/Explain core mechanics of Data Engineering Fundamentals/i);
    expect(body).not.toMatch(/Foundations workflow/i);
    expect(body).not.toMatch(/Apply Data Engineering Fundamentals directly/i);

    expect(
      findObjectiveEchoViolation(lesson, [
        "Apply Data Engineering Fundamentals in a concrete worked example",
        "Explain core mechanics of Data Engineering Fundamentals",
      ]),
    ).toBeNull();
  });

  it("rejects lessons that paste objectives into body paragraphs", () => {
    const lesson = buildMentorLessonFixture("Data Engineering Fundamentals", {
      domainHint: "data engineering pipelines ETL",
    });
    lesson.practicalArtifact = {
      type: "workflow",
      title: "Ingest to curated warehouse flow",
      content:
        "1. Extract orders from OLTP\n2. Validate null keys\n3. Transform to star schema\n4. Load curated fact_orders\n5. Monitor freshness SLA",
      explanation: "Each stage moves data closer to analytics-ready tables with quality gates.",
    };
    lesson.handsOnExercise = {
      instructions: [
        "Add one data-quality check before the load step.",
        "Identify where batch freshness would break.",
        "Write the corrected pipeline stage order.",
      ],
      hints: ["Quality checks belong before curated loads."],
      expectedOutcome: "A pipeline stage list with a pre-load quality gate.",
      solutionExplanation: "Quality gates prevent bad rows from reaching warehouse tables.",
    };
    lesson.sections[0] = {
      ...lesson.sections[0],
      content:
        "Apply Data Engineering Fundamentals in a concrete worked example. Explain core mechanics of Data Engineering Fundamentals. Apply Data Engineering Fundamentals in a concrete worked example again before continuing. Foundations workflow steps are listed next.",
      summary: [
        "Apply Data Engineering Fundamentals in a concrete worked example",
        "Explain core mechanics of Data Engineering Fundamentals",
        "Foundations workflow checklist",
      ],
    };

    const violation = findObjectiveEchoViolation(lesson, [
      "Apply Data Engineering Fundamentals in a concrete worked example",
      "Explain core mechanics of Data Engineering Fundamentals",
    ]);
    expect(violation).toBeTruthy();

    const structureError = validateAiLessonStructure(lesson, {
      goalSlug: "learn-data-engineering",
      goalCategory: "Data",
      topicId: "data-engineering-fundamentals",
      topicTitle: "Data Engineering Fundamentals",
      learningObjectives: [
        "Apply Data Engineering Fundamentals in a concrete worked example",
        "Explain core mechanics of Data Engineering Fundamentals",
      ],
    });
    expect(structureError).toMatch(/objective|paragraphs repeat/i);
  });

  it("prompt hierarchy makes topic primary and objectives a silent checklist", () => {
    const system = buildSystemPrompt();
    const user = buildUserPrompt({
      goalId: "learn-data-engineering",
      goalSlug: "learn-data-engineering",
      goalTitle: "I want to learn Data Engineering",
      goalCategory: "Data",
      goalType: "Skill",
      topicId: "data-engineering-fundamentals",
      topicTitle: "Data Engineering Fundamentals",
      skillLevel: "beginner",
      durationMinutes: 45,
      learningObjectives: [
        "Apply Data Engineering Fundamentals in a concrete worked example",
      ],
      preferredFormats: ["video", "quiz"],
    });

    expect(system).toContain("topicTitle — PRIMARY");
    expect(system).toContain("coverage checklist ONLY");
    expect(system).toContain("NEVER quote");
    expect(user).toContain("coverageChecklistOnly_doNotEcho");
    expect(user).toContain("Teach \"Data Engineering Fundamentals\"");
  });
});
