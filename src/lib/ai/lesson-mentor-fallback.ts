import type { GeneratedLesson, HandsOnPractice, LessonSection } from "@/lib/ai/lesson-schema";
import {
  containsGenericLessonPhrases,
  containsLessonMetaLanguage,
  findLessonValidationIssues,
  GENERIC_LESSON_PHRASES,
  HANDS_ON_PRACTICE_HEADING,
  LESSON_META_LANGUAGE_PATTERNS,
  type LessonFieldValidationIssue,
} from "@/lib/ai/lesson-schema";
import type { GoalCategory } from "@/lib/goals/goal-identity";
import { formatTopicTitle } from "@/lib/format/topic-title";
import { buildFallbackPracticalBlocks } from "@/lib/ai/lesson-practical-fallback";

export type SkillLevel = "beginner" | "intermediate" | "advanced";

export interface TeachingSnippet {
  title: string;
  body: string;
}

export interface MentorFallbackContext {
  goalTitle: string;
  goalCategory: GoalCategory;
  topicId: string;
  topicTitle: string;
  skillLevel: SkillLevel;
  learningObjectives?: string[];
  durationMinutes?: number;
  teachingSnippets?: TeachingSnippet[];
  takeawaySeed?: string;
  scenarioSeed?: string;
}

const MENTOR_SECTION_HEADINGS = [
  "Lesson Overview",
  "Real-World Context",
  "Core Explanation",
  HANDS_ON_PRACTICE_HEADING,
  "Practical Example",
  "Common Misconceptions",
  "Mentor Tips",
  "Key Takeaways",
] as const;

function topicLabel(context: MentorFallbackContext): string {
  return context.topicTitle || formatTopicTitle(context.topicId);
}

function conceptFocus(context: MentorFallbackContext): string[] {
  if (context.learningObjectives?.length) {
    return context.learningObjectives;
  }

  return [topicLabel(context)];
}

function levelDepth(level: SkillLevel): string {
  switch (level) {
    case "beginner":
      return "Start with definitions, one minimal example, then a slightly varied second example.";
    case "advanced":
      return "Cover edge cases, trade-offs, and the judgment calls experts make under real constraints.";
    default:
      return "Connect core mechanics to applied decisions and typical production constraints.";
  }
}

function buildKnowledgeCheck(
  topic: string,
  conceptTag: string,
  correct: string,
  distractors: [string, string, string],
): LessonSection["knowledgeCheck"][number] {
  return {
    question: `Which statement about ${topic} is correct?`,
    options: [correct, ...distractors] as [string, string, string, string],
    correctIndex: 0,
    explanation: "This answer matches the concept taught in this section.",
    conceptTag,
  };
}

function coreTeachingContent(context: MentorFallbackContext): string {
  if (context.teachingSnippets?.length) {
    return context.teachingSnippets
      .map((snippet) => `${snippet.title}\n${snippet.body}`)
      .join("\n\n");
  }

  const topic = topicLabel(context);
  const concepts = conceptFocus(context);

  return concepts
    .map((concept) => {
      return `${concept}: state the precise definition, demonstrate behavior with a concrete example, and describe the most common misapplication.`;
    })
    .join("\n\n");
}

function buildOverviewSection(context: MentorFallbackContext): Omit<LessonSection, "knowledgeCheck"> {
  const topic = topicLabel(context);
  const concepts = conceptFocus(context);

  return {
    heading: "Lesson Overview",
    content: [
      `${topic} introduces ${concepts.join("; ")}.`,
      `This section covers what each idea means, how the pieces connect, and how to apply them with a short worked example and practice task.`,
      levelDepth(context.skillLevel),
    ].join(" "),
    practicalExample: context.scenarioSeed ?? `Sketch one minimal ${topic} example on paper: inputs, operation, and expected output before running or writing anything.`,
    commonMistakes: [
      `Confusing terminology within ${topic} without checking precise definitions`,
      `Running advanced variants before the baseline ${topic} behavior is clear`,
      `Ignoring how ${concepts[0]} affects the final result`,
      `Mixing unrelated techniques that happen to appear in the same ${context.goalCategory} project`,
    ],
    summary: [
      concepts[0],
      concepts[1] ?? `${topic} behavior is predictable when inputs and steps are correct`,
      `${topic} connects theory to a verifiable example`,
    ],
  };
}

