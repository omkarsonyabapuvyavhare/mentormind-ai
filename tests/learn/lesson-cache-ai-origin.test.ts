// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  peekCachedLessonOriginalSource,
  readCachedLesson,
  writeCachedLesson,
} from "@/lib/learn/lesson-session-cache";
import { buildMentorLessonFixture } from "../helpers/mentor-lesson-fixture";

describe("lesson cache original Gemini source", () => {
  const previousNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    process.env.NODE_ENV = "development";
    window.sessionStorage.clear();
  });

  afterEach(() => {
    window.sessionStorage.clear();
    process.env.NODE_ENV = previousNodeEnv;
  });

  it("stores cache source with original ai", () => {
    const lesson = {
      ...buildMentorLessonFixture("Python Syntax"),
      topicId: "python-syntax-and-basic-data-types",
      source: "ai" as const,
    };

    writeCachedLesson("browser-python", lesson, "ai");
    const cached = readCachedLesson("browser-python", lesson.topicId);
    expect(cached?.source).toBe("cache");
    expect(peekCachedLessonOriginalSource("browser-python", lesson.topicId)).toBe("ai");
  });
});
