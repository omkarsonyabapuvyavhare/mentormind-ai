import { knowledgeGraphSchema, type KnowledgeGraph } from "@/knowledge-base/schema";
import {
  artifact,
  concept,
  defaultTopicSkills,
  exercise,
  mistake,
  topic,
} from "@/knowledge-base/_seed-helpers";

const CONTAMINATION = ["aws", "vpc", "ec2", "kubernetes pod", "react hooks"];

const anatomyTopic = topic({
  id: "prompt-anatomy",
  title: "Prompt Anatomy",
  aliases: ["prompt structure", "system prompt", "role prompt"],
  description: "Structure prompts with role, task, context, constraints, and output format.",
  learningOrder: 1,
  relatedTopicIds: ["prompt-instruction-clarity"],
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({ id: "prompt-role", title: "Role", description: "Who the model should act as for the task." }),
    concept({ id: "prompt-task", title: "Task Statement", description: "The explicit action the model must perform." }),
    concept({ id: "prompt-context", title: "Context Block", description: "Facts, documents, or state the model may use." }),
    concept({ id: "prompt-constraints", title: "Constraints", description: "Hard rules such as length, tone, or disallowed content." }),
    concept({ id: "prompt-output-format", title: "Output Format", description: "Required shape such as JSON, bullets, or a template." }),
    concept({ id: "prompt-success-criteria", title: "Success Criteria", description: "How to judge whether the answer is good enough." }),
  ],
  learningObjectives: [
    "Assemble a prompt with role, task, context, constraints, and format",
    "State measurable success criteria",
  ],
  practicalArtifacts: [
    artifact({
      id: "prompt-anatomy-template",
      type: "workflow",
      title: "Reusable prompt template",
      content:
        "Role: You are a careful technical editor.\nTask: Rewrite the draft for clarity.\nContext: <<DRAFT>>\nConstraints: Keep facts; max 120 words; no hype.\nOutput format: paragraph then 3 bullet risks.\nSuccess: A teammate can act without asking clarifying questions.",
      expectedOutput: "A filled template ready to run",
      explanation: "Separates role/task/context/constraints/format/success.",
      conceptIds: ["prompt-role", "prompt-task", "prompt-constraints", "prompt-output-format"],
    }),
  ],
  commonMistakes: [
    mistake(
      "prompt-anatomy-vague-task",
      "Giving only a vague goal like 'help with this'",
      "Assuming the model will infer the job",
      "State a concrete task verb and deliverable.",
      ["prompt-task"],
    ),
    mistake(
      "prompt-anatomy-no-format",
      "Omitting output format then complaining about shape",
      "Under-specifying structure",
      "Specify schema or bullet pattern up front.",
      ["prompt-output-format"],
    ),
  ],
  exercises: [
    exercise({
      id: "prompt-anatomy-exercise",
      title: "Support reply prompt",
      instructions: [
        "Write a prompt that drafts a customer support reply.",
        "Include role, task, context placeholders, constraints, and output format.",
      ],
      hints: ["Ban inventing refund policy", "Ask for subject + body"],
      expectedOutcome: "Complete six-part prompt template.",
      conceptIds: ["prompt-role", "prompt-task", "prompt-context", "prompt-output-format"],
    }),
  ],
  assessmentSkills: defaultTopicSkills(
    "prompt-anatomy",
    ["prompt-role", "prompt-task", "prompt-context", "prompt-constraints", "prompt-output-format"],
    ["concept-understanding", "practical-scenario", "configuration-analysis", "debugging", "architecture-reasoning"],
  ),
});