function buildRealWorldSection(context: MentorFallbackContext): Omit<LessonSection, "knowledgeCheck"> {
  const topic = topicLabel(context);
  const primary = conceptFocus(context)[0];

  return {
    heading: "Real-World Context",
    content: [
      context.scenarioSeed ??
        `${topic} appears whenever teams must implement ${primary} under real constraints—correctness, maintainability, and reviewability matter.`,
      `Production work rarely matches textbook diagrams exactly; engineers adapt ${topic} to the interfaces, tools, and failure modes present in the system.`,
    ].join(" "),
    practicalExample: `Describe a realistic situation where incorrect ${topic} behavior would cause a user-visible bug, failed deployment, or bad analytical result.`,
    commonMistakes: [
      `Applying a tutorial pattern without checking whether ${topic} fits the actual data or system shape`,
      `Optimizing performance before ${primary} is correct`,
      `Skipping error handling that ${topic} requires in production paths`,
      `Assuming defaults are safe without reading how ${topic} behaves at boundaries`,
    ],
    summary: [
      `${topic} is judged by outcomes in running systems, not by whether steps were followed from memory`,
      `${primary} must be correct before scaling or optimizing`,
      `Document assumptions when ${topic} behavior depends on context`,
    ],
  };
}

function buildCoreExplanationSection(
  context: MentorFallbackContext,
): Omit<LessonSection, "knowledgeCheck"> {
  const topic = topicLabel(context);
  const concepts = conceptFocus(context);

  return {
    heading: "Core Explanation",
    content: coreTeachingContent(context),
    practicalExample: `Walk through one ${topic} example line by line: label inputs, each transformation or decision, and the final output for ${concepts[0]}.`,
    commonMistakes: [
      `Treating ${concepts[0]} as a label instead of a mechanism with predictable behavior`,
      `Using imprecise terms interchangeably when ${topic} requires specific distinctions`,
      `Stopping at recognition without being able to produce a correct ${topic} result from scratch`,
      context.skillLevel === "advanced"
        ? `Overlooking hidden assumptions that change ${topic} behavior in edge cases`
        : `Skipping the foundational ${topic} pattern before attempting variations`,
    ],
    summary: [
      `${concepts[0]} has a precise definition and predictable behavior`,
      `${topic} is understood when you can reproduce the core workflow without prompts`,
      `Errors usually trace to a misunderstood step in ${concepts[0] ?? topic}, not random bugs`,
    ],
  };
}

function buildHandsOnPracticeFields(context: MentorFallbackContext): HandsOnPractice {
  const topic = topicLabel(context);
  const primary = conceptFocus(context)[0];
  const secondary = conceptFocus(context)[1] ?? primary;

  if (context.skillLevel === "beginner") {
    return {
      exercise: `Guided ${topic} drill: demonstrate ${primary} with a minimal, fully specified case.`,
      instructions: [
        `1. Set up the smallest valid inputs for ${primary}.`,
        `2. Apply the core ${topic} steps from the Core Explanation in order.`,
        `3. Record the output and compare it to the expected outcome below.`,
        `4. Change exactly one input and predict how the output should change before re-running.`,
      ].join("\n"),
      thinkAbout: `What defines a valid input for ${primary}? What is the smallest output that proves ${topic} worked?`,
      hints: [
        `Re-read the Core Explanation example for ${primary}.`,
        `If the result is wrong, check the step where ${topic} transforms inputs.`,
      ],
      expectedOutcome: `A correct minimal result for ${primary}, notes for each step, and a correct prediction for the one-input change.`,
      solutionExplanation: `${primary} works when each step preserves the invariants ${topic} requires. Changing one input isolates cause and effect—the same debugging move used on real ${context.goalCategory} systems.`,
    };
  }

  if (context.skillLevel === "advanced") {
    return {
      exercise: `Open ${topic} scenario: design a case where ${primary} and ${secondary} interact under a non-obvious constraint.`,
      instructions: [
        `1. Write a short scenario (4–6 sentences) with explicit constraints for ${topic}.`,
        `2. Implement ${primary} and ${secondary} without step prompts.`,
        `3. Document one trade-off you accepted and one alternative you rejected.`,
        `4. Compare your result to the expected outcome and explain any divergence.`,
      ].join("\n"),
      thinkAbout: `Which constraint forces a non-default ${topic} choice? What breaks if ${primary} is applied naively?`,
      hints: [
        `Add a boundary condition that exposes weak assumptions in ${primary}.`,
        `State invariants ${topic} must preserve before optimizing.`,
      ],
      expectedOutcome: `A complete solution, documented trade-offs, and evidence that ${primary} and ${secondary} were applied correctly under the stated constraints.`,
      solutionExplanation: `Advanced ${topic} work is about defending choices: the scenario tests whether you can apply ${primary} when constraints remove the naive path.`,
    };
  }

  return {
    exercise: `Partially guided ${topic} task: implement ${primary} with one design decision left to you.`,
    instructions: [
      `1. Identify inputs and success criteria for ${primary}.`,
      `2. Outline your ${topic} approach in 3–5 bullets, then execute it.`,
      `3. Capture an intermediate checkpoint before the final output.`,
      `4. Revise one weak step using the expected outcome as a reference.`,
    ].join("\n"),
    thinkAbout: `Where does ${primary} leave room for choice? How will you detect a partially correct ${topic} result early?`,
    hints: [
      `Anchor on ${secondary} if ${primary} feels ambiguous.`,
      `Compare checkpoint output against the Core Explanation walkthrough.`,
    ],
    expectedOutcome: `An outline, checkpoint notes, a revised final result, and one sentence on what you fixed after self-review.`,
    solutionExplanation: `${primary} succeeds when intermediate states are checkable. The checkpoint catches ${topic} mistakes before they compound—standard practice when ${secondary} is involved.`,
  };
}

