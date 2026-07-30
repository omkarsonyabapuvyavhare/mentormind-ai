import "server-only";

import { GoogleGenAI } from "@google/genai";

import {
  aiLessonResponseSchema,
  validateAiLessonStructure,
  type AiLessonResponse,
} from "@/lib/ai/lesson-schema";
import { isGeminiConfigured } from "@/lib/onboarding/parse-intent-ai";

import type { GoalCategory, GoalType } from "@/lib/goals/goal-identity";

export interface GenerateLessonInput {
  goalId: string;
  goalSlug: string;
  goalTitle: string;
  goalCategory: GoalCategory;
  goalType: GoalType;
  topicId: string;
  topicTitle: string;
  skillLevel: "beginner" | "intermediate" | "advanced";
  durationMinutes: number;
  learningObjectives?: string[];
  preferredFormats: string[];
}

const DEFAULT_MODEL = "gemini-3-flash-preview";
const DEFAULT_TIMEOUT_MS = 12_000;

function resolveTimeoutMs(): number {
  const raw =
    process.env.AI_LESSON_GENERATE_TIMEOUT_MS ??
    process.env.AI_ROADMAP_GENERATE_TIMEOUT_MS ??
    process.env.AI_INTENT_PARSE_TIMEOUT_MS;
  const parsed = raw ? Number(raw) : DEFAULT_TIMEOUT_MS;

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_TIMEOUT_MS;
  }

  return parsed;
}

function resolveModel(): string {
  return process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;
}

