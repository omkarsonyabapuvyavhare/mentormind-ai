import type {
  AiLessonResponse,
  HandsOnExercise,
  PracticalArtifact,
  PracticalArtifactType,
} from "@/lib/ai/lesson-schema";
import type { GoalCategory } from "@/lib/goals/goal-identity";

export interface PracticalValidationContext {
  goalCategory: GoalCategory;
  topicTitle: string;
  topicId: string;
  learningObjectives?: string[];
}

const GENERIC_ARTIFACT_PATTERNS: RegExp[] = [
  /^see (the )?example above\.?$/i,
  /^refer to (the )?documentation\.?$/i,
  /^apply (the )?concept(s)? in practice\.?$/i,
  /^complete (the )?exercise below\.?$/i,
  /^example content\.?$/i,
  /^todo:? add example\.?$/i,
];

export const GENERIC_EXERCISE_PATTERNS: RegExp[] = [
  /write a (?:three-sentence )?summary/i,
  /explain (?:this|the topic) to a (?:colleague|friend|peer)/i,
  /find a public case study/i,
  /describe in your own words/i,
  /reflect on (?:what you|how you) learned/i,
  /teach .+ back to someone/i,
  /list what you (?:learned|remember)/i,
  /summarize the (?:key )?(?:points|ideas)/i,
  /research online and report/i,
];

const OUTPUT_EXPECTED_TYPES = new Set<PracticalArtifactType>(["code", "command", "query", "calculation"]);

