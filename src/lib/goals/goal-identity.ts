import { z } from "zod";

import { slugifyTitle } from "@/lib/ai/slug-id";

export const goalCategorySchema = z.enum([
  "Programming",
  "Cloud",
  "DevOps",
  "AI / Machine Learning",
  "Data",
  "Cybersecurity",
  "Web Development",
  "Mobile Development",
  "General Technology",
  "Business",
  "Design",
  "Unknown",
]);

export const goalTypeSchema = z.enum(["Skill", "Certification"]);

export type GoalCategory = z.infer<typeof goalCategorySchema>;
export type GoalType = z.infer<typeof goalTypeSchema>;

export interface LearnerGoalIdentity {
  goalSlug: string;
  goalTitle: string;
  goalCategory: GoalCategory;
  goalType: GoalType;
}

export const AWS_CERTIFICATION_SLUG = "aws-saa-c03";
export const AZURE_CERTIFICATION_SLUG = "azure-fundamentals";

const CATEGORY_PATTERNS: Array<{ category: GoalCategory; pattern: RegExp }> = [
  { category: "Programming", pattern: /\b(python|java\b|c\+\+|golang|go language|ruby|rust\b|typescript|javascript)\b/i },
  { category: "Web Development", pattern: /\b(react|vue|angular|next\.js|frontend|full[\s-]?stack|html|css|node\.js)\b/i },
  { category: "Mobile Development", pattern: /\b(android|ios|swift|kotlin|flutter|mobile app)\b/i },
  { category: "Cloud", pattern: /\b(aws|azure|gcp|google cloud|cloud computing|saa-c03|solutions architect|az-900)\b/i },
  { category: "DevOps", pattern: /\b(kubernetes|k8s|docker|terraform|ansible|ci\/cd|devops)\b/i },
  { category: "AI / Machine Learning", pattern: /\b(machine learning|deep learning|neural network|llm|prompt engineering|artificial intelligence|\bml\b)\b/i },
  {
    category: "Data",
    pattern:
      /\b(data science|datascience|data scientist|sql|database|data analyst|data engineer(?:ing)?|pandas|numpy|matplotlib|seaborn|scikit-?learn|etl|elt|airflow|apache spark|data lake|data warehouse|power bi|tableau|exploratory data analysis|\beda\b)\b/i,
  },
  { category: "Cybersecurity", pattern: /\b(cybersecurity|security\+|penetration test|ethical hack|infosec)\b/i },
  { category: "Design", pattern: /\b(ui\/ux|figma|design system|product design|graphic design)\b/i },
  { category: "Business", pattern: /\b(product management|project management|pmp|scrum master|business analyst)\b/i },
];

const CERTIFICATION_PATTERN =
  /\b(certification|certified|associate|professional exam|fundamentals exam|pass the|prepare for|exam prep|saa-c03|az-900|cka|ckad)\b/i;

export function buildGoalSlug(title: string): string {
  return slugifyTitle(normalizeGoalTitle(title)) || "learning-goal";
}