function buildHandsOnPracticeSection(
  context: MentorFallbackContext,
): Omit<LessonSection, "knowledgeCheck"> {
  const topic = topicLabel(context);
  const practice = buildHandsOnPracticeFields(context);

  return {
    heading: HANDS_ON_PRACTICE_HEADING,
    content: `Apply ${topic} directly. Complete the exercise below before reading the solution explanation.`,
    practicalExample: `Do the exercise first; use the hints only if you are stuck on ${conceptFocus(context)[0]}.`,
    handsOnPractice: practice,
    commonMistakes: [
      `Reading the solution before attempting ${topic} yourself`,
      `Changing several variables at once so failures are not diagnosable`,
      `Assuming output is correct without comparing to the expected outcome`,
      `Skipping the think-about prompts and missing a constraint that changes ${topic} behavior`,
    ],
    summary: [
      `You executed ${conceptFocus(context)[0]} in a concrete ${topic} exercise`,
      `You compared your output to the expected result before reading the explanation`,
      `You can repeat the ${topic} core workflow without the lesson open`,
    ],
  };
}

function buildPracticalExampleSection(
  context: MentorFallbackContext,
): Omit<LessonSection, "knowledgeCheck"> {
  const topic = topicLabel(context);
  const primary = conceptFocus(context)[0];

  return {
    heading: "Practical Example",
    content: [
      `Worked ${topic} example for ${primary}: follow the setup, execution, and verification below.`,
      `Notice how each step names inputs, the operation applied, and the observable result.`,
    ].join(" "),
    practicalExample:
      context.scenarioSeed ??
      `Example — ${primary}: define sample inputs, apply the ${topic} procedure step by step, show the output, and note one line that would fail if ${primary} were misconfigured.`,
    commonMistakes: [
      `Copying the example without understanding which step implements ${primary}`,
      `Omitting verification that proves ${topic} output matches expectations`,
      `Using values that hide edge-case behavior in ${primary}`,
    ],
    summary: [
      `${primary} is visible in the example's inputs, operations, and output`,
      `Verification is part of the ${topic} workflow, not an optional extra`,
      `You can adapt the same ${topic} pattern to different inputs`,
    ],
  };
}

