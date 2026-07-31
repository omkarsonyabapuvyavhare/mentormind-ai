import type {
  HandsOnExercise,
  PracticalArtifact,
  PracticalArtifactType,
} from "@/lib/ai/lesson-schema";
import type { MentorFallbackContext } from "@/lib/ai/lesson-mentor-fallback";
import { deriveTopicTeachingConcepts } from "@/lib/ai/lesson-topic-concepts";
import { formatTopicTitle } from "@/lib/format/topic-title";

const TYPE_SIGNALS: Record<PracticalArtifactType, RegExp[]> = {
  code: [
    /\b(code|program|python|javascript|typescript|java|function|variable|syntax|class|method|api|print)\b/i,
  ],
  query: [/\b(sql|query|select|join|database|table|schema|relational|row|column)\b/i],
  command: [/\b(docker|kubectl|cli|terminal|command|bash|shell|deploy|build)\b/i],
  configuration: [
    /\b(yaml|json|config|manifest|deployment|policy|dockerfile|terraform|cloudformation|networking|service)\b/i,
  ],
  diagram: [/\b(architecture|network|topology|flow|diagram|vpc|subnet)\b/i],
  calculation: [/\b(calculate|formula|equation|metric|statistics|probability|cost)\b/i],
  workflow: [/\b(process|workflow|procedure|pipeline|incident|security|audit)\b/i],
  "case-study": [/\b(case|scenario|decision|analysis|stakeholder|compliance|business)\b/i],
};

const LANGUAGE_SIGNALS: Array<[RegExp, string]> = [
  [/\bpython\b/i, "python"],
  [/\bjavascript\b|\breact\b|\bnode\b/i, "javascript"],
  [/\btypescript\b/i, "typescript"],
  [/\bsql\b/i, "sql"],
  [/\byaml\b|\bkubernetes\b|\bk8s\b/i, "yaml"],
  [/\bdocker\b|\bdockerfile\b/i, "dockerfile"],
  [/\bbash\b|\bshell\b/i, "bash"],
];

function topicLabel(context: MentorFallbackContext): string {
  return context.topicTitle || formatTopicTitle(context.topicId);
}

function conceptFocus(context: MentorFallbackContext): string[] {
  return deriveTopicTeachingConcepts({
    topicTitle: topicLabel(context),
    topicId: context.topicId,
    goalTitle: context.goalTitle,
    goalCategory: context.goalCategory,
  });
}

function contextCorpus(context: MentorFallbackContext): string {
  return [
    context.goalTitle,
    context.goalCategory,
    context.topicTitle,
    context.topicId,
    ...(context.learningObjectives ?? []),
    ...(context.teachingSnippets?.map((snippet) => `${snippet.title} ${snippet.body}`) ?? []),
  ].join(" ");
}

export function inferPracticalArtifactType(context: MentorFallbackContext): PracticalArtifactType {
  const corpus = contextCorpus(context);
  const scores = Object.entries(TYPE_SIGNALS).map(([type, patterns]) => ({
    type: type as PracticalArtifactType,
    score: patterns.reduce((total, pattern) => total + (pattern.test(corpus) ? 1 : 0), 0),
  }));

  scores.sort((a, b) => b.score - a.score);

  if (scores[0]?.score > 0) {
    return scores[0].type;
  }

  if (context.goalCategory === "Business" || context.goalCategory === "Design") {
    return "case-study";
  }

  return context.goalCategory === "Programming" ? "code" : "workflow";
}

export function inferPracticalArtifactLanguage(context: MentorFallbackContext): string | undefined {
  const corpus = contextCorpus(context);

  for (const [pattern, language] of LANGUAGE_SIGNALS) {
    if (pattern.test(corpus)) {
      return language;
    }
  }

  return undefined;
}

