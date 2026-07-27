import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";



import { logGeminiIntentParsed } from "@/lib/dev/architecture-log";

import { logParseIntentDevVerification } from "@/lib/onboarding/parse-intent-dev-log";

import { buildClientFallbackParseIntent } from "@/lib/onboarding/fetch-parsed-intent";



const AWS_PROMPT =

  "I want to pass the AWS Solutions Architect Associate exam in 8 weeks. I know basic cloud concepts and can study one hour every evening.";



describe("parse-intent dev verification log", () => {

  beforeEach(() => {

    vi.stubEnv("NODE_ENV", "development");

  });



  afterEach(() => {

    vi.unstubAllEnvs();

    vi.restoreAllMocks();

  });



  it("logs source metadata in development without secrets", () => {

    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});

    const result = buildClientFallbackParseIntent(AWS_PROMPT);



    logParseIntentDevVerification(AWS_PROMPT, result);



    expect(infoSpy).toHaveBeenCalledWith(

      "[Gemini] Intent parsed",

      expect.objectContaining({

        source: "deterministic",

        goalId: "aws-saa-c03",

      }),

    );



    const logged = JSON.stringify(infoSpy.mock.calls[0]);

    expect(logged).not.toContain("GEMINI_API_KEY");

    expect(logged).not.toMatch(/AIza[a-zA-Z0-9_-]{10,}/);

  });



  it("does not log in production", () => {

    vi.stubEnv("NODE_ENV", "production");

    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});



    logGeminiIntentParsed({ source: "ai" });



    expect(infoSpy).not.toHaveBeenCalled();

  });

});