const clarityTopic = topic({
  id: "prompt-instruction-clarity",
  title: "Instruction Clarity",
  aliases: ["clear prompts", "ambiguous prompts", "prompt specificity"],
  description: "Remove ambiguity with specifics, examples of boundaries, and explicit refusals.",
  learningOrder: 2,
  prerequisiteIds: ["prompt-anatomy"],
  relatedTopicIds: ["prompt-few-shot"],
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({ id: "prompt-specificity", title: "Specificity", description: "Replace vague adjectives with measurable requirements." }),
    concept({ id: "prompt-audience", title: "Audience", description: "Name who will read the output and their knowledge level." }),
    concept({ id: "prompt-definitions", title: "Working Definitions", description: "Define key terms the model must respect." }),
    concept({ id: "prompt-negative", title: "Negative Instructions", description: "State what not to do when misuse is likely." }),
    concept({ id: "prompt-priority", title: "Priority Order", description: "Tell the model which rule wins when instructions conflict." }),
    concept({ id: "prompt-checklist", title: "Self-check Checklist", description: "Ask the model to verify requirements before finalizing." }),
  ],
  learningObjectives: [
    "Rewrite a vague prompt into a specific one",
    "Add negative instructions and priority rules",
  ],
  practicalArtifacts: [
    artifact({
      id: "prompt-clarity-before-after",
      type: "case-study",
      title: "Vague vs specific rewrite",
      content:
        "Before: Write something about sorting.\nAfter: Explain quicksort vs mergesort for a junior engineer in <=180 words.\nInclude one complexity table (best/avg/worst).\nDo not discuss hardware GPUs.\nIf input arrays are missing, ask one clarifying question instead of inventing data.",
      expectedOutput: "Specific audience, length, artifacts, and refusal path",
      explanation: "Shows specificity, negatives, and priority when data is missing.",
      conceptIds: ["prompt-specificity", "prompt-audience", "prompt-negative", "prompt-priority"],
    }),
  ],
  commonMistakes: [
    mistake(
      "prompt-clarity-adjectives",
      "Using only adjectives like 'nice' or 'detailed'",
      "No measurable target",
      "Specify length, sections, and acceptance checks.",
      ["prompt-specificity"],
    ),
    mistake(
      "prompt-clarity-conflict",
      "Issuing conflicting rules without a priority",
      "Model picks arbitrarily",
      "Declare which constraint wins.",
      ["prompt-priority"],
    ),
  ],
  exercises: [
    exercise({
      id: "prompt-clarity-exercise",
      title: "Clarify a meeting-summary prompt",
      instructions: [
        "Start from: 'Summarize the meeting well.'",
        "Rewrite with audience, length, required sections, and one negative instruction.",
      ],
      hints: ["Include action items section", "Ban inventing attendees"],
      expectedOutcome: "A specific prompt with checklist items.",
      conceptIds: ["prompt-specificity", "prompt-audience", "prompt-negative", "prompt-checklist"],
    }),
  ],
  assessmentSkills: defaultTopicSkills(
    "prompt-clarity",
    ["prompt-specificity", "prompt-audience", "prompt-definitions", "prompt-negative", "prompt-priority"],
    ["concept-understanding", "practical-scenario", "debugging", "configuration-analysis", "architecture-reasoning"],
  ),
});

const fewShotTopic = topic({
  id: "prompt-few-shot",
  title: "Few-Shot Prompting",
  aliases: ["examples in prompts", "shots", "demonstrations"],
  description: "Teach patterns with carefully chosen input/output examples.",
  learningOrder: 3,
  prerequisiteIds: ["prompt-instruction-clarity"],
  relatedTopicIds: ["prompt-chain-of-thought"],
  contaminationTerms: CONTAMINATION,
  concepts: [
    concept({ id: "prompt-zero-shot", title: "Zero-shot", description: "Task instructions without worked examples." }),
    concept({ id: "prompt-one-shot", title: "One-shot", description: "A single demonstration pair before the real input." }),
    concept({ id: "prompt-few-shot-set", title: "Few-shot Set", description: "Multiple examples covering common variants." }),
    concept({ id: "prompt-example-quality", title: "Example Quality", description: "Examples must match the desired format and edge cases." }),
    concept({ id: "prompt-labeling", title: "Labeled Demonstrations", description: "Mark Input/Output clearly so the pattern is learnable." }),
    concept({ id: "prompt-distribution", title: "Example Distribution", description: "Cover typical and tricky cases, not only the happy path." }),
  ],
  learningObjectives: [
    "Decide when zero-shot vs few-shot is appropriate",
    "Author 2–3 labeled examples that match the output schema",
  ],
  practicalArtifacts: [
    artifact({
      id: "prompt-few-shot-classify",
      type: "workflow",
      title: "Ticket severity few-shot",
      content:
        "Classify severity as low|medium|high.\nInput: Password reset email delayed 2 minutes\nOutput: low\nInput: Checkout fails for all users\nOutput: high\nInput: <<NEW TICKET>>\nOutput:",
      expectedOutput: "Model emits one of low|medium|high",
      explanation: "Labeled demonstrations constrain labels and style.",
      conceptIds: ["prompt-few-shot-set", "prompt-labeling", "prompt-example-quality"],
    }),
  ],
  commonMistakes: [
    mistake(
      "prompt-few-shot-inconsistent",
      "Giving examples that violate the stated schema",
      "Sloppy demos",
      "Make every example validate against the format rules.",
      ["prompt-example-quality", "prompt-labeling"],
    ),
    mistake(
      "prompt-few-shot-too-many",
      "Pasting dozens of redundant examples",
      "Assuming more is always better",
      "Prefer a small diverse set covering edge cases.",
      ["prompt-distribution", "prompt-few-shot-set"],
    ),
  ],
  exercises: [
    exercise({
      id: "prompt-few-shot-exercise",
      title: "JSON extractor shots",
      instructions: [
        "Create two Input/Output examples that extract {name, email} from prose.",
        "Add a third real input without the output filled in.",
      ],
      hints: ["Keep JSON keys identical", "Include one messy email format"],
      expectedOutcome: "Two valid demos + one pending input.",
      conceptIds: ["prompt-one-shot", "prompt-few-shot-set", "prompt-labeling"],
    }),
  ],
  assessmentSkills: defaultTopicSkills(
    "prompt-few-shot",
    ["prompt-zero-shot", "prompt-one-shot", "prompt-few-shot-set", "prompt-example-quality", "prompt-distribution"],
    ["concept-understanding", "practical-scenario", "debugging", "expected-output", "configuration-analysis"],
  ),
});