function buildCodeArtifact(context: MentorFallbackContext): PracticalArtifact {
  const topic = topicLabel(context);
  const concepts = conceptFocus(context);
  const language = inferPracticalArtifactLanguage(context) ?? "python";
  const primary = concepts[0] ?? topic;

  const content =
    language === "python"
      ? `# ${topic}\nname = "Alex"\nage = 25\nprice = 99.5\nis_active = True\n\nprint(type(name))\nprint(type(age))\nprint(type(price))\nprint(type(is_active))`
      : `// ${topic}\nconst label = "example";\nconst count = 3;\nconst ratio = 0.75;\nconst enabled = true;\n\nconsole.log(typeof label, typeof count, typeof ratio, typeof enabled);`;

  return {
    type: "code",
    title: `${primary} — runnable example`,
    language,
    content,
    expectedOutput:
      language === "python"
        ? "<class 'str'>\n<class 'int'>\n<class 'float'>\n<class 'bool'>"
        : "string number number boolean",
    explanation: `Each variable binds a value with a specific type. Running the snippet shows how ${primary} maps to concrete values and how type inspection confirms the underlying data type.`,
  };
}

function buildQueryArtifact(context: MentorFallbackContext): PracticalArtifact {
  const topic = topicLabel(context);
  const primary = conceptFocus(context)[0] ?? topic;

  return {
    type: "query",
    title: `${primary} — sample schema and query`,
    language: "sql",
    content: `-- Sample tables for ${topic}\nCREATE TABLE customers (\n  id INT PRIMARY KEY,\n  name VARCHAR(80)\n);\n\nCREATE TABLE orders (\n  id INT PRIMARY KEY,\n  customer_id INT,\n  amount DECIMAL(10,2)\n);\n\nSELECT c.name, o.amount\nFROM customers c\nINNER JOIN orders o ON c.id = o.customer_id;`,
    expectedOutput: "name | amount\nAlice | 120.00\nBob | 45.50",
    explanation: `The schema defines the data shape for ${primary}. The query joins customers to orders and returns paired rows, which is the expected result set for a correct ${topic} operation.`,
  };
}

function buildCommandArtifact(context: MentorFallbackContext): PracticalArtifact {
  const topic = topicLabel(context);
  const primary = conceptFocus(context)[0] ?? topic;

  return {
    type: "command",
    title: `${primary} — command sequence`,
    language: "bash",
    content: `# ${topic}\nkubectl apply -f deployment.yaml\nkubectl rollout status deployment/sample-app\nkubectl get pods -l app=sample-app`,
    expectedOutput: "deployment.apps/sample-app created\nWaiting for deployment \"sample-app\" rollout to finish...\nNAME READY STATUS RESTARTS AGE\nsample-app-abc123 1/1 Running 0 10s",
    explanation: `Apply the manifest, wait for rollout completion, then verify pod readiness. This sequence confirms that ${primary} was applied and the workload reached a healthy running state.`,
  };
}

function buildConfigurationArtifact(context: MentorFallbackContext): PracticalArtifact {
  const topic = topicLabel(context);
  const primary = conceptFocus(context)[0] ?? topic;

  return {
    type: "configuration",
    title: `${primary} — configuration manifest`,
    language: "yaml",
    content: `apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: sample-app\nspec:\n  replicas: 2\n  selector:\n    matchLabels:\n      app: sample-app\n  template:\n    metadata:\n      labels:\n        app: sample-app\n    spec:\n      containers:\n        - name: app\n          image: sample:1.0\n          ports:\n            - containerPort: 8080`,
    expectedOutput: "deployment.apps/sample-app configured with 2 replicas exposing port 8080",
    explanation: `This manifest declares how ${primary} should run: replica count, labels, container image, and exposed port. Each field maps directly to runtime behavior in ${topic}.`,
  };
}

function buildWorkflowArtifact(context: MentorFallbackContext): PracticalArtifact {
  const topic = topicLabel(context);
  const primary = conceptFocus(context)[0] ?? topic;

  return {
    type: "workflow",
    title: `${primary} — worked procedure`,
    content: `1. Define inputs and success criteria for ${primary}.\n2. Execute the core ${topic} steps in order.\n3. Capture an intermediate checkpoint output.\n4. Compare the final result to the expected outcome.\n5. Document the decision or correction applied at the failing step.`,
    explanation: `This procedure turns ${primary} into verifiable checkpoints instead of prose-only study. Each step produces observable evidence that ${topic} was applied correctly.`,
  };
}

