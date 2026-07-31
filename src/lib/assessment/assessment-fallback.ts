import { slugifyTitle } from "@/lib/ai/slug-id";
import { containsAwsSpecificTopic } from "@/lib/ai/roadmap-schema";
import { formatTopicTitle } from "@/lib/format/topic-title";
import type { GoalCategory } from "@/lib/goals/goal-identity";
import type { HandsOnExercise, PracticalArtifact } from "@/lib/ai/lesson-schema";
import {
  assessmentQuestionSchema,
  TARGET_ASSESSMENT_QUESTIONS,
  type AssessmentQuestion,
} from "@/lib/assessment/assessment-schema";

export interface DeterministicAssessmentInput {
  topicId: string;
  topicTitle: string;
  goalSlug: string;
  goalCategory: GoalCategory;
  learningObjectives: string[];
  sections: Array<{
    heading: string;
    summary: string[];
    content: string;
    commonMistakes?: string[];
    practicalExample?: string;
  }>;
  practicalArtifact?: PracticalArtifact;
  handsOnExercise?: HandsOnExercise;
  startIndex?: number;
  count?: number;
  excludeConceptTags?: string[];
}

interface TopicQuestionSeed {
  conceptTag: string;
  prompt: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
  sourceSignal: "artifact" | "exercise" | "mistake" | "takeaway" | "core" | "objective";
}

function buildQuestionId(topicId: string, conceptTag: string, index: number): string {
  return `assessment-${topicId}-${conceptTag}-${index + 1}`;
}

function topicLabel(input: DeterministicAssessmentInput): string {
  return input.topicTitle || formatTopicTitle(input.topicId);
}

function clip(text: string, max = 160): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  return cleaned.length <= max ? cleaned : `${cleaned.slice(0, max - 1)}…`;
}

function scrubCrossDomainTerms(text: string, goalSlug: string, goalCategory: GoalCategory): string {
  let next = text;

  if (goalSlug !== "aws-saa-c03") {
    next = next
      .replace(/\bAmazon Web Services\b/gi, "the cloud platform")
      .replace(/\bAmazon EC2\b/gi, "virtual machines")
      .replace(/\bEC2\b/gi, "compute instances")
      .replace(/\bAWS\b/gi, "cloud")
      .replace(/\bS3\b/gi, "object storage")
      .replace(/\bVPC\b/gi, "virtual network")
      .replace(/\bIAM\b/gi, "identity access")
      .replace(/\bAMI\b/gi, "machine image")
      .replace(/\bLambda\b/gi, "serverless functions")
      .replace(/\bRDS\b/gi, "managed databases")
      .replace(/\bDynamoDB\b/gi, "NoSQL tables")
      .replace(/\bCloudFront\b/gi, "content delivery")
      .replace(/\bSAA-C03\b/gi, "cloud certification");
  }

  if (goalCategory === "Programming") {
    next = next.replace(/\b(azure|aws)\b/gi, "platform");
  }

  return next;
}

function sanitizeText(
  text: string,
  goalCategory: GoalCategory,
  goalSlug: string,
  label: string,
): string {
  const scrubbed = scrubCrossDomainTerms(text, goalSlug, goalCategory);

  if (goalSlug !== "aws-saa-c03" && containsAwsSpecificTopic(scrubbed)) {
    return `Apply the correct ${label} technique for this scenario (${scrubbed.length % 7}).`;
  }

  if (goalCategory === "Programming" && /\b(azure|aws ec2)\b/i.test(scrubbed)) {
    return `Apply the correct ${label} technique for this scenario.`;
  }

  return scrubbed;
}

function uniqueOptions(
  correct: string,
  distractors: string[],
): [string, string, string, string] {
  const seen = new Set<string>();
  const options: string[] = [];

  for (const option of [correct, ...distractors]) {
    const key = option.trim().toLowerCase();
    if (!key || seen.has(key)) {
      continue;
    }
    seen.add(key);
    options.push(option.trim());
    if (options.length === 4) {
      break;
    }
  }

  const fillers = [
    "Skip verification and assume the first attempt is correct",
    "Replace the technical step with memorizing the topic title",
    "Change unrelated settings and ignore the expected outcome",
  ];
  for (const candidate of fillers) {
    if (options.length >= 4) {
      break;
    }
    const key = candidate.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      options.push(candidate);
    }
  }

  return options as [string, string, string, string];
}

