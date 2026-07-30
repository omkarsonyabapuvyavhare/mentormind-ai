import type { AiLessonResponse, HandsOnPractice, HandsOnExercise, PracticalArtifact } from "@/lib/ai/lesson-schema";
import { HANDS_ON_PRACTICE_HEADING } from "@/lib/ai/lesson-schema";
import { buildFallbackPracticalBlocks } from "@/lib/ai/lesson-practical-fallback";

type KnowledgeCheck = AiLessonResponse["sections"][number]["knowledgeCheck"][number];

function knowledgeCheck(question: string, conceptTag: string, correct = "Apply the concept in practice"): KnowledgeCheck {
  return {
    question,
    options: [
      correct,
      "Use invalid syntax for this concept",
      "Confuse this with an unrelated feature",
      "Skip validating the result",
    ] as [string, string, string, string],
    correctIndex: 0,
    explanation: "This answer matches the concept taught in this section.",
    conceptTag,
  };
}

function mentorSection(
  heading: AiLessonResponse["sections"][number]["heading"],
  content: string,
  practicalExample: string,
  commonMistakes: string[],
  summary: string[],
  checks: KnowledgeCheck[] = [],
  handsOnPractice?: HandsOnPractice,
): AiLessonResponse["sections"][number] {
  return {
    heading,
    content,
    practicalExample,
    handsOnPractice,
    commonMistakes,
    summary,
    knowledgeCheck: checks,
  };
}

function sampleHandsOnPractice(domain: string): HandsOnPractice {
  return {
    exercise: `Complete a focused ${domain} exercise with concrete inputs and verifiable output.`,
    instructions: `1. Define inputs.\n2. Apply the ${domain} procedure step by step.\n3. Compare output to the expected result.\n4. Note one failure mode if a step is skipped.`,
    thinkAbout: `What inputs are valid? What output proves the ${domain} procedure worked?`,
    hints: [`Start with the smallest valid ${domain} case.`, `Verify one step at a time.`],
    expectedOutcome: `Correct output with step-by-step notes showing how each ${domain} operation changed the result.`,
    solutionExplanation: `Each step preserves the invariants required by ${domain}; verifying incrementally catches mistakes early.`,
  };
}

function samplePracticalBlocks(
  title: string,
  options: { domainHint?: string; cloud?: "aws" | "azure" },
): { practicalArtifact: PracticalArtifact; handsOnExercise: HandsOnExercise } {
  const domain = options.domainHint ?? title;
  const haystack = `${title} ${domain}`;
  const goalCategory =
    options.cloud === "azure" || options.cloud === "aws"
      ? "Cloud"
      : /react|web|frontend|component/i.test(haystack)
        ? "Web Development"
        : "Programming";

  return buildFallbackPracticalBlocks({
    goalTitle: title,
    goalCategory,
    topicId: title.toLowerCase().replace(/\s+/g, "-"),
    topicTitle: title,
    skillLevel: "intermediate",
    learningObjectives: [`Understand ${domain}`, `Apply ${domain} correctly`],
  });
}