const cotTopic = topic({
  id: "prompt-chain-of-thought",
  title: "Chain-of-Thought and Decomposition",
  aliases: ["chain of thought", "step by step", "decomposition"],
  description: "Improve reasoning tasks by decomposing steps without leaking sensitive scratchpads when required.",
  learningOrder: 4,
  prerequisiteIds: ["prompt-few-shot"],
  relatedTopicIds: ["prompt-grounding-constraints"],
  contaminationTerms: CONTAMINATION,
  difficulty: "intermediate",
  concepts: [
    concept({ id: "prompt-decompose", title: "Task Decomposition", description: "Break a hard task into ordered sub-questions." }),
    concept({ id: "prompt-cot", title: "Chain of Thought", description: "Ask for intermediate reasoning before the final answer." }),
    concept({ id: "prompt-hidden-cot", title: "Private Scratchpad", description: "Keep reasoning internal when only the final answer should be shown." }),
    concept({ id: "prompt-plan-then-act", title: "Plan-then-Act", description: "Outline a plan, then execute it in a second phase." }),
    concept({ id: "prompt-self-consistency", title: "Self-consistency Check", description: "Compare multiple reasoned paths on high-stakes items." }),
    concept({ id: "prompt-stop-conditions", title: "Stop Conditions", description: "When to halt and ask a clarifying question instead of guessing." }),
  ],
  learningObjectives: [
    "Write a decompose-then-answer prompt for a multi-step problem",
    "Separate scratchpad from user-visible final answer when needed",
  ],
  practicalArtifacts: [
    artifact({
      id: "prompt-cot-debug",
      type: "workflow",
      title: "Debug plan-then-act prompt",
      content:
        "Step 1: List possible causes for the failing test.\nStep 2: Rank causes by likelihood given the stack trace.\nStep 3: Propose the single next experiment.\nFinal answer: only the next experiment in <=40 words.\nIf the stack trace is missing, ask for it instead of inventing frames.",
      expectedOutput: "Ordered reasoning with a short final action",
      explanation: "Decomposition + stop condition + concise final answer.",
      conceptIds: ["prompt-decompose", "prompt-plan-then-act", "prompt-stop-conditions"],
    }),
  ],
  commonMistakes: [
    mistake(
      "prompt-cot-always",
      "Forcing long chain-of-thought on trivial lookups",
      "Cargo-culting CoT",
      "Use decomposition when the task is multi-step or error-prone.",
      ["prompt-cot", "prompt-decompose"],
    ),
    mistake(
      "prompt-cot-leak",
      "Exposing sensitive reasoning the user should not see",
      "No separation of scratchpad vs answer",
      "Request a private plan and a clean final response.",
      ["prompt-hidden-cot"],
    ),
  ],
  exercises: [
    exercise({
      id: "prompt-cot-exercise",
      title: "Budget allocation CoT",
      instructions: [
        "Write a prompt that allocates a $1000 learning budget across three tools.",
        "Require a short plan, then a final table, and a stop condition if prices are unknown.",
      ],
      hints: ["Plan-then-act", "Ask for missing prices"],
      expectedOutcome: "Prompt with decomposition and stop condition.",
      conceptIds: ["prompt-decompose", "prompt-plan-then-act", "prompt-stop-conditions"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills(
    "prompt-cot",
    ["prompt-decompose", "prompt-cot", "prompt-hidden-cot", "prompt-plan-then-act", "prompt-stop-conditions"],
    ["concept-understanding", "architecture-reasoning", "practical-scenario", "debugging", "expected-output"],
  ),
});

const groundingTopic = topic({
  id: "prompt-grounding-constraints",
  title: "Grounding and Hard Constraints",
  aliases: ["grounding", "rag prompts", "cite sources", "hallucination control"],
  description: "Anchor answers in provided sources and refuse when evidence is missing.",
  learningOrder: 5,
  prerequisiteIds: ["prompt-instruction-clarity"],
  relatedTopicIds: ["prompt-evaluation-iteration"],
  contaminationTerms: CONTAMINATION,
  difficulty: "intermediate",
  concepts: [
    concept({ id: "prompt-grounding", title: "Grounding", description: "Require answers to rely on supplied context rather than inventing facts." }),
    concept({ id: "prompt-citations", title: "Citations", description: "Point claims back to source IDs or quotes." }),
    concept({ id: "prompt-refusal", title: "Refusal Behavior", description: "Say 'not in sources' instead of fabricating." }),
    concept({ id: "prompt-context-window", title: "Context Budget", description: "Prioritize the most relevant snippets when space is limited." }),
    concept({ id: "prompt-tool-results", title: "Tool Result Trust", description: "Treat tool/API outputs as evidence with their own uncertainty." }),
    concept({ id: "prompt-conflict", title: "Conflicting Sources", description: "Surface disagreements instead of silently picking one." }),
  ],
  learningObjectives: [
    "Write a grounded QA prompt with citation and refusal rules",
    "Handle missing or conflicting sources explicitly",
  ],
  practicalArtifacts: [
    artifact({
      id: "prompt-grounding-qa",
      type: "workflow",
      title: "Grounded QA contract",
      content:
        "Use ONLY the sources below.\nIf the answer is not supported, reply: NOT_IN_SOURCES.\nQuote short evidence and cite [S1]/[S2].\nIf sources conflict, summarize both sides.\nSources:\n[S1] ...\n[S2] ...\nQuestion: ...",
      expectedOutput: "Cited answer or NOT_IN_SOURCES",
      explanation: "Hard grounding with refusal and conflict handling.",
      conceptIds: ["prompt-grounding", "prompt-citations", "prompt-refusal", "prompt-conflict"],
    }),
  ],
  commonMistakes: [
    mistake(
      "prompt-ground-soft",
      "Saying 'prefer sources' without forbidding invention",
      "Soft language allows hallucination",
      "Use hard constraints and an explicit refusal string.",
      ["prompt-grounding", "prompt-refusal"],
    ),
    mistake(
      "prompt-ground-no-cite",
      "Allowing uncited factual claims",
      "Hard to audit",
      "Require citations for non-obvious claims.",
      ["prompt-citations"],
    ),
  ],
  exercises: [
    exercise({
      id: "prompt-grounding-exercise",
      title: "Policy bot prompt",
      instructions: [
        "Write a prompt that answers HR policy questions from pasted policy text only.",
        "Include citation format and a refusal line.",
      ],
      hints: ["NOT_IN_SOURCES", "Cite paragraph ids"],
      expectedOutcome: "Grounded prompt with refusal + citation rules.",
      conceptIds: ["prompt-grounding", "prompt-citations", "prompt-refusal"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills(
    "prompt-grounding",
    ["prompt-grounding", "prompt-citations", "prompt-refusal", "prompt-context-window", "prompt-conflict"],
    ["practical-scenario", "configuration-analysis", "debugging", "architecture-reasoning", "concept-understanding"],
  ),
});

const evalTopic = topic({
  id: "prompt-evaluation-iteration",
  title: "Evaluation and Iteration",
  aliases: ["prompt eval", "prompt testing", "iteration"],
  description: "Measure prompt quality with cases, failure tags, and controlled iterations.",
  learningOrder: 6,
  prerequisiteIds: ["prompt-few-shot", "prompt-grounding-constraints"],
  contaminationTerms: CONTAMINATION,
  difficulty: "intermediate",
  concepts: [
    concept({ id: "prompt-eval-set", title: "Eval Set", description: "Fixed examples used to compare prompt versions." }),
    concept({ id: "prompt-rubric", title: "Scoring Rubric", description: "Explicit criteria such as correctness, format, and safety." }),
    concept({ id: "prompt-regression", title: "Regression Cases", description: "Past failures that must keep passing after edits." }),
    concept({ id: "prompt-ablation", title: "Ablation Changes", description: "Change one prompt factor at a time to learn what helped." }),
    concept({ id: "prompt-metrics", title: "Offline Metrics", description: "Pass rate, format validity, citation coverage, refusal quality." }),
    concept({ id: "prompt-versioning", title: "Prompt Versioning", description: "Name and changelog prompt variants for rollback." }),
  ],
  learningObjectives: [
    "Build a tiny eval set with a rubric",
    "Iterate with ablation and version notes",
  ],
  practicalArtifacts: [
    artifact({
      id: "prompt-eval-sheet",
      type: "case-study",
      title: "Prompt eval sheet",
      content:
        "Version: p-summary-v3\nCases: 12\nRubric: (correct facts 0-2, format 0-1, no invention 0-1)\nPass threshold: total >= 3\nFailure tags: missing_action_items, invented_owner\nNext change: add negative instruction against inventing owners (ablation: negatives only)",
      expectedOutput: "Comparable scores across versions",
      explanation: "Eval set + rubric + ablation note for one change.",
      conceptIds: ["prompt-eval-set", "prompt-rubric", "prompt-ablation", "prompt-versioning"],
    }),
  ],
  commonMistakes: [
    mistake(
      "prompt-eval-vibe",
      "Judging prompts only by vibes on one example",
      "No fixed cases",
      "Keep a reusable eval set and rubric.",
      ["prompt-eval-set", "prompt-rubric"],
    ),
    mistake(
      "prompt-eval-many-changes",
      "Changing five prompt parts at once",
      "Can't attribute gains",
      "Ablate one factor per version.",
      ["prompt-ablation", "prompt-versioning"],
    ),
  ],
  exercises: [
    exercise({
      id: "prompt-eval-exercise",
      title: "Eval for the support reply prompt",
      instructions: [
        "Create five eval cases (including one that should refuse).",
        "Define a 3-criterion rubric and a pass threshold.",
        "Propose one ablation for the next version.",
      ],
      hints: ["Include a format-break case", "Tag failures"],
      expectedOutcome: "Eval sheet with cases, rubric, and next ablation.",
      conceptIds: ["prompt-eval-set", "prompt-rubric", "prompt-ablation", "prompt-regression"],
      difficulty: "intermediate",
    }),
  ],
  assessmentSkills: defaultTopicSkills(
    "prompt-eval",
    ["prompt-eval-set", "prompt-rubric", "prompt-regression", "prompt-ablation", "prompt-versioning"],
    ["practical-scenario", "architecture-reasoning", "concept-understanding", "debugging", "configuration-analysis"],
  ),
});

export const promptEngineeringKnowledgeGraph: KnowledgeGraph = knowledgeGraphSchema.parse({
  id: "kg-prompt-engineering",
  title: "Prompt Engineering",
  aliases: [
    "prompt engineering",
    "prompts",
    "learn prompt engineering",
    "llm prompts",
    "prompting",
  ],
  category: "AI / Machine Learning",
  description:
    "Starter prompt-engineering curriculum covering prompt anatomy, clarity, few-shot examples, chain-of-thought, grounding, and evaluation.",
  topics: [anatomyTopic, clarityTopic, fewShotTopic, cotTopic, groundingTopic, evalTopic],
});