function buildSystemPrompt(): string {
  return `You are a world-class instructor teaching ONE technical topic in a real classroom.
Your job is to teach the SUBJECT MATTER of topicTitle ΓÇö not how to study, not the learner's roadmap, not learning strategies.

The user message is CONTEXT ONLY (goal, category, topic, objectives, skillLevel). Use it to choose depth, tone, and examples.
Do NOT repeat goalTitle, roadmap, milestones, or objectives as lesson prose unless a single brief mention is truly necessary.
Never write "Today you will work through...", "By the end of this session...", "Your learning goal...", "Session focus:", or similar meta framing.

Return JSON only with this exact shape:
{
  "title": string,
  "estimatedMinutes": number,
  "learningObjectives": string[],
  "practicalArtifact": {
    "type": "code" | "command" | "configuration" | "query" | "diagram" | "calculation" | "workflow" | "case-study",
    "title": string,
    "language": string (optional),
    "content": string,
    "expectedOutput": string (required when the artifact produces observable output),
    "explanation": string
  },
  "handsOnExercise": {
    "instructions": string[],
    "starterContent": string (optional),
    "hints": string[],
    "expectedOutcome": string,
    "solution": string (optional),
    "solutionExplanation": string
  },
  "sections": [
    {
      "heading": string,
      "content": string,
      "practicalExample": string,
      "handsOnPractice": { ... } | omit except on "Hands-on Practice",
      "commonMistakes": string[],
      "summary": string[],
      "knowledgeCheck": [...]
    }
  ]
}

Teaching standard ΓÇö every lesson must teach through concrete artifacts, not prose alone:
1. practicalArtifact: at least one domain-appropriate worked artifact inferred from context
2. handsOnExercise: one actionable learner task using the same concept (bug fix, extension, query, config change, etc.)
3. Simple + technical explanation woven through sections
4. Real-world analogy where it helps (brief, accurate)
5. Line-by-line or step-by-step explanation of the artifact
6. Expected output or behavior when the artifact produces observable results
7. Beginner mistakes specific to this topic
8. Professional tips for this topic (not generic study advice)
9. Section-level hands-on practice block (Hands-on Practice section)

Infer artifact type from goal, category, topicTitle, topicId, and learningObjectives:
- Programming language ΓåÆ runnable code + expected output
- SQL/database ΓåÆ schema or sample tables + query + expected result
- Web framework ΓåÆ component/configuration/code example
- Docker ΓåÆ Dockerfile + build/run commands
- Kubernetes ΓåÆ YAML manifest + kubectl command + expected behavior
- Cloud/infrastructure ΓåÆ configuration, CLI command, architecture flow, or policy example
- Data/analytics ΓåÆ sample data, formula, query, transformation, or chart interpretation task
- Cybersecurity ΓåÆ safe configuration, log-analysis example, threat model, or defensive workflow
- Non-code topic ΓåÆ worked calculation, decision scenario, structured diagram, procedure, or case analysis

practicalArtifact rules:
- content must be concrete and runnable/readable (code, SQL, YAML, commands, structured workflow)
- explanation must walk through important lines or steps
- expectedOutput required for code, command, query, and calculation artifacts
- never use placeholder artifact text

handsOnExercise rules:
- instructions must require a concrete action (fix, write, run, configure, query, trace, calculate)
- starterContent optional but recommended for code/config/query exercises
- hints: 1ΓÇô4 technical hints
- solution + solutionExplanation required (solution may be hidden in UI)
- never assign summaries, "explain to a colleague", or generic study tasks

Difficulty by skillLevel:
- beginner: guided steps, small complete example, explicit checkpoints, line-by-line artifact explanation
- intermediate: partially completed artifact, debugging or extension task
- advanced: realistic scenario with trade-offs and open-ended implementation

Produce exactly 8 sections (headings verbatim):
1. "Lesson Overview" ΓÇö concise TECHNICAL introduction: what the topic is, core terms, why practitioners use it (no study-advice framing)
2. "Real-World Context" ΓÇö where this technique appears in professional work; concrete scenario in the inferred domain
3. "Core Explanation" ΓÇö main teaching: progressive, step-by-step, definitions + behavior + reasoning; include code/commands/config when appropriate
4. "Hands-on Practice" ΓÇö active exercise with handsOnPractice object (see below)
5. "Practical Example" ΓÇö worked walkthrough showing expert reasoning on a realistic case
6. "Common Misconceptions" ΓÇö 3ΓÇô5 topic-specific mistakes and WHY they happen
7. "Mentor Tips" ΓÇö professional shortcuts, mental models, debugging/troubleshooting for THIS topic only
8. "Key Takeaways" ΓÇö 3ΓÇô5 technical points the learner should remember

Hands-on Practice (section 4 ONLY) ΓÇö handsOnPractice:
- exercise: realistic task for the inferred domain and skillLevel
- instructions: clear steps the learner performs now
- thinkAbout: technical questions before solving (constraints, inputs, expected behavior)
- hints: 0ΓÇô4 optional hints
- expectedOutcome: what correct work looks like
- solutionExplanation: why the approach works (teach the mechanism)

Field usage:
- content: primary technical teaching for that section
- practicalExample: concrete code, commands, SQL, config, diagram text, or worked scenario
- commonMistakes: technical errors learners make on THIS topic
- summary: technical takeaways, not study advice

Rules:
- Teach ONLY topicTitle substance. The learner should finish understanding the topic itself.
- Total length: 1400ΓÇô2600 words. Exactly 5 knowledge checks on sections 1ΓÇô5 (empty array elsewhere).
- Knowledge checks test technical concepts taught ΓÇö never "how to study" questions.
- Do not insert cloud-platform content unless context implies that platform.

Banned:
Generic filler ("Imagine you are explaining...", "Trying to memorize...", "Anchor your study..."),
instructional meta ("your roadmap", "learning goal", "session focus", "topic check-in", "passive reading"),
and any paragraph that could apply unchanged to every subject.

Return JSON only.`;
}

