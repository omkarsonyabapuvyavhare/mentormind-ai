import { getKnowledgeGraphById } from "@/knowledge-base/registry/knowledge-graph-registry";
import { matchTopic } from "@/knowledge-base/registry/match-topic";
import { resolveKnowledgeGraph } from "@/knowledge-base/registry/resolve-knowledge-graph";
import type { KnowledgeConcept, KnowledgeGraph, KnowledgeTopic } from "@/knowledge-base/schema";
import {
  HANDS_ON_PRACTICE_HEADING,
  estimateWordCount,
  type AiLessonResponse,
  type KnowledgeCheck,
  type LessonSection,
} from "@/lib/ai/lesson-schema";
import type { GoalCategory } from "@/lib/goals/goal-identity";

export interface BuildKgLessonInput {
  topicId: string;
  knowledgeGraphId?: string;
  goalTitle?: string;
  goalCategory?: GoalCategory;
  aliases?: string[];
  graph?: KnowledgeGraph | null;
}

export type KgLessonResult =
  | {
      ok: true;
      lesson: AiLessonResponse;
      knowledgeGraphId: string;
      canonicalTopicId: string;
    }
  | {
      ok: false;
      reason: string;
    };

/** Coursera-style section headings (UI/schema contracts). Knowledge checks = topic check-in. */
const KG_LESSON_HEADINGS = [
  "Lesson Overview",
  "Core Concepts",
  "Practical Example",
  HANDS_ON_PRACTICE_HEADING,
  "Common Mistakes",
  "Mentor Tips",
  "Key Takeaways",
] as const;

function resolveGraph(input: BuildKgLessonInput): KnowledgeGraph | null {
  if (input.graph) {
    return input.graph;
  }
  if (input.knowledgeGraphId) {
    return getKnowledgeGraphById(input.knowledgeGraphId) ?? null;
  }
  if (input.goalTitle && input.goalCategory) {
    const resolved = resolveKnowledgeGraph(
      input.goalTitle,
      input.goalCategory,
      input.aliases ?? [],
    );
    return resolved.status === "resolved" ? resolved.graph : null;
  }
  return null;
}

function findTopic(graph: KnowledgeGraph, topicId: string): KnowledgeTopic | null {
  const exact = graph.topics.find((topic) => topic.id === topicId);
  if (exact) {
    return exact;
  }
  return matchTopic(graph, topicId).topic;
}

function conceptList(concepts: KnowledgeConcept[]): string {
  return concepts.map((concept) => concept.title).join(", ");
}

