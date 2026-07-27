import { describe, expect, it } from "vitest";

import {
  mapFocusAreasToTopicIds,
  mapParsedIntentToOnboardingInput,
  resolveGoalIdFromParsedIntent,
} from "@/lib/onboarding/map-parsed-intent";
import { parseGoalIntentDeterministic } from "@/lib/onboarding/parse-intent-deterministic";
import { onboardingInputSchema } from "@/lib/onboarding/schema";

describe("mapParsedIntentToOnboardingInput (deprecated legacy helper)", () => {
  it("maps AWS parsed intent to aws-saa-c03 onboarding input", () => {
    const parsed = parseGoalIntentDeterministic(
      "Prepare for AWS Solutions Architect Associate SAA-C03",
    )!;
    const onboardingInput = mapParsedIntentToOnboardingInput(parsed);

    expect(onboardingInput.goalId).toBe("aws-saa-c03");
    expect(onboardingInputSchema.safeParse(onboardingInput).success).toBe(true);
  });

  it("maps Azure goals to azure-fundamentals", () => {
    const parsed = parseGoalIntentDeterministic("Prepare for Azure AZ-900")!;
    expect(resolveGoalIdFromParsedIntent(parsed)).toBe("azure-fundamentals");
  });

  it("maps data analyst goals to a generated slug", () => {
    const parsed = parseGoalIntentDeterministic("Become a data analyst")!;
    expect(resolveGoalIdFromParsedIntent(parsed)).toBe("become-a-data-analyst");
  });

  it("maps AWS focus areas to AWS topic ids only for AWS goals", () => {
    expect(mapFocusAreasToTopicIds(["VPC Networking", "EC2"], "aws-saa-c03")).toEqual(
      expect.arrayContaining(["vpc-networking", "ec2-compute"]),
    );
  });

  it("does not map generic networking to AWS topic ids for Python goals", () => {
    const topicIds = mapFocusAreasToTopicIds(["Python Basics", "Control Flow"], "learn-python");
    expect(topicIds.join(" ")).not.toMatch(/vpc-networking|ec2-compute|s3-storage/);
  });
});