function buildUserPrompt(input: GenerateLessonInput): string {
  return `CONTEXT (personalization only ΓÇö do not echo repeatedly in lesson prose):
${JSON.stringify(
    {
      goalTitle: input.goalTitle,
      goalCategory: input.goalCategory,
      goalType: input.goalType,
      topicId: input.topicId,
      topicTitle: input.topicTitle,
      skillLevel: input.skillLevel,
      durationMinutes: input.durationMinutes,
      learningObjectives: input.learningObjectives ?? [],
      preferredFormats: input.preferredFormats,
    },
    null,
    2,
  )}

TASK: Write a lesson that teaches "${input.topicTitle}" directly, as a senior instructor would in class.
Use skillLevel to set depth. Use learningObjectives to ensure coverage. Do not narrate the learner's journey.`;
}

export type GeminiLessonFailureReason =
  | "missing-api-key"
  | "empty-response"
  | "invalid-json"
  | "schema-validation"
  | "structure-validation"
  | "request-error";

export interface GeminiLessonSuccess {
  ok: true;
  data: AiLessonResponse;
}

export interface GeminiLessonFailure {
  ok: false;
  reason: GeminiLessonFailureReason;
  message: string;
}

function logGeminiLessonError(
  phase: GeminiLessonFailureReason,
  error: unknown,
  goalId: string,
  topicId: string,
): void {
  if (process.env.NODE_ENV !== "development") {
    return;
  }

  const base = {
    phase,
    model: resolveModel(),
    goalId,
    topicId,
    geminiConfigured: isGeminiConfigured(),
  };

  if (error instanceof Error) {
    console.warn("[generate-lesson:gemini:dev]", {
      ...base,
      errorName: error.name,
      errorMessage: error.message,
    });
    return;
  }

  console.warn("[generate-lesson:gemini:dev]", {
    ...base,
    errorName: "UnknownError",
    errorMessage: String(error),
  });
}

export async function generateLessonWithGemini(
  input: GenerateLessonInput,
): Promise<GeminiLessonSuccess | GeminiLessonFailure> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    return {
      ok: false,
      reason: "missing-api-key",
      message: "Gemini API key is not configured.",
    };
  }

  const client = new GoogleGenAI({ apiKey });
  const timeoutMs = resolveTimeoutMs();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await client.models.generateContent({
      model: resolveModel(),
      contents: buildUserPrompt(input),
      config: {
        systemInstruction: buildSystemPrompt(),
        responseMimeType: "application/json",
        abortSignal: controller.signal,
      },
    });

    const content = response.text;

    if (!content) {
      const message = "Gemini returned empty lesson content.";
      logGeminiLessonError("empty-response", new Error(message), input.goalId, input.topicId);
      return { ok: false, reason: "empty-response", message };
    }

    let raw: unknown;

    try {
      raw = JSON.parse(content);
    } catch (error) {
      logGeminiLessonError("invalid-json", error, input.goalId, input.topicId);
      return {
        ok: false,
        reason: "invalid-json",
        message: error instanceof Error ? error.message : "Invalid JSON from Gemini.",
      };
    }

    const validated = aiLessonResponseSchema.safeParse(raw);

    if (!validated.success) {
      const message = validated.error.issues[0]?.message ?? "Gemini lesson failed Zod validation.";
      logGeminiLessonError("schema-validation", new Error(message), input.goalId, input.topicId);
      return { ok: false, reason: "schema-validation", message };
    }

    const structureError = validateAiLessonStructure(validated.data, {
      goalSlug: input.goalSlug,
      goalCategory: input.goalCategory,
      topicId: input.topicId,
      topicTitle: input.topicTitle,
      learningObjectives: input.learningObjectives,
    });

    if (structureError) {
      logGeminiLessonError(
        "structure-validation",
        new Error(structureError),
        input.goalId,
        input.topicId,
      );
      return { ok: false, reason: "structure-validation", message: structureError };
    }

    return { ok: true, data: validated.data };
  } catch (error) {
    logGeminiLessonError("request-error", error, input.goalId, input.topicId);
    return {
      ok: false,
      reason: "request-error",
      message: error instanceof Error ? error.message : "Gemini lesson request failed.",
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

export function getLessonGeminiModel(): string {
  return resolveModel();
}
