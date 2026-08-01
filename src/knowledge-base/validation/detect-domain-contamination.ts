import { containsAwsSpecificTopic } from "@/lib/ai/roadmap-schema";
import type { KnowledgeGraph, KnowledgeTopic } from "@/knowledge-base/schema";
import type { GoalCategory } from "@/lib/goals/goal-identity";

const AZURE_PATTERN =
  /\b(azure|microsoft azure|az-900|blob storage|resource group)\b/i;

const CROSS_DOMAIN_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /\b(react hooks|jsx|vue component|angular module)\b/i, label: "web-framework" },
  { pattern: /\b(kubernetes pod|helm chart|kubectl)\b/i, label: "kubernetes" },
  { pattern: /\b(python class|django|flask)\b/i, label: "python" },
  { pattern: /\b(sql join|window function|group by)\b/i, label: "sql" },
  { pattern: /\b(vpc\b|ec2|s3\b|saa-c03)\b/i, label: "aws" },
];

/** Cross-language leakage once a programming KG is selected. */
const LANGUAGE_LOCKS: Array<{
  graphIds: string[];
  foreign: RegExp;
  term: string;
}> = [
  {
    graphIds: ["kg-java"],
    foreign: /\bpython\b|\bdjango\b|\bflask\b|\bpytest\b|\bpandas\b|\bnumpy\b|\belif\b|\bconsole\.log\b/i,
    term: "python/js",
  },
  {
    graphIds: ["kg-python"],
    foreign: /public\s+static\s+void\s+main|\bsystem\.out\b|\bjava\.util\b|\bjavascript\b/i,
    term: "java/js",
  },
  {
    graphIds: ["kg-javascript"],
    foreign: /public\s+static\s+void\s+main|\bsystem\.out\b|\bpython\b|\bdjango\b|\bflask\b|\belif\b/i,
    term: "java/python",
  },
  {
    graphIds: ["kg-typescript"],
    foreign: /public\s+static\s+void\s+main|\bsystem\.out\b|\bpython\b|\bdjango\b|\bflask\b/i,
    term: "java/python",
  },
  {
    graphIds: ["kg-go"],
    foreign: /public\s+static\s+void\s+main|\bsystem\.out\b|\bpython\b|\bdjango\b|\belif\b|\bjavascript\b/i,
    term: "cross-language",
  },
];

export interface DomainContaminationIssue {
  term: string;
  reason: string;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Word-boundary aware term hit — "java" must not match inside "javascript". */
function includesTerm(haystack: string, term: string): boolean {
  const normalizedTerm = term.toLowerCase().trim();
  if (!normalizedTerm) {
    return false;
  }

  if (normalizedTerm.length <= 4 || !normalizedTerm.includes(" ")) {
    const pattern = new RegExp(
      `(?:^|[^a-z0-9_+#])${escapeRegExp(normalizedTerm)}(?:[^a-z0-9_+#]|$)`,
      "i",
    );
    return pattern.test(haystack);
  }

  return haystack.includes(normalizedTerm);
}

function includesAny(haystack: string, terms: string[]): string | null {
  for (const term of terms) {
    if (includesTerm(haystack, term)) {
      return term;
    }
  }
  return null;
}

/**
 * Detect unrelated-domain leakage in generated content.
 * AWS/VPC terms are always contamination outside Cloud/AWS graphs.
 * Once a KG is selected, reject cross-language contamination (e.g. Java lesson with Python).
 */
export function detectDomainContamination(input: {
  content: string;
  goalCategory: GoalCategory;
  graph?: KnowledgeGraph | null;
  topic?: KnowledgeTopic | null;
}): DomainContaminationIssue[] {
  const issues: DomainContaminationIssue[] = [];
  const haystack = input.content.toLowerCase();
  const graphId = input.graph?.id ?? "";
  const isAwsGraph = graphId.startsWith("kg-aws") || graphId === "kg-aws-saa";
  const isAzureGraph = graphId.startsWith("kg-azure");
  const isCloudFamily =
    input.goalCategory === "Cloud" ||
    input.graph?.category === "Cloud" ||
    isAwsGraph ||
    isAzureGraph;

  if (!isAwsGraph && containsAwsSpecificTopic(haystack)) {
    if (
      !isCloudFamily ||
      input.goalCategory === "Programming" ||
      input.goalCategory === "Web Development" ||
      input.goalCategory === "Data"
    ) {
      issues.push({
        term: "aws/vpc",
        reason: "AWS/VPC content is not allowed for this goal/knowledge graph.",
      });
    }
  }

  if (!isAzureGraph && !isCloudFamily && AZURE_PATTERN.test(haystack)) {
    issues.push({
      term: "azure",
      reason: "Azure platform content is not allowed for this goal/knowledge graph.",
    });
  }

  const topicTerms = input.topic?.contaminationTerms ?? [];
  const hit = includesAny(haystack, topicTerms);
  if (hit) {
    issues.push({
      term: hit,
      reason: `Content includes contamination term "${hit}" for topic ${input.topic?.id}.`,
    });
  }

  for (const lock of LANGUAGE_LOCKS) {
    if (!lock.graphIds.includes(graphId)) {
      continue;
    }
    if (lock.foreign.test(haystack)) {
      issues.push({
        term: lock.term,
        reason: `Cross-domain language contamination detected for ${graphId}.`,
      });
    }
  }

  // Cross-domain hard rejects when the graph family clearly does not match.
  for (const { pattern, label } of CROSS_DOMAIN_PATTERNS) {
    if (!pattern.test(haystack)) {
      continue;
    }

    if (label === "aws" && !isAwsGraph && !isCloudFamily) {
      issues.push({ term: label, reason: "Unrelated AWS terminology detected." });
    }

    if (label === "web-framework" && input.graph?.category !== "Web Development") {
      if (input.goalCategory !== "Web Development") {
        issues.push({ term: label, reason: "Unrelated web framework terminology detected." });
      }
    }

    if (label === "kubernetes" && input.graph?.id !== "kg-kubernetes" && input.goalCategory !== "DevOps") {
      issues.push({ term: label, reason: "Unrelated Kubernetes terminology detected." });
    }

    if (
      label === "python" &&
      input.graph?.id !== "kg-python" &&
      (input.graph?.id === "kg-sql" ||
        input.graph?.id === "kg-java" ||
        input.graph?.id === "kg-javascript" ||
        input.graph?.id === "kg-typescript" ||
        input.graph?.id === "kg-go")
    ) {
      issues.push({ term: label, reason: "Unrelated Python terminology detected for this curriculum." });
    }
  }

  // Deduplicate by term+reason
  const seen = new Set<string>();
  return issues.filter((issue) => {
    const key = `${issue.term}:${issue.reason}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}
