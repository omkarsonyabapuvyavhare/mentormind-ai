import { NextResponse } from "next/server";

import { createDeterministicRoadmapFromOnboarding } from "@/lib/ai/roadmap-deterministic";
import { generateRoadmapForOnboarding } from "@/lib/ai/roadmap-service";
import { generateRoadmapRequestSchema } from "@/lib/onboarding/generate-roadmap-schema";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = generateRoadmapRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { input, twinId, startTimestamp, context } = parsed.data;

  try {
    const result = await generateRoadmapForOnboarding(input, twinId, startTimestamp, context);

    return NextResponse.json({
      source: result.source,
      roadmap: result.roadmap,
      fallbackReason: result.fallbackReason,
    });
  } catch {
    const fallback = createDeterministicRoadmapFromOnboarding(
      input,
      twinId,
      startTimestamp,
      context,
      "request-error",
    );

    return NextResponse.json({
      source: fallback.source,
      roadmap: fallback.roadmap,
      fallbackReason: fallback.fallbackReason,
    });
  }
}