function normalizeGoalTitle(title: string): string {
  return title
    .replace(/^(?:i want to|i'd like to|help me|my goal is to|prepare for)\s+/i, "")
    .replace(/\.$/, "")
    .trim();
}

export function formatDisplayGoalTitle(title: string): string {
  const normalized = normalizeGoalTitle(title);

  if (!normalized) {
    return normalized;
  }

  if (/^[A-Z0-9][A-Za-z0-9\s-]*$/.test(normalized) && !/^learn\b/i.test(normalized)) {
    return normalized;
  }

  return normalized.replace(/\b([a-z])/g, (char) => char.toUpperCase());
}

export function classifyGoalCategory(text: string): GoalCategory {
  const normalized = text.trim();

  if (!normalized) {
    return "Unknown";
  }

  for (const { category, pattern } of CATEGORY_PATTERNS) {
    if (pattern.test(normalized)) {
      return category;
    }
  }

  if (/\b(learn|master|become|study|build skills in)\b/i.test(normalized)) {
    return "General Technology";
  }

  return "Unknown";
}

export function detectGoalType(text: string): GoalType {
  return CERTIFICATION_PATTERN.test(text) ? "Certification" : "Skill";
}

export function isAwsCertificationGoal(goalSlug: string): boolean {
  return goalSlug === AWS_CERTIFICATION_SLUG;
}

export function isAzureCertificationGoal(goalSlug: string): boolean {
  return goalSlug === AZURE_CERTIFICATION_SLUG;
}

export function isCertificationSeedGoal(goalSlug: string): boolean {
  return isAwsCertificationGoal(goalSlug) || isAzureCertificationGoal(goalSlug);
}

export function resolveGoalIdentityFromText(
  goalTitle: string,
  targetOutcome: string,
): LearnerGoalIdentity {
  const haystack = `${goalTitle} ${targetOutcome}`.trim();
  const normalizedTitle = normalizeGoalTitle(goalTitle);
  const goalCategory = classifyGoalCategory(haystack);
  const goalType = detectGoalType(haystack);

  if (/\b(aws|amazon web services|solutions architect|saa-c03|saa c03)\b/i.test(haystack)) {
    return {
      goalSlug: AWS_CERTIFICATION_SLUG,
      goalTitle: normalizedTitle.includes("AWS") ? normalizedTitle : "AWS Solutions Architect Associate",
      goalCategory: "Cloud",
      goalType: "Certification",
    };
  }

  if (/\b(az-900|azure fundamentals)\b/i.test(haystack)) {
    return {
      goalSlug: AZURE_CERTIFICATION_SLUG,
      goalTitle: normalizedTitle.includes("Azure") ? normalizedTitle : "Azure Fundamentals AZ-900",
      goalCategory: "Cloud",
      goalType: "Certification",
    };
  }

  const resolvedTitle = normalizedTitle || goalTitle.trim() || "Personal learning goal";

  return {
    goalSlug: buildGoalSlug(resolvedTitle),
    goalTitle: formatDisplayGoalTitle(resolvedTitle),
    goalCategory,
    goalType,
  };
}

const GENERIC_FOCUS_AREA_PATTERN =
  /^(foundations|core concepts?|applied practice(?:\s+\d+)?|review|introduction|basics|practice|fundamentals|overview)$/i;

export function isGenericFocusArea(area: string): boolean {
  return GENERIC_FOCUS_AREA_PATTERN.test(area.trim());
}

export function areGenericFocusAreas(areas: string[] | undefined): boolean {
  if (!areas || areas.length === 0) {
    return true;
  }

  const genericCount = areas.filter(isGenericFocusArea).length;
  return genericCount >= Math.ceil(areas.length * 0.5);
}

export function inferFocusAreas(goalTitle: string, category: GoalCategory): string[] {
  const title = goalTitle.toLowerCase();

  if (category === "Programming" && /\bpython\b/i.test(title)) {
    return [
      "Python Syntax and Data Types",
      "Variables and Operators",
      "Control Flow",
      "Functions",
      "Data Structures",
      "Modules and Packages",
      "Error Handling",
      "Practical Python Scripts",
    ];
  }

  if (category === "Programming" && /\bjava\b/i.test(title)) {
    return [
      "Java Syntax and Data Types",
      "Variables and Operators",
      "Control Flow",
      "Methods and Classes",
      "Collections",
      "Exception Handling",
    ];
  }

  if (category === "Web Development" && /\breact\b/i.test(title)) {
    return ["JSX", "Components", "Props", "State", "Hooks", "Effects", "Routing", "Forms"];
  }

  if (category === "DevOps" && /\b(kubernetes|k8s)\b/i.test(title)) {
    return [
      "Cluster Architecture",
      "Pods and Workloads",
      "Services and Networking",
      "Deployments",
      "ConfigMaps and Secrets",
      "RBAC and Pod Security",
    ];
  }

  if (category === "DevOps" && /\bdocker\b/i.test(title)) {
    return [
      "Images and Containers",
      "Dockerfile Instructions",
      "Volumes and Bind Mounts",
      "Container Networking",
      "Docker Compose",
      "Image Build Optimization",
      "Container Troubleshooting",
    ];
  }

  if (category === "Data" && /\bsql\b/i.test(title) && !/\bdata science\b/i.test(title)) {
    return ["SELECT", "WHERE", "ORDER BY", "GROUP BY", "JOINS", "Subqueries", "Indexes", "Query Tuning"];
  }

  if (
    category === "Data" &&
    /\b(data science|datascience|data scientist|numpy|pandas|matplotlib|eda)\b/i.test(title)
  ) {
    return [
      "Python for Data Science",
      "Variables and Data Types",
      "NumPy Arrays",
      "Pandas DataFrames",
      "Data Cleaning",
      "Data Visualization",
      "Exploratory Data Analysis",
      "Machine Learning Basics",
    ];
  }

  if (category === "Data" && /\bdata engineer(?:ing)?\b/i.test(title)) {
    return [
      "Data Engineering Fundamentals",
      "Batch and Streaming Pipelines",
      "ETL and ELT Patterns",
      "Data Lakes and Warehouses",
      "Apache Spark Transforms",
      "Orchestration with Airflow",
      "Data Quality Checks",
      "Pipeline Observability",
    ];
  }

  if (category === "Data") {
    return [
      "Relational Data Models",
      "Working with Tabular Data",
      "Data Cleaning",
      "Aggregation and Analysis",
      "Visualization",
      "Reporting Insights",
    ];
  }

  if (category === "AI / Machine Learning" && /\bprompt\b/i.test(title)) {
    return [
      "Prompt Structure",
      "Instruction Design",
      "Few-Shot Examples",
      "Evaluation and Iteration",
      "Safety and Guardrails",
      "Applied Prompt Workflows",
    ];
  }

  if (category === "AI / Machine Learning") {
    return [
      "ML Problem Framing",
      "Supervised Learning",
      "Train Test Split",
      "Model Evaluation Metrics",
      "Feature Preparation",
      "Overfitting and Regularization",
      "Applied ML Project",
    ];
  }

  if (category === "Cloud" && isAzureCertificationGoal(buildGoalSlug(goalTitle))) {
    return ["Cloud Concepts", "Azure Services", "Security", "Pricing"];
  }

  if (category === "Cloud") {
    return ["Cloud Service Models", "Core Cloud Services", "Identity and Security", "Architecture Patterns"];
  }

  if (category === "Mobile Development") {
    return [
      "Mobile App Structure",
      "UI Layouts",
      "Navigation",
      "State and Data",
      "Networking",
      "Device Features",
    ];
  }

  if (category === "Cybersecurity") {
    return [
      "CIA Triad and Risk",
      "Threat Models",
      "Authentication and Access",
      "Network Security",
      "Secure Coding Practices",
      "Incident Response",
    ];
  }

  if (category === "Business") {
    return [
      "Problem Framing",
      "Stakeholder Alignment",
      "Requirements Discovery",
      "Prioritization",
      "Delivery Planning",
      "Outcome Measurement",
    ];
  }

  if (category === "Design") {
    return [
      "Design Principles",
      "User Research Basics",
      "Wireframing",
      "Visual Hierarchy",
      "Interaction Patterns",
      "Design Critique",
    ];
  }

  // Last resort: derive concrete topics from the goal wording instead of Foundations/Review.
  const cleaned = goalTitle
    .replace(/^(?:i want to|i'd like to|help me|learn|master|become|study)\s+/i, "")
    .replace(/\b(developer|engineer|professional|skills?|basics?)\b/gi, "")
    .trim();
  const label = cleaned || goalTitle.trim() || "the Goal";

  return [
    `${label} Fundamentals`,
    `${label} Core Techniques`,
    `${label} Practical Workflows`,
    `${label} Applied Project`,
  ];
}