function seedToQuestion(
  input: DeterministicAssessmentInput,
  seed: TopicQuestionSeed,
  index: number,
): AssessmentQuestion {
  const label = topicLabel(input);
  const prompt = sanitizeText(seed.prompt, input.goalCategory, input.goalSlug, label);
  const options = uniqueOptions(
    sanitizeText(seed.options[seed.correctIndex] ?? seed.options[0]!, input.goalCategory, input.goalSlug, label),
    seed.options
      .filter((_, optionIndex) => optionIndex !== seed.correctIndex)
      .map((option) => sanitizeText(option, input.goalCategory, input.goalSlug, label)),
  );
  const safeConceptTag = slugifyTitle(
    scrubCrossDomainTerms(seed.conceptTag.replace(/-/g, " "), input.goalSlug, input.goalCategory),
  ).slice(0, 64) || `concept-${index + 1}`;

  return assessmentQuestionSchema.parse({
    id: buildQuestionId(input.topicId, safeConceptTag, (input.startIndex ?? 0) + index),
    topicId: input.topicId,
    conceptTag: safeConceptTag,
    prompt,
    options,
    correctIndex: 0,
    explanation: sanitizeText(seed.explanation, input.goalCategory, input.goalSlug, label),
  });
}

function buildArtifactSeed(input: DeterministicAssessmentInput): TopicQuestionSeed | null {
  const artifact = input.practicalArtifact;
  if (!artifact?.content?.trim()) {
    return null;
  }

  const label = topicLabel(input);
  const contentPreview = clip(artifact.content.split("\n").filter(Boolean)[0] ?? artifact.content, 80);

  if (artifact.type === "code" || artifact.type === "query" || artifact.type === "command") {
    const correct =
      artifact.expectedOutput?.trim() ||
      `The artifact produces the intended ${label} result when executed correctly.`;
    return {
      conceptTag: "practical-artifact-output",
      prompt: `Given this ${artifact.type} from ${label}:\n${contentPreview}\nWhat is the expected outcome?`,
      options: uniqueOptions(clip(correct, 180), [
        "The command fails because the syntax is invalid in every case",
        "No observable result is produced",
        "The result is unrelated to the provided inputs",
      ]),
      correctIndex: 0,
      explanation: artifact.explanation || `Correct ${artifact.type} execution yields the expected result.`,
      sourceSignal: "artifact",
    };
  }

  if (artifact.type === "configuration") {
    return {
      conceptTag: "practical-artifact-config",
      prompt: `In the ${label} configuration artifact, which statement is correct?`,
      options: uniqueOptions(clip(artifact.explanation, 180), [
        "Configuration fields can be omitted without changing runtime behavior",
        "Labels and selectors never affect routing or selection",
        "Desired state is ignored by controllers after the first apply",
      ]),
      correctIndex: 0,
      explanation: artifact.explanation,
      sourceSignal: "artifact",
    };
  }

  return {
    conceptTag: "practical-artifact-workflow",
    prompt: `Which description best matches the worked ${artifact.type} for ${label}?`,
    options: uniqueOptions(clip(artifact.explanation, 180), [
      "Skip verification and assume the first attempt succeeded",
      "Replace technical steps with a summary of the topic title",
      "Ignore intermediate checkpoints when checking results",
    ]),
    correctIndex: 0,
    explanation: artifact.explanation,
    sourceSignal: "artifact",
  };
}

function buildExerciseSeed(input: DeterministicAssessmentInput): TopicQuestionSeed | null {
  const exercise = input.handsOnExercise;
  if (!exercise) {
    return null;
  }

  const label = topicLabel(input);
  const correct =
    exercise.expectedOutcome?.trim() ||
    exercise.solutionExplanation?.trim() ||
    `Complete the ${label} exercise and verify the expected outcome.`;

  const starterHint = exercise.starterContent
    ? clip(exercise.starterContent.split("\n").filter(Boolean)[0] ?? exercise.starterContent, 70)
    : null;

  return {
    conceptTag: "hands-on-exercise",
    prompt: starterHint
      ? `In the ${label} hands-on exercise starting with "${starterHint}", what indicates a correct solution?`
      : `In the ${label} hands-on exercise, what indicates a correct solution?`,
    options: uniqueOptions(clip(correct, 180), [
      "Leaving the starter content unchanged without verification",
      "Writing a summary instead of performing the technical steps",
      "Changing every input at once so the failure cannot be diagnosed",
    ]),
    correctIndex: 0,
    explanation: exercise.solutionExplanation || correct,
    sourceSignal: "exercise",
  };
}

