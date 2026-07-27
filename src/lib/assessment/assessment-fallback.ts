import { slugifyTitle } from "@/lib/ai/slug-id";
import { containsAwsSpecificTopic } from "@/lib/ai/roadmap-schema";
import { formatTopicTitle } from "@/lib/format/topic-title";
import type { GoalCategory } from "@/lib/goals/goal-identity";
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
  }>;
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
}

function buildQuestionId(topicId: string, conceptTag: string, index: number): string {
  return `assessment-${topicId}-${conceptTag}-${index + 1}`;
}

function isJavaTopic(input: DeterministicAssessmentInput): boolean {
  const label = `${input.topicId} ${input.topicTitle} ${input.goalSlug}`.toLowerCase();
  return label.includes("java");
}

function isPythonTopic(input: DeterministicAssessmentInput): boolean {
  const label = `${input.topicId} ${input.topicTitle} ${input.goalSlug}`.toLowerCase();
  return label.includes("python");
}

function javaSyntaxQuestionSeeds(): TopicQuestionSeed[] {
  return [
    {
      conceptTag: "variable-declaration",
      prompt: "Which declaration correctly creates an integer variable in Java?",
      options: ["int count = 10;", "integer count = 10;", "int count := 10;", "var count = int(10);"],
      correctIndex: 0,
      explanation: "Java uses type-first syntax: int count = 10;",
    },
    {
      conceptTag: "primitive-types",
      prompt: "Which of the following is a Java primitive data type?",
      options: ["int", "String", "Integer", "ArrayList"],
      correctIndex: 0,
      explanation: "int is a primitive type; String and wrapper classes are reference types.",
    },
    {
      conceptTag: "assignment",
      prompt: "What happens when you execute `int x = 5; x = x + 2;`?",
      options: [
        "x becomes 7",
        "x remains 5",
        "The code fails to compile",
        "x becomes 52 as string concatenation",
      ],
      correctIndex: 0,
      explanation: "The assignment updates x to the evaluated sum of 5 and 2.",
    },
    {
      conceptTag: "naming-rules",
      prompt: "Which variable name follows Java naming conventions?",
      options: ["studentCount", "Student Count", "2students", "class"],
      correctIndex: 0,
      explanation: "Java variables use camelCase and cannot start with a digit or use spaces.",
    },
    {
      conceptTag: "type-compatibility",
      prompt: "Which assignment is valid without an explicit cast in Java?",
      options: [
        "double rate = 5;",
        "int count = 3.14;",
        "boolean flag = 1;",
        "char letter = \"A\";",
      ],
      correctIndex: 0,
      explanation: "int literals widen safely to double; the other assignments require incompatible types.",
    },
  ];
}

function pythonSyntaxQuestionSeeds(): TopicQuestionSeed[] {
  return [
    {
      conceptTag: "variable-declaration",
      prompt: "Which statement correctly assigns the integer 10 to a variable in Python?",
      options: ["count = 10", "int count = 10", "count := int(10)", "var count = 10"],
      correctIndex: 0,
      explanation: "Python uses dynamic typing with simple assignment: count = 10.",
    },
    {
      conceptTag: "primitive-types",
      prompt: "Which value has the built-in type int in Python?",
      options: ["42", "3.14", "\"hello\"", "[1, 2]"],
      correctIndex: 0,
      explanation: "42 is an integer literal; the others are float, str, and list respectively.",
    },
    {
      conceptTag: "assignment",
      prompt: "After `total = 4; total += 3`, what is the value of total?",
      options: ["7", "43", "1", "None"],
      correctIndex: 0,
      explanation: "+= adds 3 to the current numeric value of total.",
    },
    {
      conceptTag: "naming-rules",
      prompt: "Which Python variable name is valid?",
      options: ["student_count", "2students", "class", "student-count"],
      correctIndex: 0,
      explanation: "Python identifiers cannot start with digits or contain hyphens.",
    },
    {
      conceptTag: "type-compatibility",
      prompt: "What is the result type of `5 / 2` in Python 3?",
      options: ["float", "int", "str", "bool"],
      correctIndex: 0,
      explanation: "Division in Python 3 returns a float even when operands are integers.",
    },
  ];
}

function seedToQuestion(
  input: DeterministicAssessmentInput,
  seed: TopicQuestionSeed,
  index: number,
): AssessmentQuestion {
  return assessmentQuestionSchema.parse({
    id: buildQuestionId(input.topicId, seed.conceptTag, (input.startIndex ?? 0) + index),
    topicId: input.topicId,
    conceptTag: seed.conceptTag,
    prompt: seed.prompt,
    options: seed.options,
    correctIndex: seed.correctIndex,
    explanation: seed.explanation,
  });
}