function buildMisconceptionsSection(
  context: MentorFallbackContext,
): Omit<LessonSection, "knowledgeCheck"> {
  const topic = topicLabel(context);
  const primary = conceptFocus(context)[0];

  return {
    heading: "Common Misconceptions",
    content: `These ${topic} misconceptions are common because partial models feel complete until a edge case appears.`,
    commonMistakes: [
      `Believing ${primary} and a related but different ${topic} technique are interchangeable`,
      `Assuming silent wrong output means ${primary} succeeded`,
      `Applying ${topic} syntax or steps without matching the problem's data shape or constraints`,
      `Treating exceptions or error messages in ${topic} as noise instead of diagnostic signals`,
    ],
    practicalExample: `For each misconception above, write the corrected ${topic} rule in one sentence and one counterexample that exposes the myth.`,
    summary: [
      `${primary} has a specific meaning—nearby terms are not automatic substitutes`,
      `Always check ${topic} output against expected behavior, not just successful execution`,
      `Errors in ${topic} usually indicate a wrong assumption, not random failure`,
    ],
  };
}

function buildMentorTipsSection(context: MentorFallbackContext): Omit<LessonSection, "knowledgeCheck"> {
  const topic = topicLabel(context);
  const primary = conceptFocus(context)[0];

  const tips =
    context.skillLevel === "beginner"
      ? [
          `When learning ${primary}, change one variable at a time in ${topic} examples.`,
          `Keep a tiny ${topic} reference snippet you can run in under a minute.`,
          `Read error output literally—it often names the broken ${topic} assumption.`,
        ]
      : context.skillLevel === "advanced"
        ? [
            `Document invariants ${topic} must preserve before optimizing ${primary}.`,
            `Pair every ${topic} shortcut with the failure mode it introduces.`,
            `Review diffs for ${primary} changes with the same rigor as production code.`,
          ]
        : [
            `Build a checklist for ${primary}: inputs, steps, verification, rollback.`,
            `When stuck on ${topic}, reduce to the smallest failing case.`,
            `Compare your ${primary} result to a trusted reference implementation.`,
          ];

  return {
    heading: "Mentor Tips",
    content: tips.join(" "),
    practicalExample: `Pick one tip and apply it to the ${topic} hands-on exercise immediately.`,
    commonMistakes: [
      `Collecting ${topic} tips without attaching each to a repeatable ${primary} behavior`,
      `Optimizing ${topic} before ${primary} is correct`,
      `Ignoring tooling feedback that flags invalid ${topic} usage`,
    ],
    summary: tips,
  };
}

function buildKeyTakeawaysSection(context: MentorFallbackContext): Omit<LessonSection, "knowledgeCheck"> {
  const topic = topicLabel(context);
  const concepts = conceptFocus(context);
  const seeded = context.takeawaySeed;

  const takeaways = [
    seeded ?? `${concepts[0]} in ${topic} has a precise definition and observable behavior`,
    concepts[1] ?? `${topic} requires verification, not just execution`,
    `You can reproduce the core ${topic} workflow for ${concepts[0]}`,
    `Common ${topic} mistakes around ${concepts[0]} are recognizable and avoidable`,
    `The hands-on ${topic} exercise demonstrates ${concepts[0]} in a checkable way`,
  ].slice(0, 5);

  return {
    heading: "Key Takeaways",
    content: `You should now be able to explain ${concepts.join(", ")} in ${topic} and apply ${concepts[0]} in a small example.`,
    practicalExample: `Without looking at notes, reproduce the ${topic} hands-on exercise and state why the solution works.`,
    commonMistakes: [
      `Remembering ${topic} vocabulary but unable to produce ${concepts[0]} correctly`,
      `Skipping the worked example when ${primaryConcept(concepts)} behavior feels familiar`,
      `Moving on while ${concepts[0]} still fails on a minimal test case`,
    ],
    summary: takeaways,
  };
}

function primaryConcept(concepts: string[]): string {
  return concepts[0] ?? "the core concept";
}

