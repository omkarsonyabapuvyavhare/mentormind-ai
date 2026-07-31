// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  isIncompatibleCachedLesson,
  LESSON_CACHE_VERSION,
  readCachedLesson,
  writeCachedLesson,
} from "@/lib/learn/lesson-session-cache";
import { buildMentorLessonFixture } from "../helpers/mentor-lesson-fixture";

describe("lesson cache stale rejection (v4)", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    process.env.NODE_ENV = "development";
  });

  afterEach(() => {
    window.sessionStorage.clear();
  });

  it("uses cache version v4", () => {
    expect(LESSON_CACHE_VERSION).toBe("v4");
  });

  it("rejects objective-driven Data Engineering cache payloads", () => {
    const stale = {
      ...buildMentorLessonFixture("Data Engineering Fundamentals", {
        domainHint: "data engineering",
      }),
      topicId: "data-engineering-fundamentals",
      source: "deterministic" as const,
      sections: buildMentorLessonFixture("Data Engineering Fundamentals").sections.map(
        (section, index) =>
          index === 0
            ? {
                ...section,
                content:
                  "Apply Data Engineering Fundamentals in a concrete worked example. Define inputs and success criteria. Execute the core steps for Foundations workflow.",
                practicalExample: "Define inputs and success criteria, then execute the core steps.",
                summary: [
                  "Apply Data Engineering Fundamentals in a concrete worked example",
                  "Define inputs and success criteria",
                  "Execute the core steps",
                ],
              }
            : section,
      ),
      practicalArtifact: {
        type: "workflow" as const,
        title: "Concrete worked example",
        content: "Complete a concrete worked example for Data Engineering Fundamentals.",
        explanation: "Follow the concrete worked example checklist.",
      },
    };

    expect(isIncompatibleCachedLesson(stale, stale.topicId)).toBe(true);

    writeCachedLesson("learn-data-engineering", stale, "deterministic");
    expect(readCachedLesson("learn-data-engineering", stale.topicId)).toBeNull();
  });

  it("rejects Data Engineering Fundamentals lessons missing core concepts", () => {
    const thin = {
      ...buildMentorLessonFixture("Data Engineering Fundamentals"),
      topicId: "data-engineering-fundamentals",
      source: "deterministic" as const,
      title: "Data Engineering Fundamentals",
      practicalArtifact: {
        type: "workflow" as const,
        title: "Generic workflow",
        content: "1. Start\n2. Middle\n3. End",
        explanation: "A generic workflow with no domain tools.",
      },
      sections: buildMentorLessonFixture("Data Engineering Fundamentals").sections.map(
        (section) => ({
          ...section,
          content:
            "This section discusses abstract study habits for the topic without naming storage systems or pipelines.",
          practicalExample: "Write notes about the topic.",
          summary: ["Study the topic", "Review notes", "Practice later"],
          commonMistakes: ["Skipping practice", "Rushing ahead", "Ignoring feedback"],
        }),
      ),
    };

    expect(isIncompatibleCachedLesson(thin, thin.topicId)).toBe(true);
  });

  it("accepts topic-first Data Engineering Fundamentals content", () => {
    const fresh = {
      ...buildMentorLessonFixture("Data Engineering Fundamentals", {
        domainHint: "data engineering ETL pipeline warehouse",
      }),
      topicId: "data-engineering-fundamentals",
      source: "deterministic" as const,
      title: "Data Engineering Fundamentals",
      practicalArtifact: {
        type: "workflow" as const,
        title: "Ingest to warehouse",
        content:
          "1. Extract from OLTP\n2. ETL transform\n3. Load warehouse\n4. Airflow orchestration\n5. Data quality check",
        explanation: "Batch ETL into a warehouse with Airflow and quality gates.",
      },
      sections: buildMentorLessonFixture("Data Engineering Fundamentals").sections.map(
        (section, index) =>
          index === 2
            ? {
                ...section,
                content:
                  "Data Engineering builds pipelines. ETL vs ELT, batch vs streaming, data lakes, warehouses, Spark, Airflow orchestration, and data quality checks are core.",
                practicalExample: "Sketch an ETL pipeline into a warehouse with an Airflow DAG.",
                summary: ["ETL vs ELT", "Batch vs streaming", "Lakes and warehouses"],
              }
            : {
                ...section,
                content: `${section.content} Pipelines move data through lakes and warehouses with quality checks.`,
              },
      ),
    };

    expect(isIncompatibleCachedLesson(fresh, fresh.topicId)).toBe(false);
    writeCachedLesson("learn-data-engineering", fresh, "deterministic");
    const cached = readCachedLesson("learn-data-engineering", fresh.topicId);
    expect(cached?.source).toBe("cache");
  });

  it("ignores legacy v3 cache keys", () => {
    const staleKey =
      "mentormind-lesson-cache:v3:learn-data-engineering:data-engineering-fundamentals";
    window.sessionStorage.setItem(
      staleKey,
      JSON.stringify({
        topicId: "data-engineering-fundamentals",
        source: "deterministic",
        title: "Data Engineering Fundamentals",
        learningObjectives: [
          "Apply Data Engineering Fundamentals in a concrete worked example",
        ],
        sections: [],
      }),
    );

    const cached = readCachedLesson(
      "learn-data-engineering",
      "data-engineering-fundamentals",
    );
    expect(cached).toBeNull();
    expect(window.sessionStorage.getItem(staleKey)).toBeNull();
  });
});
