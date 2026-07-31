import { NextResponse } from "next/server";

import { createDeterministicLessonForLearner } from "@/lib/ai/lesson-fallback";
import { generateLessonForLearner } from "@/lib/ai/lesson-service";
import {
  getServerLessonFallbackPath,
  resetServerLessonFallbackPath,
} from "@/lib/dev/lesson-source-observability";
import { generateLessonRequestSchema } from "@/lib/learn/generate-lesson-request-schema";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = generateLessonRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const input = parsed.data;

  try {
    const result = await generateLessonForLearner(input);

    return NextResponse.json({
      source: result.source,
      lesson: result.lesson,
      fallbackReason: result.fallbackReason,
      generationPath: result.generationPath,
    });
  } catch {
    resetServerLessonFallbackPath();
    const fallback = createDeterministicLessonForLearner(
      {
        goalId: input.goalId,
        goalSlug: input.goalSlug,
        goalTitle: input.goalTitle,
        goalCategory: input.goalCategory,
        topicId: input.topicId,
        topicTitle: input.topicTitle,
        skillLevel: input.skillLevel,
        learningObjectives: input.learningObjectives,
        durationMinutes: input.durationMinutes,
      },
      "request-error",
    );
    const generationPath = getServerLessonFallbackPath();

    return NextResponse.json({
      source: fallback.source,
      lesson: fallback.lesson,
      fallbackReason: fallback.fallbackReason,
      generationPath,
    });
  }
}
