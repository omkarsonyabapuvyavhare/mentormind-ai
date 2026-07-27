import { NextResponse } from "next/server";

import { logParseIntentDevVerification } from "@/lib/onboarding/parse-intent-dev-log";
import { parseLearnerIntent } from "@/lib/onboarding/parse-intent-service";
import { parseIntentRequestSchema } from "@/lib/onboarding/parse-intent-schema";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsedBody = parseIntentRequestSchema.safeParse(body);
    const text = parsedBody.success ? parsedBody.data.text : "";
    const result = await parseLearnerIntent(text);

    logParseIntentDevVerification(text, result);

    return NextResponse.json(result);
  } catch {
    const result = await parseLearnerIntent("");
    logParseIntentDevVerification("", result);
    return NextResponse.json(result);
  }
}
