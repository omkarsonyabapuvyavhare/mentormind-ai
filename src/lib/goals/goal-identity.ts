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
  { category: "Data", pattern: /\b(sql|database|data analyst|data engineer|pandas|etl|power bi|tableau)\b/i },
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

export function inferFocusAreas(goalTitle: string, category: GoalCategory): string[] {
  const title = goalTitle.toLowerCase();

  if (category === "Programming" && /\bpython\b/i.test(title)) {
    return ["Python Basics", "Control Flow", "Functions", "Data Structures"];
  }

  if (category === "Web Development" && /\breact\b/i.test(title)) {
    return ["JavaScript Foundations", "React Components", "State Management", "Routing"];
  }

  if (category === "DevOps" && /\bkubernetes\b/i.test(title)) {
    return ["Cluster Architecture", "Workloads", "Networking", "Security"];
  }

  if (category === "Data" && /\bsql\b/i.test(title)) {
    return ["Query Basics", "Joins", "Aggregations", "Database Design"];
  }

  if (category === "AI / Machine Learning") {
    return ["Core Concepts", "Model Basics", "Applied Practice", "Evaluation"];
  }

  if (category === "Cloud" && isAzureCertificationGoal(buildGoalSlug(goalTitle))) {
    return ["Cloud Concepts", "Azure Services", "Security", "Pricing"];
  }

  if (category === "Cloud") {
    return ["Cloud Foundations", "Core Services", "Security", "Architecture"];
  }

  return ["Foundations", "Core Concepts", "Applied Practice", "Review"];
}