const VALIDATION_REPLACEMENTS: Array<[RegExp, string]> = [
  [/your roadmap/gi, "consistent practice"],
  [/learning journey/gi, "technical progression"],
  [/your learning goal/gi, "the core skill"],
  [/today you will work through/gi, "This section covers"],
  [/by the end of this session/gi, "After working through this material"],
  [/session focus:/gi, "Focus:"],
  [/topic check-in/gi, "concept review"],
  [/passive reading/gi, "surface-level reading"],
  [/explain key ideas/gi, "explain core mechanics"],
  [/practitioner workflow/gi, "standard workflow"],
  [/learn .+ in \d+ weeks/gi, "build proficiency"],
  [/milestone in your/gi, "step in"],
  [/objectives as a checklist/gi, "objectives as reference points"],
  [/write a three-sentence summary/gi, "summarize the mechanism"],
  [/teach .+ back to an imaginary colleague/gi, "explain the mechanism aloud"],
  [/this exercise is scoped for/gi, "this exercise targets"],
  [/pursuing .+ as part of/gi, "working with"],
  [/working toward your goal/gi, "building this skill"],
  [/aligned with your goal/gi, "aligned with the topic"],
  [/use the lesson objectives/gi, "use the technical objectives"],
  [/imagine you are explaining/gi, "When demonstrating"],
  [/trying to memorize/gi, "memorizing without context"],
  [/anchor your study/gi, "ground your practice"],
  [/anchor your learning/gi, "ground your practice"],
  [/pick one milestone from your roadmap/gi, "pick one concrete technique"],
  [/studying in isolation/gi, "practicing without feedback"],
  [/treat it as unrelated background reading/gi, "treat it as unrelated reference material"],
  [/what is the best first step when learning/gi, "what is the best first step when applying"],
  [/how should .+ connect to your learning plan/gi, "how should this connect to the next concept"],
  [/skipping hands-on practice/gi, "skipping applied practice"],
  [/skipping practice because/gi, "skipping practice because"],
  [/this topic matters(?!\s+(?:because|when|for|in))/gi, "this concept matters"],
  [/memorize every detail without context/gi, "memorize details without understanding behavior"],
  [/jump directly to the hardest advanced scenario/gi, "jump directly to the hardest scenario"],
];

function sanitizeValidatedText(text: string): string {
  let sanitized = text;

  for (const [pattern, replacement] of VALIDATION_REPLACEMENTS) {
    sanitized = sanitized.replace(pattern, replacement);
  }

  for (const pattern of [...GENERIC_LESSON_PHRASES, ...LESSON_META_LANGUAGE_PATTERNS]) {
    sanitized = sanitized.replace(pattern, " ");
  }

  return sanitized.replace(/\s{2,}/g, " ").trim();
}

function sanitizeTeachingSnippet(snippet: TeachingSnippet): TeachingSnippet {
  return {
    title: sanitizeValidatedText(snippet.title),
    body: sanitizeValidatedText(snippet.body),
  };
}

function sanitizeMentorContext(context: MentorFallbackContext): MentorFallbackContext {
  return {
    ...context,
    teachingSnippets: context.teachingSnippets?.map(sanitizeTeachingSnippet),
    takeawaySeed: context.takeawaySeed ? sanitizeValidatedText(context.takeawaySeed) : undefined,
    scenarioSeed: context.scenarioSeed ? sanitizeValidatedText(context.scenarioSeed) : undefined,
  };
}

function attachKnowledgeChecks(
  sections: Omit<LessonSection, "knowledgeCheck">[],
  topic: string,
): LessonSection[] {
  const checkIndices = [0, 1, 2, 3, 4];
  let checkCursor = 0;

  return sections.map((section, sectionIndex) => {
    const checks: LessonSection["knowledgeCheck"] = [];

    if (checkIndices.includes(sectionIndex) && checkCursor < 5) {
      checks.push(
        buildKnowledgeCheck(
          topic,
          `mentor-s${sectionIndex + 1}-kc1`,
          section.summary[0],
          [
            section.commonMistakes[0],
            `Ignore definitions and guess ${topic} behavior`,
            `Apply unrelated techniques instead of ${topic}`,
          ],
        ),
      );
      checkCursor += 1;
    }

    return { ...section, knowledgeCheck: checks };
  });
}

function repairScalarField(text: string, minLength = 1): string {
  const repaired = sanitizeValidatedText(text);

  if (repaired.length >= minLength) {
    return repaired;
  }

  const fallbackSentences = text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sanitizeValidatedText(sentence))
    .filter(
      (sentence) =>
        sentence.length > 0 &&
        !containsGenericLessonPhrases(sentence) &&
        !containsLessonMetaLanguage(sentence),
    );

  if (fallbackSentences.length > 0) {
    return fallbackSentences.join(" ");
  }

  return repaired.length > 0 ? repaired : text.slice(0, Math.max(minLength, text.length));
}

