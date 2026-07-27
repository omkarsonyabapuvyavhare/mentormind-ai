import { describe, expect, it } from "vitest";

import {
  clampDurationWeeks,
  clampParsedGoalIntent,
  clampStudyHoursPerWeek,
  parsedGoalIntentSchema,
} from "@/lib/onboarding/parse-intent-schema";
import {
  buildDefaultParsedIntent,
  parseGoalIntentDeterministic,
} from "@/lib/onboarding/parse-intent-deterministic";
import {
  mapFocusAreasToTopicIds,
  mapParsedIntentToOnboardingInput,
  resolveGoalIdFromParsedIntent,
} from "@/lib/onboarding/map-parsed-intent";
import { onboardingInputSchema } from "@/lib/onboarding/schema";

const AWS_EXAMPLE =
  "I want to pass the AWS Solutions Architect exam in 8 weeks. I know basic cloud concepts and can study 1 hour per day.";

describe("parseGoalIntentDeterministic", () => {
  it("parses the AWS SAA natural-language example", () => {
    const parsed = parseGoalIntentDeterministic(AWS_EXAMPLE);

    expect(parsed).not.toBeNull();
    expect(parsed?.goal).toContain("AWS Solutions Architect");
    expect(parsed?.currentSkillLevel).toBe("beginner");
    expect(parsed?.durationWeeks).toBe(8);
    expect(parsed?.studyHoursPerWeek).toBe(7);
    expect(parsed?.recommendedFocusAreas).toEqual([
      "Cloud Foundations",
      "IAM and Security",
      "EC2 and Compute",
      "VPC Networking",
    ]);
  });

  it("returns null for empty input", () => {
    expect(parseGoalIntentDeterministic("")).toBeNull();
    expect(parseGoalIntentDeterministic("   ")).toBeNull();
  });

  it("maps unknown certifications to a free-form skill goal", () => {
    const parsed = parseGoalIntentDeterministic(
      "I want to learn product management in 10 weeks with 5 hours per week.",
    );

    expect(parsed?.goal.toLowerCase()).toContain("product management");
    expect(parsed?.durationWeeks).toBe(10);
    expect(parsed?.studyHoursPerWeek).toBe(5);
  });
});

describe("clamp helpers", () => {
  it("clamps duration weeks to 4–16", () => {
    expect(clampDurationWeeks(2)).toBe(4);
    expect(clampDurationWeeks(20)).toBe(16);
    expect(clampDurationWeeks(8)).toBe(8);
  });

  it("clamps study hours to 1–40 per week", () => {
    expect(clampStudyHoursPerWeek(0)).toBe(1);
    expect(clampStudyHoursPerWeek(100)).toBe(40);
    expect(clampStudyHoursPerWeek(7)).toBe(7);
  });

  it("clamps parsed goal intent fields", () => {
    const clamped = clampParsedGoalIntent({
      goal: "Test",
      domain: "Cloud",
      goalCategory: "Cloud",
      goalType: "Skill",
      currentSkillLevel: "beginner",
      targetOutcome: "Outcome",
      durationWeeks: 2,
      studyHoursPerWeek: 100,
      recommendedFocusAreas: ["VPC Networking"],
    });

    expect(clamped.durationWeeks).toBe(4);
    expect(clamped.studyHoursPerWeek).toBe(40);
    expect(parsedGoalIntentSchema.safeParse(clamped).success).toBe(true);
  });
});

describe("mapParsedIntentToOnboardingInput", () => {
  it("maps AWS intent into existing OnboardingInput", () => {
    const parsed = parseGoalIntentDeterministic(AWS_EXAMPLE)!;
    const onboardingInput = mapParsedIntentToOnboardingInput(parsed);
    const validated = onboardingInputSchema.safeParse(onboardingInput);

    expect(validated.success).toBe(true);
    expect(onboardingInput.goalId).toBe("aws-saa-c03");
    expect(onboardingInput.skillLevel).toBe("beginner");
    expect(onboardingInput.durationWeeks).toBe(8);
    expect(onboardingInput.studyHoursPerWeek).toBe(7);
    expect(onboardingInput.knownChallengeTopicIds).toContain("vpc-networking");
  });

  it("maps data analyst goals to a generated slug", () => {
    const parsed = buildDefaultParsedIntent();
    const customParsed = {
      ...parsed,
      goal: "Become a data analyst",
      targetOutcome: "Get a new role",
      goalCategory: "Data" as const,
      goalType: "Skill" as const,
    };

    expect(resolveGoalIdFromParsedIntent(customParsed)).toBe("become-a-data-analyst");
  });

  it("maps focus areas to known challenge topic ids for AWS goals only", () => {
    expect(
      mapFocusAreasToTopicIds(["VPC Networking", "EC2", "S3", "IAM"], "aws-saa-c03"),
    ).toEqual(
      expect.arrayContaining(["vpc-networking", "ec2-compute", "s3-storage", "iam-security"]),
    );
  });

  it("buildDefaultParsedIntent returns neutral universal defaults", () => {
    const parsed = buildDefaultParsedIntent();
    expect(parsed.goal).toBe("Personal learning goal");
    expect(parsed.goalCategory).toBe("General Technology");
    expect(parsed.goalType).toBe("Skill");
  });
});
