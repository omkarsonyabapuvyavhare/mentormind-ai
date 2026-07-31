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
/** Default lesson timeout — Gemini lessons commonly take 30–45s. */
const DEFAULT_TIMEOUT_MS = 60_000;

function resolveTimeoutMs(): number {
  // Lesson timeout is independent of intent parsing (do not fall back to AI_INTENT_PARSE_TIMEOUT_MS).
  const raw = process.env.AI_LESSON_GENERATE_TIMEOUT_MS;
  const parsed = raw ? Number(raw) : DEFAULT_TIMEOUT_MS;

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_TIMEOUT_MS;
  }

  return parsed;
}

function resolveModel(): string {
  return process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;
}

export function buildSystemPrompt(): string {
  return `You are a world-class instructor teaching ONE technical topic in a real classroom.
Your job is to teach the SUBJECT MATTER of topicTitle — like a university lecture or Coursera module — not how to study, not the learner's roadmap, and not the wording of learning objectives.

Content hierarchy (strict):
1. topicTitle — PRIMARY source of what to teach
2. goalCategory / domain — choose examples, tools, and architecture language
3. skillLevel — set depth and scaffolding
4. learningObjectives — coverage checklist ONLY (silent). Confirm ideas are covered; NEVER quote, paraphrase repeatedly, or turn them into headings or section openers.

Do NOT repeat goalTitle, roadmap, milestones, or learningObjectives as lesson prose.
Never write "Apply <topic>...", "Explain core mechanics...", "Foundations workflow...", "Today you will work through...", "By the end of this session...", "Your learning goal...", "Session focus:", or similar meta framing.
If an objective says "Apply Data Engineering Fundamentals in a concrete worked example", teach ETL, ELT, pipelines, lakes, warehouses, Spark, Airflow — do not echo that objective sentence.

Return JSON only with this exact shape (field names and types are mandatory):
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
      "handsOnPractice": {
        "exercise": string,
        "instructions": string,
        "thinkAbout": string,
        "hints": string[] (optional, 0-4),
        "expectedOutcome": string,
        "solutionExplanation": string
      } | omit except on "Hands-on Practice",
      "commonMistakes": string[],
      "summary": string[],
      "knowledgeCheck": [
        {
          "question": string,
          "options": [string, string, string, string],
          "correctIndex": 0 | 1 | 2 | 3,
          "explanation": string,
          "conceptTag": string (optional)
        }
      ]
    }
  ]
}

CRITICAL schema rules (violations cause rejection):
- knowledgeCheck items MUST use correctIndex (number 0-3) and explanation (string). NEVER use an "answer" field.
- options MUST be exactly 4 strings.
- Every section MUST include content and practicalExample as non-empty strings (including "Hands-on Practice").
- Every section MUST include commonMistakes with 3 to 5 strings and summary with 3 to 5 strings.
- handsOnExercise.instructions MUST be a string array (1-8 steps). NEVER a single string.
- handsOnExercise.hints MUST be a string array (1-4 hints).
- handsOnPractice.instructions MUST be a single string (use newlines between steps). NEVER an array.
- handsOnPractice.thinkAbout MUST be a single string (use newlines between questions). NEVER an array.
- handsOnPractice appears ONLY on the section whose heading is exactly "Hands-on Practice".
- Exactly 5 knowledge checks total: one each on sections 1-5; sections 6-8 use "knowledgeCheck": [].

Teaching standard — every lesson must teach through concrete artifacts, not prose alone:
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
- Programming language → runnable code + expected output
- SQL/database → schema or sample tables + query + expected result
- Web framework → component/configuration/code example
- Docker → Dockerfile + build/run commands
- Kubernetes → YAML manifest + kubectl command + expected behavior
- Cloud/infrastructure → configuration, CLI command, architecture flow, or policy example
- Data/analytics → sample data, formula, query, transformation, or chart interpretation task
- Cybersecurity → safe configuration, log-analysis example, threat model, or defensive workflow
- Non-code topic → worked calculation, decision scenario, structured diagram, procedure, or case analysis

practicalArtifact rules:
- content must be concrete and runnable/readable (code, SQL, YAML, commands, structured workflow)
- explanation must walk through important lines or steps
- expectedOutput required for code, command, query, and calculation artifacts
- never use placeholder artifact text

handsOnExercise rules:
- instructions MUST be a JSON array of 1-8 strings (not one string)
- each instruction must use a concrete action verb (create, write, run, fix, query, select, configure, print, assign, calculate, etc.)
- starterContent optional but recommended for code/config/query exercises
- hints: JSON array of 1-4 technical hints
- solution + solutionExplanation required (solution may be hidden in UI)
- never assign summaries, "explain to a colleague", or generic study tasks

Difficulty by skillLevel:
- beginner: guided steps, small complete example, explicit checkpoints, line-by-line artifact explanation
- intermediate: partially completed artifact, debugging or extension task
- advanced: realistic scenario with trade-offs and open-ended implementation

Produce exactly 8 sections (headings verbatim):
1. "Lesson Overview" — concise TECHNICAL introduction: what the topic is, core terms, why practitioners use it (no study-advice framing)
2. "Real-World Context" — where this technique appears in professional work; concrete scenario in the inferred domain
3. "Core Explanation" — main teaching: progressive, step-by-step, definitions + behavior + reasoning; include code/commands/config when appropriate
4. "Hands-on Practice" — active exercise with handsOnPractice object (see below)
5. "Practical Example" — worked walkthrough showing expert reasoning on a realistic case
6. "Common Misconceptions" — 3-5 topic-specific mistakes and WHY they happen
7. "Mentor Tips" — professional shortcuts, mental models, debugging/troubleshooting for THIS topic only
8. "Key Takeaways" — 3-5 technical points the learner should remember

Hands-on Practice (section 4 ONLY) — handsOnPractice:
- exercise: realistic task for the inferred domain and skillLevel (string)
- instructions: ONE string with clear numbered steps the learner performs now (not an array)
- thinkAbout: ONE string with technical questions before solving (not an array)
- hints: 0-4 optional hint strings
- expectedOutcome: what correct work looks like
- solutionExplanation: why the approach works (teach the mechanism)
- Also include section-level practicalExample, commonMistakes (3-5), and summary (3-5) like every other section

Field usage:
- content: primary technical teaching for that section
- practicalExample: concrete code, commands, SQL, config, diagram text, or worked scenario
- commonMistakes: technical errors learners make on THIS topic (always 3-5)
- summary: technical takeaways, not study advice (always 3-5)

Rules:
- Teach ONLY topicTitle substance. The learner should finish understanding the topic itself.
- Expand topicTitle into real domain concepts (definitions, comparisons, architecture, tools, workflows).
- learningObjectives are a silent coverage checklist — never lesson headings and never repeated sentences in content/summary/mistakes.
- The top-level JSON "learningObjectives" field may list short technical outcomes; body prose must still teach concepts, not echo those strings.
- Total length: 1400-2600 words. Exactly 5 knowledge checks on sections 1-5 (empty array elsewhere).
- Knowledge checks test technical concepts taught — never "how to study" questions.
- Do not insert cloud-platform content unless context implies that platform.

Banned:
Generic filler ("Imagine you are explaining...", "Trying to memorize...", "Anchor your study..."),
instructional meta ("your roadmap", "learning goal", "session focus", "topic check-in", "passive reading"),
objective-echo paragraphs ("Apply <Topic> in a concrete worked example", "Explain key ideas in <Topic>"),
and any paragraph that could apply unchanged to every subject.

Return JSON only.`;
}