function repairHandsOnPractice(practice: HandsOnPractice): HandsOnPractice {
  return {
    exercise: repairScalarField(practice.exercise),
    instructions: repairScalarField(practice.instructions),
    thinkAbout: repairScalarField(practice.thinkAbout),
    hints: practice.hints?.map((hint) => repairScalarField(hint)),
    expectedOutcome: repairScalarField(practice.expectedOutcome),
    solutionExplanation: repairScalarField(practice.solutionExplanation),
  };
}

function repairLessonSection(section: LessonSection, context: MentorFallbackContext): LessonSection {
  const repaired: LessonSection = {
    ...section,
    content: repairScalarField(section.content, 80),
    practicalExample: repairScalarField(section.practicalExample),
    commonMistakes: section.commonMistakes.map((mistake) => repairScalarField(mistake)),
    summary: section.summary.map((takeaway) => repairScalarField(takeaway)),
    knowledgeCheck: section.knowledgeCheck.map((check) => ({
      ...check,
      question: repairScalarField(check.question),
      options: check.options.map((option) => repairScalarField(option)) as [
        string,
        string,
        string,
        string,
      ],
      explanation: repairScalarField(check.explanation),
    })),
  };

  if (section.handsOnPractice) {
    repaired.handsOnPractice = repairHandsOnPractice(section.handsOnPractice);
  }

  if (repaired.content.length < 80) {
    const rebuilt = rebuildSectionByHeading(section.heading, context);
    return {
      ...rebuilt,
      knowledgeCheck: repaired.knowledgeCheck,
    };
  }

  return repaired;
}

function rebuildSectionByHeading(
  heading: string,
  context: MentorFallbackContext,
): Omit<LessonSection, "knowledgeCheck"> {
  switch (heading) {
    case "Lesson Overview":
      return buildOverviewSection(context);
    case "Real-World Context":
      return buildRealWorldSection(context);
    case "Core Explanation":
      return buildCoreExplanationSection(context);
    case HANDS_ON_PRACTICE_HEADING:
      return buildHandsOnPracticeSection(context);
    case "Practical Example":
      return buildPracticalExampleSection(context);
    case "Common Misconceptions":
      return buildMisconceptionsSection(context);
    case "Mentor Tips":
      return buildMentorTipsSection(context);
    case "Key Takeaways":
      return buildKeyTakeawaysSection(context);
    default:
      return buildOverviewSection(context);
  }
}

function logFallbackValidationDiagnostics(
  issues: LessonFieldValidationIssue[],
  stage: "initial" | "post-repair",
): void {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  for (const issue of issues) {
    for (const violation of issue.violations) {
      console.warn("[MentorFallback] Validation issue", {
        stage,
        sectionIndex: issue.sectionIndex,
        sectionHeading: issue.sectionHeading,
        field: issue.field,
        kind: violation.kind,
        pattern: violation.pattern,
        matchedPhrase: violation.match,
      });
    }
  }
}

function repairLessonSections(
  sections: LessonSection[],
  issues: LessonFieldValidationIssue[],
  context: MentorFallbackContext,
): LessonSection[] {
  const indexesToRepair = new Set(issues.map((issue) => issue.sectionIndex));

  return sections.map((section, sectionIndex) => {
    if (!indexesToRepair.has(sectionIndex)) {
      return section;
    }

    return repairLessonSection(section, context);
  });
}