function buildMistakeSeeds(input: DeterministicAssessmentInput): TopicQuestionSeed[] {
  const label = topicLabel(input);
  const mistakes = input.sections.flatMap((section) => section.commonMistakes ?? []);
  const uniqueMistakes = [...new Set(mistakes.map((item) => item.trim()).filter(Boolean))];
  const mistake = uniqueMistakes[0];

  if (!mistake) {
    return [];
  }

  const corrected =
    input.sections.find((section) => section.commonMistakes?.includes(mistake))?.summary[0] ??
    `Apply the correct ${label} technique and verify the result.`;

  return [
    {
      conceptTag: "common-misconception",
      prompt: `During ${label} practice, which action best corrects a frequent implementation error?`,
      options: uniqueOptions(clip(corrected, 180), [
        clip(mistake, 180),
        `Ignore verification and assume ${label} succeeded`,
        `Reuse an unrelated technique from another topic`,
      ]),
      correctIndex: 0,
      explanation: `The correct ${label} approach avoids the listed pitfall and verifies the result.`,
      sourceSignal: "mistake",
    },
  ];
}

function isMetaSectionHeading(heading: string): boolean {
  return /lesson overview|learning goals?|roadmap|study tips|why this topic|next steps/i.test(
    heading,
  );
}

function buildTakeawaySeeds(input: DeterministicAssessmentInput): TopicQuestionSeed[] {
  const label = topicLabel(input);
  const takeaways = input.sections
    .filter((section) => !isMetaSectionHeading(section.heading))
    .flatMap((section) => section.summary.map((item) => ({ heading: section.heading, item })))
    .filter((entry) => entry.item.trim().length > 0 && !/lesson overview|learning goal|roadmap/i.test(entry.item));

  const entry = takeaways[0];

  if (!entry) {
    return [];
  }

  const safeHeading = sanitizeText(entry.heading, input.goalCategory, input.goalSlug, label);

  return [
    {
      conceptTag: `key-takeaway-${slugifyTitle(safeHeading).slice(0, 32) || "core"}`,
      prompt: `Which key takeaway should you keep from ${safeHeading}?`,
      options: uniqueOptions(
        sanitizeText(clip(entry.item, 180), input.goalCategory, input.goalSlug, label),
        [
          `Skip ${safeHeading.toLowerCase()} because it never affects outcomes`,
          `Treat ${label} results as correct without checking evidence`,
          `Replace ${safeHeading.toLowerCase()} with memorizing the topic title`,
        ],
      ),
      correctIndex: 0,
      explanation: entry.item,
      sourceSignal: "takeaway",
    },
  ];
}

function buildCoreSectionSeed(input: DeterministicAssessmentInput): TopicQuestionSeed | null {
  const core =
    input.sections.find((section) => /core explanation/i.test(section.heading)) ??
    input.sections.find((section) => section.content.trim().length >= 40) ??
    input.sections[0];

  if (!core) {
    return null;
  }

  const label = topicLabel(input);
  const correct = sanitizeText(
    clip(core.summary[0] ?? core.content, 180),
    input.goalCategory,
    input.goalSlug,
    label,
  );

  return {
    conceptTag: "core-explanation",
    prompt: `According to the Core Explanation for ${label}, which statement is correct?`,
    options: uniqueOptions(correct, [
      clip(core.commonMistakes?.[0] ?? `Misapply ${label} without checking definitions`, 180),
      `Core ${label} mechanics can be skipped if the title looks familiar`,
      `Output verification is optional for ${label}`,
    ]),
    correctIndex: 0,
    explanation: correct,
    sourceSignal: "core",
  };
}

function buildObjectiveSkillSeeds(input: DeterministicAssessmentInput): TopicQuestionSeed[] {
  const label = topicLabel(input);

  return input.learningObjectives
    .filter((objective) => objective.trim().length > 0)
    .filter((objective) => !/explain key ideas|learning goal|roadmap|study/i.test(objective))
    .slice(0, 3)
    .map((objective, index) => {
      const section = input.sections[index] ?? input.sections[0];
      const correct = sanitizeText(
        clip(section?.summary[0] ?? `Demonstrate: ${objective}`, 180),
        input.goalCategory,
        input.goalSlug,
        label,
      );

      return {
        conceptTag: `objective-${slugifyTitle(objective).slice(0, 40) || index + 1}`,
        prompt: `Which choice correctly demonstrates this ${label} skill: ${clip(objective, 100)}?`,
        options: uniqueOptions(correct, [
          `Describe the topic title without performing ${clip(objective, 60)}`,
          `Skip verification after attempting ${clip(objective, 60)}`,
          `Substitute an unrelated technique for ${clip(objective, 60)}`,
        ]),
        correctIndex: 0,
        explanation: `This option matches the skill "${objective}".`,
        sourceSignal: "objective" as const,
      };
    });
}

