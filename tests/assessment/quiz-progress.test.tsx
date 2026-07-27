// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { QuizProgress } from "@/components/assessment/quiz-progress";

describe("QuizProgress", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders five-question progress from assessment length", () => {
    render(<QuizProgress currentIndex={0} totalQuestions={5} />);
    expect(screen.getByText("1 of 5")).toBeTruthy();
  });
});