function buildEmergencyTechnicalLesson(
  context: MentorFallbackContext,
  topicId: string,
): GeneratedLesson {
  const topic = topicLabel(context);
  const concepts = conceptFocus(context);
  const primary = concepts[0];
  const secondary = concepts[1] ?? primary;
  const levelNote =
    context.skillLevel === "beginner"
      ? "Start with definitions and one minimal runnable example."
      : context.skillLevel === "advanced"
        ? "Include edge cases, trade-offs, and failure modes."
        : "Connect core mechanics to applied decisions.";

  const technicalExplanation = concepts
    .map(
      (concept) =>
        `${concept}: define the mechanism, show one concrete input/output pair, and name the most common misapplication in ${topic}.`,
    )
    .join(" ");

  const rawSections: Omit<LessonSection, "knowledgeCheck">[] = [
    {
      heading: "Lesson Overview",
      content: `${topic} covers ${concepts.join(", ")}. ${levelNote} Work through the explanation, example, and checks below to verify understanding of ${primary}.`,
      practicalExample: `Write one minimal ${topic} example for ${primary}: inputs, operation, and expected output.`,
      commonMistakes: [
        `Using the wrong type or shape for ${primary} in ${topic}`,
        `Confusing ${primary} with a related but different ${topic} construct`,
        `Assuming output is correct without verifying ${primary} behavior`,
      ],
      summary: [primary, secondary, `${topic} behavior is predictable with correct inputs`],
    },
    {
      heading: "Real-World Context",
      content: `${topic} shows up whenever ${primary} must be implemented correctly under real constraints—correctness, maintainability, and debuggability.`,
      practicalExample: `Describe a bug caused by mishandling ${primary} in ${topic} and how you would detect it quickly.`,
      commonMistakes: [
        `Copying a tutorial pattern without validating ${primary} against real inputs`,
        `Optimizing before ${primary} is correct`,
        `Ignoring error signals that indicate invalid ${topic} usage`,
      ],
      summary: [
        `${primary} must be correct before scaling ${topic}`,
        `Verification beats assumption for ${topic} output`,
        `Document constraints that change ${primary} behavior`,
      ],
    },
    {
      heading: "Core Explanation",
      content: technicalExplanation,
      practicalExample: `Walk through ${primary} in ${topic}: label each input, transformation, and final result.`,
      commonMistakes: [
        `Treating ${primary} as vocabulary instead of a mechanism`,
        `Skipping verification of ${topic} output`,
        `Applying ${secondary} before ${primary} is stable`,
      ],
      summary: [
        `${primary} has a precise definition in ${topic}`,
        `You can reproduce the ${topic} workflow for ${primary}`,
        `Most errors trace to a misunderstood step in ${primary}`,
      ],
    },
    {
      heading: HANDS_ON_PRACTICE_HEADING,
      content: `Apply ${primary} in ${topic}. Complete the exercise, then compare your result to the expected outcome.`,
      practicalExample: `Attempt the exercise before reading the solution explanation for ${primary}.`,
      handsOnPractice: {
        exercise: `Implement ${primary} in a minimal ${topic} example.`,
        instructions: [
          `1. Define the smallest valid inputs for ${primary}.`,
          `2. Execute the ${topic} steps in order.`,
          `3. Record the output and compare it to the expected outcome.`,
        ].join("\n"),
        thinkAbout: `What proves ${primary} worked in ${topic}? What input would expose a wrong assumption?`,
        hints: [`Re-read the Core Explanation example for ${primary}.`],
        expectedOutcome: `A correct result for ${primary} with notes for each step.`,
        solutionExplanation: `${primary} succeeds when each ${topic} step preserves required invariants and the output matches expectations.`,
      },
      commonMistakes: [
        `Reading the solution before attempting ${primary}`,
        `Changing multiple inputs at once in ${topic}`,
        `Skipping comparison against the expected outcome`,
      ],
      summary: [
        `You applied ${primary} in ${topic}`,
        `You verified output before reading the solution`,
        `You can repeat the ${topic} workflow independently`,
      ],
    },
    {
      heading: "Practical Example",
      content: `Worked ${topic} example for ${primary}: follow the setup, execution, and verification steps.`,
      practicalExample: `Example — ${primary}: sample inputs, step-by-step ${topic} execution, final output, and one line that would fail if ${primary} were wrong.`,
      commonMistakes: [
        `Copying without knowing which step implements ${primary}`,
        `Omitting verification of ${topic} output`,
        `Using inputs that hide ${primary} edge cases`,
      ],
      summary: [
        `${primary} appears in inputs, operations, and output`,
        `Verification is part of ${topic}, not optional`,
        `The same ${topic} pattern works with different inputs`,
      ],
    },
    {
      heading: "Common Misconceptions",
      content: `These ${topic} misconceptions persist until ${primary} is tested on a minimal counterexample.`,
      commonMistakes: [
        `Believing ${primary} and a nearby ${topic} technique are interchangeable`,
        `Assuming successful execution means ${primary} is correct`,
        `Ignoring ${topic} errors instead of treating them as diagnostic signals`,
      ],
      practicalExample: `For each misconception, write the corrected ${topic} rule and one counterexample involving ${primary}.`,
      summary: [
        `${primary} is specific—not every similar ${topic} term means the same thing`,
        `Check ${topic} output against expectations`,
        `${topic} errors usually indicate a wrong assumption about ${primary}`,
      ],
    },
    {
      heading: "Mentor Tips",
      content: [
        `Change one variable at a time when debugging ${primary} in ${topic}.`,
        `Keep a minimal ${topic} reference snippet for ${primary}.`,
        `Read ${topic} error output literally—it often names the broken assumption.`,
      ].join(" "),
      practicalExample: `Apply one tip to the ${topic} hands-on exercise for ${primary} immediately.`,
      commonMistakes: [
        `Collecting ${topic} tips without tying each to ${primary}`,
        `Optimizing ${topic} before ${primary} is correct`,
        `Ignoring tooling feedback about invalid ${topic} usage`,
      ],
      summary: [
        `Debug ${primary} by changing one variable at a time`,
        `Keep a runnable ${topic} reference for ${primary}`,
        `Treat ${topic} errors as diagnostic signals`,
      ],
    },
    {
      heading: "Key Takeaways",
      content: `You should now explain ${concepts.join(", ")} in ${topic} and apply ${primary} in a small verified example.`,
      practicalExample: `Reproduce the ${topic} exercise for ${primary} without notes and explain why the result is correct.`,
      commonMistakes: [
        `Remembering ${topic} terms but unable to produce ${primary} correctly`,
        `Skipping the worked example when ${primary} feels familiar`,
        `Moving on while ${primary} still fails on a minimal test`,
      ],
      summary: [
        `${primary} in ${topic} has precise, observable behavior`,
        `${secondary} connects to ${primary} in real ${topic} workflows`,
        `You can apply and verify ${primary} independently`,
      ],
    },
  ];

  const sections = attachKnowledgeChecks(rawSections, topic);
  const practicalBlocks = buildFallbackPracticalBlocks(context);

  return {
    topicId,
    source: "deterministic",
    title: topic,
    estimatedMinutes: context.durationMinutes ?? 45,
    learningObjectives: context.learningObjectives?.length
      ? context.learningObjectives.slice(0, 6)
      : [`Understand ${topic}`, `Apply ${primary}`, `Avoid common ${topic} mistakes`],
    practicalArtifact: practicalBlocks.practicalArtifact,
    handsOnExercise: practicalBlocks.handsOnExercise,
    sections,
  };
}