function collectQuestionSeeds(input: DeterministicAssessmentInput): TopicQuestionSeed[] {
  const preferredOrder: Array<TopicQuestionSeed | null> = [
    buildArtifactSeed(input),
    buildExerciseSeed(input),
    buildCoreSectionSeed(input),
    ...buildMistakeSeeds(input),
    ...buildTakeawaySeeds(input),
    ...buildObjectiveSkillSeeds(input).slice(0, 2),
  ];

  const seeds: TopicQuestionSeed[] = [];
  const usedTags = new Set<string>();
  const usedPrompts = new Set<string>();

  for (const seed of preferredOrder) {
    if (!seed) {
      continue;
    }

    const promptKey = seed.prompt.trim().toLowerCase().replace(/\s+/g, " ");
    if (usedTags.has(seed.conceptTag) || usedPrompts.has(promptKey)) {
      continue;
    }

    usedTags.add(seed.conceptTag);
    usedPrompts.add(promptKey);
    seeds.push(seed);
  }

  return seeds;
}

export function buildDeterministicAssessmentQuestions(
  input: DeterministicAssessmentInput,
): AssessmentQuestion[] {
  const requestedCount = input.count ?? TARGET_ASSESSMENT_QUESTIONS;
  const count = Math.min(Math.max(requestedCount, 1), TARGET_ASSESSMENT_QUESTIONS);
  const excluded = new Set(input.excludeConceptTags ?? []);
  const questions: AssessmentQuestion[] = [];

  const seeds = collectQuestionSeeds(input).filter((seed) => !excluded.has(seed.conceptTag));

  for (const seed of seeds) {
    if (questions.length >= count) {
      break;
    }
    questions.push(seedToQuestion(input, seed, questions.length));
  }

  // Last-resort distinct fillers derived from technical section headings — never repeat the same stem.
  const fillerSections = input.sections.filter((section) => !isMetaSectionHeading(section.heading));
  let fillerIndex = 0;
  while (questions.length < count && fillerSections.length > 0 && fillerIndex < fillerSections.length * 3) {
    const section = fillerSections[fillerIndex % fillerSections.length]!;
    const label = topicLabel(input);
    const safeHeading = sanitizeText(section.heading, input.goalCategory, input.goalSlug, label);
    const conceptTag = `section-skill-${fillerIndex + 1}-${slugifyTitle(safeHeading).slice(0, 24)}`;
    const correct = sanitizeText(
      clip(section.summary[0] ?? section.content, 180),
      input.goalCategory,
      input.goalSlug,
      label,
    );

    if (!excluded.has(conceptTag) && !questions.some((question) => question.conceptTag === conceptTag)) {
      questions.push(
        seedToQuestion(
          input,
          {
            conceptTag,
            prompt: `For ${safeHeading} in ${label}, which statement is technically correct?`,
            options: uniqueOptions(correct, [
              clip(section.commonMistakes?.[0] ?? `Misread ${safeHeading}`, 180),
              `Treat ${safeHeading} as optional background reading`,
              `Skip checking results after applying ${safeHeading}`,
            ]),
            correctIndex: 0,
            explanation: correct,
            sourceSignal: "core",
          },
          questions.length,
        ),
      );
    }

    fillerIndex += 1;
  }

  if (questions.length < count) {
    throw new Error(
      `Unable to construct ${count} distinct technical assessment questions for ${input.topicId}.`,
    );
  }

  return questions.slice(0, count);
}

export function buildDeterministicTopicAssessment(input: DeterministicAssessmentInput): {
  topicId: string;
  passingScore: number;
  questions: AssessmentQuestion[];
  source: "fallback";
} {
  return {
    topicId: input.topicId,
    passingScore: 70,
    questions: buildDeterministicAssessmentQuestions({
      ...input,
      count: TARGET_ASSESSMENT_QUESTIONS,
    }),
    source: "fallback",
  };
}