function buildCalculationArtifact(context: MentorFallbackContext): PracticalArtifact {
  const topic = topicLabel(context);
  const primary = conceptFocus(context)[0] ?? topic;

  return {
    type: "calculation",
    title: `${primary} — worked calculation`,
    content: `Given:\n- baseline = 120\n- adjustment = 0.15\n- samples = 4\n\nresult = baseline * (1 + adjustment) / samples\nresult = 120 * 1.15 / 4\nresult = 34.5`,
    expectedOutput: "34.5",
    explanation: `The calculation applies ${primary} with explicit intermediate values so each transformation can be audited. The final value is the expected numeric outcome for this ${topic} scenario.`,
  };
}

function buildDiagramArtifact(context: MentorFallbackContext): PracticalArtifact {
  const topic = topicLabel(context);
  const primary = conceptFocus(context)[0] ?? topic;

  return {
    type: "diagram",
    title: `${primary} — structure flow`,
    content: `Client -> Gateway -> Service -> Data Store\n           |\n           -> Auth Check\n           -> Validation\n           -> ${primary}`,
    explanation: `The flow shows where ${primary} sits in ${topic}. Follow the arrows to see control/data movement and where verification should happen.`,
  };
}

function buildCaseStudyArtifact(context: MentorFallbackContext): PracticalArtifact {
  const topic = topicLabel(context);
  const primary = conceptFocus(context)[0] ?? topic;

  return {
    type: "case-study",
    title: `${primary} — decision scenario`,
    content: `Scenario: A team must apply ${primary} in ${topic} under a latency constraint and partial data.\nDecision A applies the standard pattern quickly but skips validation.\nDecision B adds a checkpoint that catches an invalid input before deployment.\nOutcome: Decision B prevents a user-visible defect with minimal added effort.`,
    explanation: `The scenario contrasts speed versus verification when implementing ${primary}. The better decision is justified by concrete failure cost, not generic study advice.`,
  };
}

export function buildFallbackPracticalArtifact(context: MentorFallbackContext): PracticalArtifact {
  const type = inferPracticalArtifactType(context);

  switch (type) {
    case "code":
      return buildCodeArtifact(context);
    case "query":
      return buildQueryArtifact(context);
    case "command":
      return buildCommandArtifact(context);
    case "configuration":
      return buildConfigurationArtifact(context);
    case "calculation":
      return buildCalculationArtifact(context);
    case "diagram":
      return buildDiagramArtifact(context);
    case "case-study":
      return buildCaseStudyArtifact(context);
    case "workflow":
    default:
      return buildWorkflowArtifact(context);
  }
}