export function buildUserPrompt(input: GenerateLessonInput): string {
  return `CONTEXT:
${JSON.stringify(
    {
      topicTitle: input.topicTitle,
      topicId: input.topicId,
      goalCategory: input.goalCategory,
      skillLevel: input.skillLevel,
      goalTitle: input.goalTitle,
      goalType: input.goalType,
      durationMinutes: input.durationMinutes,
      coverageChecklistOnly_doNotEcho: input.learningObjectives ?? [],
      preferredFormats: input.preferredFormats,
    },
    null,
    2,
  )}

TASK: Teach "${input.topicTitle}" as the primary subject — a real lecture on the topic's concepts, architecture, tools, and workflows.
skillLevel sets depth. coverageChecklistOnly_doNotEcho is a silent checklist: cover the ideas, but never copy those phrases into headings or body sentences.
Do not narrate the learner's journey. Do not turn objectives into the lesson.
Remember: knowledgeCheck uses correctIndex + explanation (never "answer"); handsOnPractice.instructions and thinkAbout are strings; every section has practicalExample and 3-5 commonMistakes.`;
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
  extras?: Record<string, unknown>,
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
    ...extras,
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

function asTrimmedString(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) {
    return value;
  }

  if (Array.isArray(value)) {
    const joined = value
      .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      .join("\n")
      .trim();
    return joined || undefined;
  }

  return undefined;
}

