// @vitest-environment jsdom



import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";



import { GoalIntentStep } from "@/components/onboarding/goal-intent-step";

import { OnboardingView } from "@/components/onboarding/onboarding-view";

import * as fetchParsedIntentModule from "@/lib/onboarding/fetch-parsed-intent";

import {

  GOAL_INTENT_CONTINUE_LABEL,

  GOAL_INTENT_GENERATE_LABEL,

  GOAL_INTENT_MANUAL_LABEL,

  GOAL_INTENT_SUCCESS_READY_LINE,

  GOAL_INTENT_SUCCESS_TITLE,

  GOAL_INTENT_TITLE,

} from "@/lib/onboarding/goal-intent-constants";

import { createDraftFromParsedIntent } from "@/lib/onboarding/onboarding-draft";

import { parseGoalIntentDeterministic } from "@/lib/onboarding/parse-intent-deterministic";



const PYTHON_GOAL = "I want to learn Python";



const PARSED_PYTHON = parseGoalIntentDeterministic(PYTHON_GOAL)!;



const PARSED_RESPONSE = {

  source: "deterministic" as const,

  parsed: PARSED_PYTHON,

};



const mockSavePendingOnboarding = vi.hoisted(() => vi.fn());

const mockPush = vi.hoisted(() => vi.fn());



vi.mock("next/navigation", () => ({

  useRouter: () => ({

    push: mockPush,

  }),

}));



vi.mock("@/lib/onboarding/fetch-generated-roadmap", () => ({

  savePendingOnboarding: mockSavePendingOnboarding,

}));



describe("GoalIntentStep", () => {

  beforeEach(() => {

    vi.spyOn(fetchParsedIntentModule, "fetchParsedIntentWithMinimumDelay").mockResolvedValue(

      PARSED_RESPONSE,

    );

  });



  afterEach(() => {

    cleanup();

    vi.restoreAllMocks();

  });



  it("shows goal-only success content without finalized skill or timeline", async () => {

    render(<GoalIntentStep onComplete={vi.fn()} onManualSetup={vi.fn()} />);



    fireEvent.change(screen.getByLabelText(GOAL_INTENT_TITLE), {

      target: { value: PYTHON_GOAL },

    });

    fireEvent.click(screen.getByRole("button", { name: GOAL_INTENT_GENERATE_LABEL }));



    await waitFor(() => {

      expect(screen.getByText(GOAL_INTENT_SUCCESS_TITLE)).toBeTruthy();

    });



    expect(screen.getByText("Learning goal")).toBeTruthy();

    expect(screen.getByText("Learn Python")).toBeTruthy();

    expect(screen.getByText("Programming")).toBeTruthy();

    expect(screen.getByText(GOAL_INTENT_SUCCESS_READY_LINE)).toBeTruthy();

    expect(screen.queryByText("12 weeks")).toBeNull();

    expect(screen.queryByText("7 hours per week")).toBeNull();

    expect(screen.queryByText("Beginner")).toBeNull();

  });



  it("passes a draft without finalized skill level to the next step", async () => {

    const onComplete = vi.fn();



    render(<GoalIntentStep onComplete={onComplete} onManualSetup={vi.fn()} />);



    fireEvent.change(screen.getByLabelText(GOAL_INTENT_TITLE), {

      target: { value: PYTHON_GOAL },

    });

    fireEvent.click(screen.getByRole("button", { name: GOAL_INTENT_GENERATE_LABEL }));



    await waitFor(() => {

      expect(screen.getByText(GOAL_INTENT_SUCCESS_TITLE)).toBeTruthy();

    });



    fireEvent.click(screen.getByRole("button", { name: GOAL_INTENT_CONTINUE_LABEL }));



    expect(onComplete).toHaveBeenCalledWith(

      expect.objectContaining({

        goalTitle: expect.stringMatching(/python/i),

        goalType: "Skill",

        skillLevel: null,

        skillLevelConfirmed: false,

      }),

      expect.objectContaining({

        recommendedFocusAreas: expect.any(Array),

      }),

    );

  });



  it("uses manual setup without calling the parse API", () => {

    const onManualSetup = vi.fn();



    render(<GoalIntentStep onComplete={vi.fn()} onManualSetup={onManualSetup} />);



    fireEvent.click(screen.getByRole("button", { name: GOAL_INTENT_MANUAL_LABEL }));



    expect(onManualSetup).toHaveBeenCalledTimes(1);

    expect(fetchParsedIntentModule.fetchParsedIntentWithMinimumDelay).not.toHaveBeenCalled();

  });

});



describe("OnboardingView integration", () => {

  beforeEach(() => {

    mockSavePendingOnboarding.mockReset();

    mockPush.mockReset();

    vi.spyOn(fetchParsedIntentModule, "fetchParsedIntentWithMinimumDelay").mockResolvedValue(

      PARSED_RESPONSE,

    );

  });



  afterEach(() => {

    cleanup();

    vi.restoreAllMocks();

  });



  it("requires skill level confirmation before leaving step 2", async () => {

    render(<OnboardingView />);



    fireEvent.change(screen.getByLabelText(GOAL_INTENT_TITLE), {

      target: { value: PYTHON_GOAL },

    });

    fireEvent.click(screen.getByRole("button", { name: GOAL_INTENT_GENERATE_LABEL }));



    await waitFor(() => {

      expect(screen.getByText(GOAL_INTENT_SUCCESS_TITLE)).toBeTruthy();

    });



    fireEvent.click(screen.getByRole("button", { name: GOAL_INTENT_CONTINUE_LABEL }));



    await waitFor(() => {

      expect(screen.getByText("Current skill level")).toBeTruthy();

    });



    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    expect(screen.getByText("Select your current skill level before continuing.")).toBeTruthy();



    fireEvent.click(screen.getByRole("button", { name: /complete beginner/i }));

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));



    await waitFor(() => {

      expect(screen.getByText("Timeline and availability")).toBeTruthy();

    });

  });



  it("calls roadmap generation only from the summary step", async () => {

    render(<OnboardingView />);



    const draft = createDraftFromParsedIntent(PARSED_PYTHON, PYTHON_GOAL);

    draft.skillLevel = { value: "beginner", source: "manual" };

    draft.skillLevelConfirmed = true;



    fireEvent.change(screen.getByLabelText(GOAL_INTENT_TITLE), {

      target: { value: PYTHON_GOAL },

    });

    fireEvent.click(screen.getByRole("button", { name: GOAL_INTENT_GENERATE_LABEL }));



    await waitFor(() => {

      expect(screen.getByText(GOAL_INTENT_SUCCESS_TITLE)).toBeTruthy();

    });



    fireEvent.click(screen.getByRole("button", { name: GOAL_INTENT_CONTINUE_LABEL }));

    await waitFor(() => {
      expect(screen.getByText("Current skill level")).toBeTruthy();
    });

    fireEvent.click(screen.getByRole("button", { name: /complete beginner/i }));

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    await waitFor(() => {
      expect(screen.getByText("Timeline and availability")).toBeTruthy();
    });

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    await waitFor(() => {
      expect(screen.getByText(/learning preferences/i)).toBeTruthy();
    });

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));



    await waitFor(() => {

      expect(screen.getByText("Review your learning plan inputs")).toBeTruthy();

    });



    expect(mockSavePendingOnboarding).not.toHaveBeenCalled();



    fireEvent.click(screen.getByRole("button", { name: "Generate my personalized plan" }));



    await waitFor(() => {

      expect(mockSavePendingOnboarding).toHaveBeenCalledTimes(1);

    });

    expect(mockPush).toHaveBeenCalledWith("/onboarding/loading");

  });

});