export function buildMentorLessonFixture(
  title: string,
  options: { domainHint?: string; cloud?: "aws" | "azure" } = {},
): AiLessonResponse {
  const domain = options.domainHint ?? title;
  const practicalBlocks = samplePracticalBlocks(title, options);
  const isAzure = options.cloud === "azure";
  const isAws = options.cloud === "aws";

  const overviewContent = isAzure
    ? "Azure delivers IaaS, PaaS, and SaaS with distinct operational boundaries. CapEx shifts to consumption-based OpEx. RBAC controls who can manage resources; Azure Policy enforces guardrails at scale."
    : isAws
      ? "A VPC isolates workloads in a private network. Subnets segment tiers; route tables control traffic paths. Security groups filter instance traffic; NACLs filter at subnet boundaries. IAM roles grant least-privilege access via temporary credentials."
      : `${domain} combines core definitions, operational behavior, and verifiable outputs. Each concept has precise terminology, expected inputs, and observable results when applied correctly.`;

  const realWorldContent = isAzure
    ? "Teams choose Azure service models based on how much infrastructure they manage versus what Microsoft operates. Identity, storage, and compute choices affect cost, latency, and compliance in production workloads."
    : isAws
      ? "Three-tier web apps use public subnets for load balancers, private subnets for application servers, and isolated database subnets. Routing and security groups enforce which paths are reachable from the internet."
      : `${domain} appears in production when engineers must implement correct behavior under constraints—latency, security, data integrity, and maintainability.`;

  const coreContent = isAzure
    ? "IaaS leaves OS and runtime management with the customer; PaaS abstracts runtime patching; SaaS delivers managed applications. Subscription and resource group scopes organize billing and lifecycle. Managed identities avoid embedding secrets in application code."
    : isAws
      ? "Create a VPC with CIDR planning first. Attach an Internet Gateway for public subnets; use NAT Gateway for private subnet egress. Associate route tables per subnet tier. Attach IAM roles to compute instead of long-lived access keys."
      : `${domain} mechanics: define terms, trace data or control flow through each step, and validate output at boundaries. Misapplied steps often fail silently until verification catches the drift.`;

  const practicalExample = isAzure
    ? "Create a resource group, deploy Storage with LRS, upload a blob, and confirm public access stays disabled until explicitly configured."
    : isAws
      ? "Design a VPC: public subnet with IGW route for ALB, private subnets for app tier, NAT for outbound updates, security groups restricting admin ports."
      : `Worked ${domain} example: sample inputs → core operations → expected output, with one line showing a common failure if a step is wrong.`;

  const mistakes = isAzure
    ? [
        "Assuming SaaS removes all customer responsibility for data classification",
        "Choosing GRS when LRS meets latency and redundancy needs",
        "Granting Owner at subscription scope instead of narrow RBAC",
      ]
    : isAws
      ? [
          "Routing private subnets to an Internet Gateway instead of NAT for outbound traffic",
          "Opening security group 0.0.0.0/0 on administrative ports",
          "Embedding long-lived IAM user keys in application configuration",
        ]
      : [
          `Treating ${domain} terms as interchangeable when definitions differ`,
          `Skipping verification after applying ${domain} operations`,
          `Changing multiple inputs at once so failures are not diagnosable`,
        ];

  const takeaways = isAzure
    ? [
        "Match Azure service models to operational ownership",
        "Scope RBAC narrowly; use managed identities for service access",
        "Monitor consumption with budgets and resource tags",
      ]
    : isAws
      ? [
          "Public subnets use IGW routes; private subnets use NAT for egress",
          "Security groups are stateful; NACLs are stateless subnet filters",
          "Prefer IAM roles with temporary credentials over static keys",
        ]
      : [
          `${domain} terms have precise definitions and behavior`,
          `Core ${domain} workflow is reproducible with verification at each step`,
          `Common ${domain} errors are recognizable from incorrect outputs`,
        ];

  return {
    title,
    estimatedMinutes: 45,
    learningObjectives: [`Understand ${domain}`, `Apply ${domain} correctly`],
    practicalArtifact: practicalBlocks.practicalArtifact,
    handsOnExercise: practicalBlocks.handsOnExercise,
    sections: [
      mentorSection(
        "Lesson Overview",
        overviewContent,
        practicalExample,
        mistakes,
        takeaways,
        [knowledgeCheck(`Which overview statement about ${domain} is correct?`, "overview-1", takeaways[0])],
      ),
      mentorSection(
        "Real-World Context",
        realWorldContent,
        practicalExample,
        mistakes,
        takeaways,
        [knowledgeCheck(`Which real-world ${domain} statement is correct?`, "context-1", takeaways[1])],
      ),
      mentorSection(
        "Core Explanation",
        coreContent,
        practicalExample,
        mistakes,
        takeaways,
        [knowledgeCheck(`Which ${domain} mechanism is described correctly?`, "core-1", takeaways[0])],
      ),
      mentorSection(
        HANDS_ON_PRACTICE_HEADING,
        `Apply ${domain} directly in the exercise below. Work through each step and compare your output to the expected result before reading the solution.`,
        `Complete the exercise before reading the solution explanation.`,
        mistakes,
        takeaways,
        [knowledgeCheck(`Which hands-on ${domain} step is correct?`, "hands-on-1", takeaways[1])],
        sampleHandsOnPractice(domain),
      ),
      mentorSection(
        "Practical Example",
        `Worked ${domain} walkthrough: label each input, show the operation applied at every step, display the final output, and explain why an incorrect step would produce a visibly wrong result.`,
        practicalExample,
        mistakes,
        takeaways,
        [knowledgeCheck(`Which ${domain} example output is correct?`, "practice-1", takeaways[2])],
      ),
      mentorSection(
        "Common Misconceptions",
        `These ${domain} misconceptions persist because partial mental models feel complete until an edge case breaks the result.`,
        `Write one counterexample that exposes each misconception above.`,
        mistakes,
        takeaways,
      ),
      mentorSection(
        "Mentor Tips",
        `Professional ${domain} practice: verify each step before continuing, reduce failing cases to the smallest reproducible example, and treat tool errors as precise hints about what broke.`,
        `Apply one tip during the hands-on exercise and note whether it changed your result.`,
        mistakes,
        takeaways,
      ),
      mentorSection(
        "Key Takeaways",
        `You should retain these ${domain} facts: core definitions, the standard workflow, verification habits, and the most common errors to avoid when applying the technique in practice.`,
        `Reproduce the hands-on exercise without notes and state why the solution works.`,
        mistakes,
        takeaways,
      ),
    ],
  };
}