function buildObjectiveQuestion(
  input: DeterministicAssessmentInput,
  objective: string,
  sectionHeading: string,
  summary: string,
  index: number,
): AssessmentQuestion {
  const conceptTag = slugifyTitle(objective).slice(0, 64) || slugifyTitle(sectionHeading).slice(0, 64);
  const topicLabel = input.topicTitle || formatTopicTitle(input.topicId);
  const safeSummary = sanitizeSummary(summary, input.goalCategory, input.goalSlug, topicLabel);
  const safeHeading =
    input.goalSlug !== "aws-saa-c03" && containsAwsSpecificTopic(sectionHeading)
      ? topicLabel
      : sectionHeading;

  const prompt = `In ${topicLabel}, which statement best reflects: "${objective}"?`;

  const candidate = {
    id: buildQuestionId(input.topicId, conceptTag, (input.startIndex ?? 0) + index),
    topicId: input.topicId,
    conceptTag,
    prompt,
    options: [
      safeSummary,
      `Using the wrong syntax for ${safeHeading.toLowerCase()} in this context`,
      `Applying an operator that does not match the ${topicLabel} data type here`,
      `Confusing ${safeHeading.toLowerCase()} with an unrelated concept from another topic`,
    ] as [string, string, string, string],
    correctIndex: 0,
    explanation: `This answer aligns with the lesson objective for ${safeHeading}.`,
  };

  return assessmentQuestionSchema.parse(candidate);
}

function sanitizeSummary(
  summary: string,
  goalCategory: GoalCategory,
  goalSlug: string,
  topicLabel: string,
): string {
  if (goalSlug !== "aws-saa-c03" && containsAwsSpecificTopic(summary)) {
    return `This concept supports your ${topicLabel} learning objective.`;
  }

  if (goalCategory === "Programming" && /\b(azure|aws ec2)\b/i.test(summary)) {
    return `This concept supports your ${topicLabel} learning objective.`;
  }

  return summary;
}

function resolveTopicQuestionSeeds(input: DeterministicAssessmentInput): TopicQuestionSeed[] {
  if (isJavaTopic(input)) {
    return javaSyntaxQuestionSeeds();
  }

  if (isPythonTopic(input)) {
    return pythonSyntaxQuestionSeeds();
  }

  return [];
}

export function buildDeterministicAssessmentQuestions(
  input: DeterministicAssessmentInput,
): AssessmentQuestion[] {
  const requestedCount = input.count ?? TARGET_ASSESSMENT_QUESTIONS;
  const count = Math.min(Math.max(requestedCount, 1), TARGET_ASSESSMENT_QUESTIONS);
  const excluded = new Set(input.excludeConceptTags ?? []);
  const questions: AssessmentQuestion[] = [];

  const topicSeeds = resolveTopicQuestionSeeds(input).filter(
    (seed) => !excluded.has(seed.conceptTag),
  );

  for (const seed of topicSeeds) {
    if (questions.length >= count) {
      break;
    }

    questions.push(seedToQuestion(input, seed, questions.length));
  }

  const objectiveSeeds = input.learningObjectives.flatMap((objective, objectiveIndex) => {
    const section = input.sections[objectiveIndex] ?? input.sections[0];

    if (!section) {
      return [];
    }

    return [
      {
        objective,
        sectionHeading: section.heading,
        summary: section.summary[0] ?? section.content.slice(0, 120),
      },
    ];
  });

  if (objectiveSeeds.length === 0 && input.sections[0]) {
    objectiveSeeds.push({
      objective: input.learningObjectives[0] ?? `Understand ${input.topicTitle}`,
      sectionHeading: input.sections[0].heading,
      summary: input.sections[0].summary[0] ?? input.sections[0].content.slice(0, 120),
    });
  }

  let index = questions.length;

  while (questions.length < count) {
    const seed = objectiveSeeds[index % objectiveSeeds.length]!;
    const conceptTag = slugifyTitle(seed.objective).slice(0, 64);

    if (!excluded.has(conceptTag)) {
      questions.push(
        buildObjectiveQuestion(input, seed.objective, seed.sectionHeading, seed.summary, questions.length),
      );
    }

    index += 1;

    if (index > count * objectiveSeeds.length + 10) {
      break;
    }
  }

  while (questions.length < count) {
    const fallbackSeed = objectiveSeeds[questions.length % objectiveSeeds.length]!;
    questions.push(
      buildObjectiveQuestion(
        input,
        fallbackSeed.objective,
        fallbackSeed.sectionHeading,
        fallbackSeed.summary,
        questions.length,
      ),
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