export function buildFallbackHandsOnExercise(
  context: MentorFallbackContext,
  artifact: PracticalArtifact,
): HandsOnExercise {
  const topic = topicLabel(context);
  const primary = conceptFocus(context)[0] ?? topic;

  if (context.skillLevel === "beginner") {
    if (artifact.type === "code") {
      return {
        instructions: [
          `Open the ${artifact.language ?? "code"} snippet and locate the variable assignments.`,
          `Predict the type output for each print(type(...)) call before running.`,
          `Fix the bug: change price = "99.5" (string) to price = 99.5 (float), then rerun.`,
          `Confirm the printed types match the expected output block.`,
        ],
        starterContent: artifact.content.replace("price = 99.5", 'price = "99.5"'),
        hints: [
          `Strings use quotes; floats do not.`,
          `type(price) should report float after the fix.`,
        ],
        expectedOutcome: artifact.expectedOutput ?? "All four type lines match the expected output.",
        solution: artifact.content,
        solutionExplanation: `The bug was a string literal assigned to price. ${primary} requires the correct numeric type so later calculations and type checks behave predictably.`,
      };
    }

    if (artifact.type === "query") {
      return {
        instructions: [
          "Review the sample schema and the INNER JOIN query.",
          "Change INNER JOIN to LEFT JOIN.",
          "Predict which customers appear when an order row is missing.",
          "Compare your result to the expected rows below.",
        ],
        hints: ["LEFT JOIN keeps all rows from the left table.", "Missing matches appear as NULL amounts."],
        expectedOutcome: "Customers without orders still appear with NULL amount values.",
        solution: artifact.content.replace("INNER JOIN", "LEFT JOIN"),
        solutionExplanation: `LEFT JOIN preserves customers even when no order exists, which is the cardinality behavior exercised in ${topic}.`,
      };
    }

    if (artifact.type === "command" || artifact.type === "configuration") {
      return {
        instructions: [
          "Inspect the manifest or command sequence in the artifact.",
          "Change replicas from 2 to 3 in the Deployment spec (or equivalent scaling field).",
          "Apply the manifest and run the verification command.",
          "Confirm the expected running state appears in the output.",
        ],
        starterContent: artifact.content,
        hints: ["Edit the replica count in the manifest.", "Use rollout status to confirm readiness."],
        expectedOutcome: artifact.expectedOutput ?? "The scaled workload reaches the expected running state.",
        solution: artifact.content.replace("replicas: 2", "replicas: 3"),
        solutionExplanation: `Scaling the declared desired state exercises ${primary} by changing configuration and confirming the controller reconciles runtime behavior.`,
      };
    }
  }

  if (artifact.type === "command" || artifact.type === "configuration") {
    return {
      instructions: [
        "Review the manifest or command artifact and identify the field that controls scale or exposure.",
        "Apply one targeted change that alters runtime behavior.",
        "Run the verification command and capture the output.",
        "Compare the output against the expected behavior block.",
      ],
      starterContent: artifact.content,
      hints: ["Change one field at a time.", "Verify status before declaring success."],
      expectedOutcome: artifact.expectedOutput ?? "Output matches the expected behavior for the updated artifact.",
      solution: artifact.content,
      solutionExplanation: `Intermediate practice validates ${primary} by editing real configuration or commands and confirming observable behavior.`,
    };
  }

  if (context.skillLevel === "advanced") {
    return {
      instructions: [
        `Design a constraint that breaks the naive ${primary} approach in ${topic}.`,
        `Adapt the artifact to satisfy the constraint without losing correctness.`,
        `Document one trade-off you accepted and one alternative you rejected.`,
        `Verify the final artifact behavior against the expected outcome.`,
      ],
      hints: [
        `State invariants ${primary} must preserve.`,
        `Add a checkpoint that fails fast when the constraint is violated.`,
      ],
      expectedOutcome: `A revised artifact with documented trade-offs and verified behavior for ${primary}.`,
      solution: artifact.content,
      solutionExplanation: `Advanced practice requires defending ${primary} choices under constraints, not merely repeating the baseline artifact.`,
    };
  }

  return {
    instructions: [
      `Extend the ${artifact.type} artifact with one additional ${primary} case.`,
      `Introduce a deliberate mistake, then identify which step fails verification.`,
      `Correct the mistake and compare output to the expected outcome.`,
      `Write one sentence explaining why the fix works.`,
    ],
    starterContent: artifact.content,
    hints: [`Anchor changes on ${primary}.`, `Compare against the expected output block.`],
    expectedOutcome: `A corrected artifact whose output matches the expected outcome for ${topic}.`,
    solution: artifact.content,
    solutionExplanation: `Debugging a single introduced mistake reinforces how ${primary} affects observable behavior in ${topic}.`,
  };
}

export function buildFallbackPracticalBlocks(context: MentorFallbackContext): {
  practicalArtifact: PracticalArtifact;
  handsOnExercise: HandsOnExercise;
} {
  const practicalArtifact = buildFallbackPracticalArtifact(context);
  const handsOnExercise = buildFallbackHandsOnExercise(context, practicalArtifact);

  return { practicalArtifact, handsOnExercise };
}