function assembleDeterministicLesson(
  context: MentorFallbackContext,
  topicId: string,
): GeneratedLesson {
  const topic = topicLabel(context);
  const concepts = conceptFocus(context);
  const sectionBuilders = [
    buildOverviewSection,
    buildRealWorldSection,
    buildCoreExplanationSection,
    buildHandsOnPracticeSection,
    buildPracticalExampleSection,
    buildMisconceptionsSection,
    buildMentorTipsSection,
    buildKeyTakeawaysSection,
  ];

  const rawSections = sectionBuilders.map((builder) => builder(context));
  const sections = attachKnowledgeChecks(rawSections, topic);
  const practicalBlocks = buildFallbackPracticalBlocks(context);

  return {
    topicId,
    source: "deterministic",
    title: topic,
    estimatedMinutes: context.durationMinutes ?? 45,
    learningObjectives: context.learningObjectives?.length
      ? context.learningObjectives.slice(0, 6)
      : [`Understand ${topic}`, `Apply ${concepts[0]}`, `Avoid common ${topic} mistakes`],
    practicalArtifact: practicalBlocks.practicalArtifact,
    handsOnExercise: practicalBlocks.handsOnExercise,
    sections,
  };
}

export function buildDeterministicMentorLesson(
  context: MentorFallbackContext,
  topicId: string,
): GeneratedLesson {
  const sanitizedContext = sanitizeMentorContext(context);
  let lesson = assembleDeterministicLesson(sanitizedContext, topicId);

  let issues = findLessonValidationIssues(lesson.sections);

  if (issues.length > 0) {
    logFallbackValidationDiagnostics(issues, "initial");
    lesson = {
      ...lesson,
      sections: repairLessonSections(lesson.sections, issues, sanitizedContext),
    };
    issues = findLessonValidationIssues(lesson.sections);
  }

  if (issues.length > 0) {
    logFallbackValidationDiagnostics(issues, "post-repair");
    lesson = buildEmergencyTechnicalLesson(sanitizedContext, topicId);
  }

  return lesson;
}

export function mentorSectionHeadings(): readonly string[] {
  return MENTOR_SECTION_HEADINGS;
}