export function looksLikeCode(content: string): boolean {
  return (
    /[=(){}\[\];]/.test(content) &&
    (/\b(def|function|class|import|print|return|const|let|var)\b/.test(content) ||
      /^[\s]*[#/]/.test(content) ||
      content.split("\n").filter((line) => line.trim().length > 0).length >= 2)
  );
}

export function looksLikeQuery(content: string): boolean {
  return /\b(SELECT|INSERT|UPDATE|DELETE|CREATE TABLE|FROM|JOIN|WHERE)\b/i.test(content);
}

export function looksLikeCommand(content: string): boolean {
  return (
    /^(kubectl|docker|npm|yarn|pnpm|git|aws|az|gcloud|curl|ssh|cd|ls|mkdir|chmod)\b/m.test(content) ||
    content.split("\n").some((line) => /^[\$>#]\s*\S/.test(line.trim()))
  );
}

export function looksLikeConfiguration(content: string): boolean {
  return (
    /^(apiVersion:|kind:|version:|services:|resources:)/m.test(content) ||
    /^\s*[A-Za-z0-9_.-]+\s*:\s*\S/m.test(content)
  );
}

export function looksLikeWorkflow(content: string): boolean {
  return /^\s*\d+[\).\]]\s+\S/m.test(content) || /^-\s+\S/m.test(content);
}

function corpusText(context: PracticalValidationContext, lesson: AiLessonResponse): string {
  return [
    context.topicTitle,
    context.topicId,
    context.goalCategory,
    ...(context.learningObjectives ?? []),
    ...lesson.learningObjectives,
  ]
    .join(" ")
    .toLowerCase();
}

function suggestsProgramming(corpus: string, category: GoalCategory): boolean {
  if (
    category === "Programming" ||
    category === "Web Development" ||
    category === "Mobile Development"
  ) {
    return true;
  }

  return /\b(code|program|python|javascript|typescript|java|function|variable|syntax|class|method|api|react|component)\b/.test(
    corpus,
  );
}

function suggestsQueryWork(corpus: string): boolean {
  return /\b(sql|query|select|join|database|table|schema|relational)\b/.test(corpus);
}

function suggestsCommandOrConfig(corpus: string): boolean {
  return /\b(docker|kubectl|cli|terminal|command|bash|shell|yaml|manifest|deployment|kubernetes|k8s|cloud|aws|azure|config)\b/.test(
    corpus,
  );
}

function artifactContentMatchesType(artifact: PracticalArtifact): boolean {
  const content = artifact.content.trim();

  if (content.length < 12) {
    return false;
  }

  if (GENERIC_ARTIFACT_PATTERNS.some((pattern) => pattern.test(content))) {
    return false;
  }

  switch (artifact.type) {
    case "code":
      return looksLikeCode(content);
    case "query":
      return looksLikeQuery(content);
    case "command":
      return looksLikeCommand(content);
    case "configuration":
      return looksLikeConfiguration(content);
    case "workflow":
      return looksLikeWorkflow(content) || content.length >= 40;
    case "diagram":
      return content.includes("→") || content.includes("->") || /^[\s]*[-|/\\]+/m.test(content);
    case "calculation":
      return /[=+\-*/^]/.test(content) || /\b\d+(?:\.\d+)?\b/.test(content);
    case "case-study":
      return content.length >= 80;
    default:
      return content.length >= 20;
  }
}

function exerciseIsConcrete(exercise: HandsOnExercise): boolean {
  const combined = [
    ...exercise.instructions,
    exercise.starterContent ?? "",
    exercise.expectedOutcome,
    exercise.solution ?? "",
  ].join(" ");

  if (GENERIC_EXERCISE_PATTERNS.some((pattern) => pattern.test(combined))) {
    return false;
  }

  const actionSignals =
    /\b(fix|debug|write|run|implement|complete|identify|correct|add|remove|change|configure|deploy|query|calculate|trace|analyze)\b/i;
  return actionSignals.test(combined) && exercise.instructions.length >= 1 && exercise.expectedOutcome.trim().length >= 12;
}

export function validatePracticalArtifact(
  artifact: PracticalArtifact | undefined,
  context: PracticalValidationContext,
  lesson: AiLessonResponse,
): string | null {
  if (!artifact) {
    return "Lesson must include a practicalArtifact with concrete technical content.";
  }

  if (!artifact.title.trim() || !artifact.content.trim() || !artifact.explanation.trim()) {
    return "practicalArtifact title, content, and explanation must be non-empty.";
  }

  if (!artifactContentMatchesType(artifact)) {
    return `practicalArtifact content does not match declared type "${artifact.type}".`;
  }

  if (OUTPUT_EXPECTED_TYPES.has(artifact.type) && !artifact.expectedOutput?.trim()) {
    return `practicalArtifact of type "${artifact.type}" must include expectedOutput.`;
  }

  const corpus = corpusText(context, lesson);

  if (artifact.type === "code" && suggestsProgramming(corpus, context.goalCategory) && !looksLikeCode(artifact.content)) {
    return "Programming-oriented lesson must include a code-like practicalArtifact.";
  }

  if (artifact.type === "query" && suggestsQueryWork(corpus) && !looksLikeQuery(artifact.content)) {
    return "Database-oriented lesson must include a query or schema practicalArtifact.";
  }

  if (
    (artifact.type === "command" || artifact.type === "configuration") &&
    suggestsCommandOrConfig(corpus) &&
    !looksLikeCommand(artifact.content) &&
    !looksLikeConfiguration(artifact.content)
  ) {
    return "Command or configuration topic must include a command or configuration practicalArtifact.";
  }

  if (
    suggestsProgramming(corpus, context.goalCategory) &&
    artifact.type === "code" &&
    looksLikeQuery(artifact.content) &&
    !looksLikeCode(artifact.content)
  ) {
    return "Programming lesson must not substitute a query artifact for code.";
  }

  if (
    !suggestsProgramming(corpus, context.goalCategory) &&
    !suggestsQueryWork(corpus) &&
    artifact.type === "code" &&
    looksLikeCode(artifact.content)
  ) {
    return "Non-programming topic must not fabricate programming code artifacts.";
  }

  return null;
}

export function validateHandsOnExercise(
  exercise: HandsOnExercise | undefined,
): string | null {
  if (!exercise) {
    return "Lesson must include a handsOnExercise with actionable steps.";
  }

  if (exercise.instructions.length < 1) {
    return "handsOnExercise must include at least one instruction step.";
  }

  if (exercise.hints.length < 1) {
    return "handsOnExercise must include at least one hint.";
  }

  if (!exercise.expectedOutcome.trim() || !exercise.solutionExplanation.trim()) {
    return "handsOnExercise must include expectedOutcome and solutionExplanation.";
  }

  if (!exerciseIsConcrete(exercise)) {
    return "handsOnExercise must require a concrete action, not generic study or summary tasks.";
  }

  return null;
}

export function validateLessonPracticalBlocks(
  lesson: AiLessonResponse,
  context: PracticalValidationContext,
): string | null {
  return (
    validatePracticalArtifact(lesson.practicalArtifact, context, lesson) ??
    validateHandsOnExercise(lesson.handsOnExercise)
  );
}
