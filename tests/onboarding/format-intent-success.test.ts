import { describe, expect, it } from "vitest";



import { formatIntentSuccessSummary } from "@/lib/onboarding/format-intent-success";



describe("formatIntentSuccessSummary", () => {

  it("formats goal-only fields for the success card", () => {

    const summary = formatIntentSuccessSummary({

      goal: "Learn Python",

      domain: "Programming",

      goalCategory: "Programming",

      goalType: "Skill",

      currentSkillLevel: "beginner",

      targetOutcome: "Become proficient in Learn Python",

      durationWeeks: 8,

      studyHoursPerWeek: 6,

      recommendedFocusAreas: ["Python Basics"],

    });



    expect(summary).toEqual({

      goalTypeLabel: "Learning goal",

      goalTitle: "Learn Python",

      category: "Programming",

      goalType: "Skill",

      targetOutcome: "Become proficient in Learn Python",

    });

  });



  it("uses certification label for certification goals", () => {

    const summary = formatIntentSuccessSummary({

      goal: "Azure Fundamentals AZ-900",

      domain: "Cloud",

      goalCategory: "Cloud",

      goalType: "Certification",

      currentSkillLevel: "beginner",

      targetOutcome: "Prepare for Azure Fundamentals AZ-900",

      durationWeeks: 8,

      studyHoursPerWeek: 7,

      recommendedFocusAreas: ["Cloud Concepts"],

    });



    expect(summary.goalTypeLabel).toBe("Certification");

  });

});