/**
 * Shape-only normalization for known Gemini field drifts.
 * Does not relax quality validation — only maps alternate shapes to the schema.
 */
function asStringArray(value: unknown, maxItems: number): string[] | undefined {
  if (Array.isArray(value)) {
    const items = value
      .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      .slice(0, maxItems);
    return items.length > 0 ? items : undefined;
  }

  if (typeof value === "string" && value.trim()) {
    const parts = value
      .split(/\r?\n|(?:(?<=\d)\.\s)|;\s+/)
      .map((part) => part.replace(/^\d+[\).:-]\s*/, "").trim())
      .filter(Boolean);
    if (parts.length > 1) {
      return parts.slice(0, maxItems);
    }
    return [value.trim()].slice(0, maxItems);
  }

  return undefined;
}

export function normalizeGeminiLessonPayload(raw: unknown): unknown {
  if (!raw || typeof raw !== "object") {
    return raw;
  }

  const lesson = { ...(raw as Record<string, unknown>) };

  if (lesson.handsOnExercise && typeof lesson.handsOnExercise === "object") {
    const exercise = { ...(lesson.handsOnExercise as Record<string, unknown>) };
    const instructions = asStringArray(exercise.instructions, 8);
    const hints = asStringArray(exercise.hints, 4);
    if (instructions) exercise.instructions = instructions;
    if (hints) exercise.hints = hints;
    if (typeof exercise.starterContent !== "string" && exercise.starterContent != null) {
      const starter = asTrimmedString(exercise.starterContent);
      if (starter) exercise.starterContent = starter;
    }
    if (typeof exercise.solution !== "string" && exercise.solution != null) {
      const solution = asTrimmedString(exercise.solution);
      if (solution) exercise.solution = solution;
    }
    lesson.handsOnExercise = exercise;
  }

  const sections = Array.isArray(lesson.sections) ? lesson.sections : null;

  if (!sections) {
    return lesson;
  }

  lesson.sections = sections.map((section) => {
    if (!section || typeof section !== "object") {
      return section;
    }

    const next = { ...(section as Record<string, unknown>) };

    if (typeof next.content !== "string" || !next.content.trim()) {
      const hop =
        next.handsOnPractice && typeof next.handsOnPractice === "object"
          ? (next.handsOnPractice as Record<string, unknown>)
          : null;
      const fallbackContent =
        asTrimmedString(hop?.exercise) ??
        asTrimmedString(hop?.instructions) ??
        asTrimmedString(next.practicalExample) ??
        asTrimmedString(next.summary);
      if (fallbackContent) {
        next.content = fallbackContent;
      }
    }

    if (next.practicalExample === undefined || next.practicalExample === null) {
      const hop =
        next.handsOnPractice && typeof next.handsOnPractice === "object"
          ? (next.handsOnPractice as Record<string, unknown>)
          : null;
      const fallback =
        asTrimmedString(hop?.exercise) ??
        asTrimmedString(hop?.expectedOutcome) ??
        asTrimmedString(next.content)?.slice(0, 900);
      if (fallback) {
        next.practicalExample = fallback;
      }
    }

    if (next.handsOnPractice && typeof next.handsOnPractice === "object") {
      const hop = { ...(next.handsOnPractice as Record<string, unknown>) };
      const instructions = asTrimmedString(hop.instructions);
      const thinkAbout = asTrimmedString(hop.thinkAbout);
      if (instructions) hop.instructions = instructions;
      if (thinkAbout) hop.thinkAbout = thinkAbout;
      next.handsOnPractice = hop;
    }

    if (Array.isArray(next.commonMistakes) && next.commonMistakes.length > 0 && next.commonMistakes.length < 3) {
      const heading = typeof next.heading === "string" ? next.heading : "this topic";
      const padded = next.commonMistakes.filter(
        (item): item is string => typeof item === "string" && item.trim().length > 0,
      );
      while (padded.length < 3) {
        padded.push(
          `Applying ${heading} incorrectly at step ${padded.length + 1} without checking the result.`,
        );
      }
      next.commonMistakes = padded.slice(0, 5);
    }

    if (Array.isArray(next.summary) && next.summary.length > 0 && next.summary.length < 3) {
      const heading = typeof next.heading === "string" ? next.heading : "this topic";
      const padded = next.summary.filter(
        (item): item is string => typeof item === "string" && item.trim().length > 0,
      );
      while (padded.length < 3) {
        padded.push(`Remember the key mechanism taught in ${heading}.`);
      }
      next.summary = padded.slice(0, 5);
    }

    if (Array.isArray(next.knowledgeCheck)) {
      next.knowledgeCheck = next.knowledgeCheck.map((check) => {
        if (!check || typeof check !== "object") {
          return check;
        }

        const kc = { ...(check as Record<string, unknown>) };
        const options = Array.isArray(kc.options) ? kc.options : [];

        if (
          (kc.correctIndex === undefined || kc.correctIndex === null) &&
          typeof kc.answer === "string"
        ) {
          const index = options.findIndex(
            (option) => typeof option === "string" && option === kc.answer,
          );
          if (index >= 0) {
            kc.correctIndex = index;
          }
        }

        if (
          (typeof kc.explanation !== "string" || !kc.explanation.trim()) &&
          typeof kc.correctIndex === "number" &&
          typeof options[kc.correctIndex] === "string"
        ) {
          kc.explanation = `The correct option is: ${options[kc.correctIndex]}`;
        }

        delete kc.answer;
        return kc;
      });
    }

    return next;
  });

  return lesson;
}