function clamp(text: string, max: number): string {
  if (text.length <= max) {
    return text;
  }
  return `${text.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}

function buildKnowledgeCheck(
  topic: KnowledgeTopic,
  concept: KnowledgeConcept,
  index: number,
): KnowledgeCheck {
  const correct = clamp(`${concept.title}: ${concept.description}`, 200);
  const distractors = topic.concepts
    .filter((entry) => entry.id !== concept.id)
    .slice(0, 3)
    .map((entry, offset) =>
      clamp(`${entry.title} does not replace ${concept.title} (distractor ${offset + 1})`, 200),
    );

  while (distractors.length < 3) {
    distractors.push(
      clamp(
        `Incorrect claim about ${concept.title} in ${topic.title} (option ${distractors.length + 1})`,
        200,
      ),
    );
  }

  const options = [correct, distractors[0]!, distractors[1]!, distractors[2]!] as [
    string,
    string,
    string,
    string,
  ];
  const correctIndex = (index % 4) as 0 | 1 | 2 | 3;
  if (correctIndex !== 0) {
    const swapped = [...options] as [string, string, string, string];
    const tmp = swapped[0];
    swapped[0] = swapped[correctIndex]!;
    swapped[correctIndex] = tmp!;
    return {
      question: clamp(
        `In ${topic.title}, which statement correctly describes ${concept.title}?`,
        300,
      ),
      options: swapped,
      correctIndex,
      explanation: clamp(`${concept.title} means: ${concept.description}`, 400),
      conceptTag: concept.id.slice(0, 64),
    };
  }

  return {
    question: clamp(
      `In ${topic.title}, which statement correctly describes ${concept.title}?`,
      300,
    ),
    options,
    correctIndex: 0,
    explanation: clamp(`${concept.title} means: ${concept.description}`, 400),
    conceptTag: concept.id.slice(0, 64),
  };
}

function mistakePool(topic: KnowledgeTopic): string[] {
  const fromSeeds = topic.commonMistakes.map((entry) =>
    clamp(`${entry.mistake} — ${entry.correction}`, 300),
  );
  const fromConcepts = topic.concepts.flatMap((concept) =>
    concept.commonMistakes.map((text) => clamp(`${concept.title}: ${text}`, 300)),
  );
  const combined = [...fromSeeds, ...fromConcepts];
  while (combined.length < 3) {
    const concept = topic.concepts[combined.length % topic.concepts.length]!;
    combined.push(
      clamp(
        `Treating ${concept.title} as optional in ${topic.title} leads to broken results.`,
        300,
      ),
    );
  }
  return combined.slice(0, 5);
}

function uniqueStrings(values: string[], min: number, max: number): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    const key = value.trim().toLowerCase();
    if (!key || seen.has(key)) {
      continue;
    }
    seen.add(key);
    out.push(value);
    if (out.length >= max) {
      break;
    }
  }
  let i = 0;
  while (out.length < min) {
    out.push(clamp(`${values[0] ?? "Stay precise"} (${i + 1})`, 300));
    i += 1;
  }
  return out;
}

function wordBudget(difficulty: KnowledgeTopic["difficulty"]): { min: number; max: number } {
  if (difficulty === "advanced") {
    return { min: 1400, max: 2000 };
  }
  if (difficulty === "intermediate") {
    return { min: 1200, max: 1800 };
  }
  return { min: 800, max: 1400 };
}

function buildOverviewContent(topic: KnowledgeTopic, concepts: KnowledgeConcept[]): string {
  const compact = topic.difficulty === "beginner";
  return clamp(
    [
      `${topic.title} focuses on ${conceptList(concepts.slice(0, compact ? 3 : 4))}${concepts.length > (compact ? 3 : 4) ? ", and related techniques" : ""}.`,
      compact ? clamp(topic.description, 220) : topic.description,
      compact
        ? "One concept map, one worked artifact, one exercise, then short checks."
        : "You will learn how these ideas connect, apply them in one worked artifact, complete one hands-on exercise, and verify understanding with short checks.",
      topic.difficulty === "beginner"
        ? "Start with clear definitions before combining ideas."
        : topic.difficulty === "advanced"
          ? "Pay attention to edge cases, trade-offs, and how mistakes show up under real constraints."
          : "Connect each mechanism to the decisions you make when building a working example.",
    ].join("\n\n"),
    compact ? 900 : 2400,
  );
}

function buildCoreConceptsContent(
  topic: KnowledgeTopic,
  concepts: KnowledgeConcept[],
  expanded: boolean,
): string {
  const beginner = topic.difficulty === "beginner";
  const descLimit = expanded ? (beginner ? 140 : 280) : beginner ? 90 : 150;
  const exampleLimit = expanded ? (beginner ? 120 : 220) : beginner ? 80 : 140;
  // Beginner: keep the map tight; include mini-examples only when expanding for word floor.
  const includeExamples = expanded || !beginner;

  const blocks = concepts.map((concept) => {
    const example = concept.examples[0];
    const exampleLine =
      includeExamples && example
        ? ` Example — ${example.title}: ${clamp(example.content, exampleLimit)}`
        : "";
    return `• ${concept.title}: ${clamp(concept.description, descLimit)}${exampleLine}`;
  });

  return clamp(
    [
      beginner
        ? `Core concepts for ${topic.title}:`
        : `All core ideas for ${topic.title} are covered below in one place—use this as the single concept map for the lesson.`,
      ...blocks,
    ].join("\n\n"),
    beginner && !expanded ? 1400 : 2400,
  );
}

function buildPracticalContent(topic: KnowledgeTopic, concepts: KnowledgeConcept[]): string {
  const artifact = topic.practicalArtifacts[0]!;
  const linked = concepts.filter((concept) => artifact.conceptIds.includes(concept.id));
  const beginner = topic.difficulty === "beginner";
  return clamp(
    [
      `Worked example: ${artifact.title} (${artifact.type}).`,
      `Demonstrates ${conceptList(linked.length > 0 ? linked : concepts.slice(0, 3))}.`,
      clamp(artifact.explanation, beginner ? 180 : 400),
      artifact.expectedOutput ? `Expected output: ${artifact.expectedOutput}` : "",
      `Artifact:\n${clamp(artifact.content, beginner ? 700 : 1600)}`,
    ]
      .filter(Boolean)
      .join("\n\n"),
    beginner ? 1200 : 2400,
  );
}

function buildHandsOnContent(topic: KnowledgeTopic, concepts: KnowledgeConcept[]): string {
  const exercise = topic.exercises[0]!;
  const linked = concepts.filter((concept) => exercise.conceptIds.includes(concept.id));
  const beginner = topic.difficulty === "beginner";
  return clamp(
    [
      `Hands-on: ${exercise.title}.`,
      `Focus: ${conceptList(linked.length > 0 ? linked : concepts.slice(0, 3))}.`,
      ...exercise.instructions.map((step, index) => `${index + 1}. ${step}`),
      `Expected outcome: ${exercise.expectedOutcome}`,
    ].join("\n\n"),
    beginner ? 1000 : 2400,
  );
}

function buildMistakesContent(topic: KnowledgeTopic, concepts: KnowledgeConcept[]): string {
  const beginner = topic.difficulty === "beginner";
  const seedBlocks = topic.commonMistakes.map((entry) =>
    beginner
      ? `${entry.mistake} — ${entry.correction}`
      : [
          `${entry.mistake}`,
          `Why it happens: ${entry.whyItHappens}`,
          `Correction: ${entry.correction}`,
        ].join(" "),
  );

  const conceptExtras = beginner
    ? []
    : concepts
        .flatMap((concept) =>
          concept.commonMistakes.slice(0, 1).map((text) => `${concept.title}: ${text}`),
        )
        .slice(0, 2);

  return clamp([...seedBlocks, ...conceptExtras].join("\n\n"), beginner ? 900 : 2400);
}

function buildMentorTipsContent(topic: KnowledgeTopic, concepts: KnowledgeConcept[]): string {
  const primary = concepts[0]?.title ?? topic.title;
  const secondary = concepts[1]?.title ?? primary;
  const tips =
    topic.difficulty === "beginner"
      ? [
          `Change one detail at a time with ${primary}.`,
          `Keep a tiny runnable reference for ${topic.title}.`,
          `Read errors literally—they usually name the broken ${primary} assumption.`,
        ]
      : topic.difficulty === "advanced"
        ? [
            `State the invariants ${topic.title} must preserve before optimizing ${primary}.`,
            `Pair every shortcut involving ${secondary} with the failure mode it introduces.`,
            `Review changes to ${primary} with the same rigor as production code.`,
            `Prefer the smallest failing case when ${topic.title} behavior is unclear.`,
          ]
        : [
            `Checklist for ${primary}: inputs, steps, verification, then rollback.`,
            `When stuck on ${topic.title}, reduce to the smallest case that still uses ${secondary}.`,
            `Compare your result to the worked artifact before inventing a new approach.`,
            `Name the exact concept you are applying—${primary} vs ${secondary}—before editing.`,
          ];

  return clamp(tips.join("\n\n"), topic.difficulty === "beginner" ? 700 : 2400);
}

function buildTakeawaysContent(topic: KnowledgeTopic, concepts: KnowledgeConcept[]): string {
  const limit = topic.difficulty === "beginner" ? 3 : 5;
  return clamp(
    [
      `Key outcomes for ${topic.title}:`,
      ...concepts.slice(0, limit).map((concept) => `• Use ${concept.title} with a checkable result.`),
      `One artifact and one exercise prove ${concepts[0]?.title ?? topic.title}.`,
    ].join("\n\n"),
    topic.difficulty === "beginner" ? 700 : 2400,
  );
}

/**
 * Schema requires practicalExample / commonMistakes / summary on every section.
 * Keep non-primary boxes short so the lesson does not become repeated mini-lessons.
 */
function supportFields(
  topic: KnowledgeTopic,
  concepts: KnowledgeConcept[],
  mistakes: string[],
  mode: "overview" | "concepts" | "practical" | "handsOn" | "mistakes" | "tips" | "takeaways",
): Pick<LessonSection, "practicalExample" | "commonMistakes" | "summary"> {
  const artifact = topic.practicalArtifacts[0]!;
  const primary = concepts[0]?.title ?? topic.title;
  const secondary = concepts[1]?.title ?? primary;
  const shortMistakes = uniqueStrings(
    [
      clamp(mistakes[0] ?? `Skipping ${primary}`, 120),
      clamp(mistakes[1] ?? `Skipping verification for ${primary}`, 120),
      clamp(mistakes[2] ?? `Confusing ${primary} with ${secondary}`, 120),
    ],
    3,
    3,
  );
  const shortSummary = uniqueStrings(
    [
      clamp(`${primary} matters in ${topic.title}`, 120),
      clamp(`Check ${secondary} in results`, 120),
      clamp(`One artifact + one exercise`, 120),
    ],
    3,
    3,
  );

  if (mode === "practical") {
    return {
      practicalExample: clamp(
        `${artifact.title}\n${clamp(artifact.content, topic.difficulty === "beginner" ? 500 : 800)}${
          artifact.expectedOutput ? `\nExpected: ${artifact.expectedOutput}` : ""
        }`,
        topic.difficulty === "beginner" ? 700 : 900,
      ),
      commonMistakes: shortMistakes,
      summary: uniqueStrings(
        [
          clamp(`"${artifact.title}" shows ${primary}`, 140),
          clamp(`Keep ${secondary} visible`, 140),
          artifact.expectedOutput
            ? clamp(`Match: ${artifact.expectedOutput}`, 140)
            : clamp(`Validate against ${topic.title}`, 140),
        ],
        3,
        3,
      ),
    };
  }

  if (mode === "mistakes") {
    return {
      practicalExample: clamp(
        topic.commonMistakes[0]
          ? `Broken: ${topic.commonMistakes[0].mistake}. Fixed: ${topic.commonMistakes[0].correction}.`
          : `Fix the top mistake in ${topic.title}, then re-run the artifact.`,
        400,
      ),
      commonMistakes: uniqueStrings(mistakes.map((entry) => clamp(entry, 160)), 3, 5),
      summary: uniqueStrings(
        [
          clamp(topic.commonMistakes[0]?.correction ?? `Correct ${primary} first`, 140),
          clamp(topic.commonMistakes[1]?.correction ?? `Recheck ${secondary}`, 140),
          clamp(`${topic.title} mistakes often start at ${primary}`, 140),
        ],
        3,
        3,
      ),
    };
  }

  if (mode === "takeaways") {
    return {
      practicalExample: clamp(`Recreate ${artifact.title} using ${primary}.`, 200),
      commonMistakes: shortMistakes,
      summary: uniqueStrings(
        [
          clamp(`${primary} is required in ${topic.title}`, 140),
          clamp(`Practice via the single artifact`, 140),
          clamp(`Watch: ${topic.commonMistakes[0]?.mistake ?? primary}`, 140),
        ],
        3,
        3,
      ),
    };
  }

  // Compact support fields for overview / concepts / hands-on / tips (schema-required only).
  return {
    practicalExample: clamp(
      mode === "handsOn"
        ? `Starter for "${topic.exercises[0]!.title}".`
        : concepts[0]?.examples[0]
          ? clamp(concepts[0].examples[0].content, 160)
          : `Apply ${primary} once and check the result.`,
      220,
    ),
    commonMistakes: shortMistakes,
    summary: shortSummary,
  };
}

function distributeChecks(checks: KnowledgeCheck[]): KnowledgeCheck[][] {
  const buckets: KnowledgeCheck[][] = Array.from({ length: KG_LESSON_HEADINGS.length }, () => []);
  for (let i = 0; i < checks.length; i += 1) {
    // Place all five checks across the first five teaching sections (topic check-in).
    buckets[i % 5]!.push(checks[i]!);
  }
  return buckets;
}

function headingsAreUnique(sections: LessonSection[]): boolean {
  const seen = new Set<string>();
  for (const section of sections) {
    const key = section.heading.trim().toLowerCase();
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
  }
  return true;
}

function buildCourseraSections(
  topic: KnowledgeTopic,
  checks: KnowledgeCheck[],
  expandedConcepts: boolean,
): LessonSection[] {
  const concepts = topic.concepts;
  const mistakes = mistakePool(topic);
  const checkBuckets = distributeChecks(checks);
  const exercise = topic.exercises[0]!;
  const artifact = topic.practicalArtifacts[0]!;

  const sections: LessonSection[] = [
    {
      heading: KG_LESSON_HEADINGS[0],
      content: buildOverviewContent(topic, concepts),
      ...supportFields(topic, concepts, mistakes, "overview"),
      knowledgeCheck: checkBuckets[0]!,
    },
    {
      heading: KG_LESSON_HEADINGS[1],
      content: buildCoreConceptsContent(topic, concepts, expandedConcepts),
      ...supportFields(topic, concepts, mistakes, "concepts"),
      knowledgeCheck: checkBuckets[1]!,
    },
    {
      heading: KG_LESSON_HEADINGS[2],
      content: buildPracticalContent(topic, concepts),
      ...supportFields(topic, concepts, mistakes, "practical"),
      knowledgeCheck: checkBuckets[2]!,
    },
    {
      heading: KG_LESSON_HEADINGS[3],
      content: buildHandsOnContent(topic, concepts),
      ...supportFields(topic, concepts, mistakes, "handsOn"),
      handsOnPractice: {
        exercise: clamp(`${exercise.title}: apply ${conceptList(concepts.slice(0, 2))}.`, 1200),
        instructions: clamp(
          exercise.instructions.map((step, index) => `${index + 1}. ${step}`).join("\n"),
          1200,
        ),
        thinkAbout: clamp(
          `Which inputs prove ${concepts[0]?.title ?? topic.title} worked, and what output would fail if ${concepts[1]?.title ?? concepts[0]?.title ?? topic.title} were wrong?`,
          600,
        ),
        hints: exercise.hints.slice(0, 4).map((hint) => clamp(hint, 300)),
        expectedOutcome: clamp(exercise.expectedOutcome, 600),
        solutionExplanation: clamp(
          `${exercise.title} succeeds when ${
            conceptList(
              concepts.filter((concept) => exercise.conceptIds.includes(concept.id)),
            ) || concepts[0]!.title
          } are applied correctly. ${artifact.explanation}`,
          900,
        ),
      },
      knowledgeCheck: checkBuckets[3]!,
    },
    {
      heading: KG_LESSON_HEADINGS[4],
      content: buildMistakesContent(topic, concepts),
      ...supportFields(topic, concepts, mistakes, "mistakes"),
      knowledgeCheck: checkBuckets[4]!,
    },
    {
      heading: KG_LESSON_HEADINGS[5],
      content: buildMentorTipsContent(topic, concepts),
      ...supportFields(topic, concepts, mistakes, "tips"),
      knowledgeCheck: checkBuckets[5]!,
    },
    {
      heading: KG_LESSON_HEADINGS[6],
      content: buildTakeawaysContent(topic, concepts),
      ...supportFields(topic, concepts, mistakes, "takeaways"),
      knowledgeCheck: checkBuckets[6]!,
    },
  ];

  return sections;
}

function assembleLesson(
  topic: KnowledgeTopic,
  checks: KnowledgeCheck[],
  expandedConcepts: boolean,
): AiLessonResponse {
  const artifactSeed = topic.practicalArtifacts[0]!;
  const exerciseSeed = topic.exercises[0]!;
  const conceptObjectives = topic.concepts
    .slice(0, 6)
    .map((entry) => clamp(`Use ${entry.title} correctly in ${topic.title}`, 200));

  return {
    title: clamp(`${topic.title}: guided practice`, 200),
    estimatedMinutes:
      topic.difficulty === "advanced" ? 45 : topic.difficulty === "intermediate" ? 35 : 25,
    learningObjectives:
      conceptObjectives.length > 0
        ? conceptObjectives
        : topic.learningObjectives.slice(0, 6).map((entry) => clamp(entry, 200)),
    practicalArtifact: {
      type: artifactSeed.type,
      title: artifactSeed.title,
      language: artifactSeed.language,
      content: artifactSeed.content,
      expectedOutput: artifactSeed.expectedOutput,
      explanation: artifactSeed.explanation,
    },
    handsOnExercise: {
      instructions: exerciseSeed.instructions.map((step) => clamp(step, 400)),
      starterContent: exerciseSeed.starterContent,
      hints: exerciseSeed.hints.map((hint) => clamp(hint, 300)),
      expectedOutcome: clamp(exerciseSeed.expectedOutcome, 600),
      solution: artifactSeed.content,
      solutionExplanation: clamp(
        `${exerciseSeed.title} succeeds when ${
          conceptList(
            topic.concepts.filter((concept) => exerciseSeed.conceptIds.includes(concept.id)),
          ) || topic.concepts[0]!.title
        } are applied correctly. ${artifactSeed.explanation}`,
        900,
      ),
    },
    sections: buildCourseraSections(topic, checks, expandedConcepts),
  };
}

/**
 * Build a deterministic Coursera-style lesson from KG topic seeds.
 * One concept map, one practical artifact, one hands-on exercise, exactly five checks.
 */
export function buildKgLesson(input: BuildKgLessonInput): KgLessonResult {
  const graph = resolveGraph(input);
  if (!graph) {
    return {
      ok: false,
      reason: "Unable to resolve knowledge graph for lesson generation.",
    };
  }

  const topic = findTopic(graph, input.topicId);
  if (!topic) {
    return {
      ok: false,
      reason: `Topic "${input.topicId}" not found in ${graph.id}.`,
    };
  }

  if (!topic.practicalArtifacts[0] || !topic.exercises[0] || topic.concepts.length === 0) {
    return {
      ok: false,
      reason: `Topic "${topic.id}" is missing concepts, practical artifact, or exercise seeds.`,
    };
  }

  const uniqueChecks: KnowledgeConcept[] = [];
  for (const concept of topic.concepts) {
    if (uniqueChecks.length >= 5) break;
    uniqueChecks.push(concept);
  }
  while (uniqueChecks.length < 5) {
    uniqueChecks.push(topic.concepts[uniqueChecks.length % topic.concepts.length]!);
  }

  const checks = uniqueChecks.map((concept, index) =>
    buildKnowledgeCheck(topic, concept, index),
  );

  const budget = wordBudget(topic.difficulty);
  let lesson = assembleLesson(topic, checks, false);
  let words = estimateWordCount(lesson);

  if (words < budget.min) {
    lesson = assembleLesson(topic, checks, true);
    words = estimateWordCount(lesson);
  }

  if (!headingsAreUnique(lesson.sections)) {
    return {
      ok: false,
      reason: "KG lesson synthesis produced repeated section headings.",
    };
  }

  const practicalTitles = lesson.sections
    .map((section) => section.heading.trim().toLowerCase())
    .filter((heading) => heading === "practical example");
  if (practicalTitles.length !== 1) {
    return {
      ok: false,
      reason: "KG lesson must contain exactly one Practical Example section.",
    };
  }

  const handsOnCount = lesson.sections.filter(
    (section) => section.heading === HANDS_ON_PRACTICE_HEADING,
  ).length;
  if (handsOnCount !== 1) {
    return {
      ok: false,
      reason: "KG lesson must contain exactly one Hands-on Practice section.",
    };
  }

  // Soft upper bound: prefer expanded=false; only accept over-budget when still under hard schema estimate.
  if (words > budget.max + 400 && lesson.sections.some((section) => section.content.length > 1800)) {
    lesson = assembleLesson(topic, checks, false);
  }

  return {
    ok: true,
    lesson,
    knowledgeGraphId: graph.id,
    canonicalTopicId: topic.id,
  };
}