function summarizeRawLessonForDev(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== "object") {
    return { topType: typeof raw };
  }

  const obj = raw as Record<string, unknown>;
  const sections = Array.isArray(obj.sections) ? obj.sections : [];

  return {
    topKeys: Object.keys(obj),
    sectionsLen: sections.length,
    knowledgeCheckShapes: sections.map((section, index) => {
      if (!section || typeof section !== "object") {
        return { index, invalid: true };
      }
      const s = section as Record<string, unknown>;
      const checks = Array.isArray(s.knowledgeCheck) ? s.knowledgeCheck : [];
      return {
        index,
        heading: typeof s.heading === "string" ? s.heading : null,
        hasPracticalExample: typeof s.practicalExample === "string",
        commonMistakesLen: Array.isArray(s.commonMistakes) ? s.commonMistakes.length : null,
        knowledgeCheckLen: checks.length,
        knowledgeCheckKeys: checks
          .filter((check): check is Record<string, unknown> => Boolean(check) && typeof check === "object")
          .map((check) => Object.keys(check)),
        handsOnPracticeInstructionsType:
          s.handsOnPractice && typeof s.handsOnPractice === "object"
            ? typeof (s.handsOnPractice as { instructions?: unknown }).instructions
            : null,
      };
    }),
  };
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

    if (process.env.NODE_ENV === "development") {
      console.info("[generate-lesson:gemini:raw-dev]", {
        goalId: input.goalId,
        topicId: input.topicId,
        model: resolveModel(),
        timeoutMs,
        rawSummary: summarizeRawLessonForDev(raw),
      });
    }

    const normalized = normalizeGeminiLessonPayload(raw);
    const validated = aiLessonResponseSchema.safeParse(normalized);

    if (!validated.success) {
      const message = validated.error.issues[0]?.message ?? "Gemini lesson failed Zod validation.";
      const issues = validated.error.issues.slice(0, 25).map((issue) => ({
        path: issue.path.join("."),
        code: issue.code,
        message: issue.message,
      }));
      logGeminiLessonError("schema-validation", new Error(message), input.goalId, input.topicId, {
        issueCount: validated.error.issues.length,
        issues,
        rawSummary: summarizeRawLessonForDev(raw),
      });
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
