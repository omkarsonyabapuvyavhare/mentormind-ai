import {
  getKnowledgeGraphById,
  KNOWLEDGE_GRAPH_REGISTRY,
} from "@/knowledge-base/registry/knowledge-graph-registry";
import type { KnowledgeGraph } from "@/knowledge-base/schema";
import type { GoalCategory } from "@/lib/goals/goal-identity";
import { slugifyTitle } from "@/lib/ai/slug-id";

export type KnowledgeGraphResolveStatus =
  | "resolved"
  | "unsupported"
  | "ambiguous";

export interface ResolveKnowledgeGraphResult {
  status: KnowledgeGraphResolveStatus;
  graph: KnowledgeGraph | null;
  confidence: number;
  reason: string;
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#.]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text: string): string[] {
  return normalize(text).split(" ").filter(Boolean);
}

/** Exact contiguous phrase match on tokens — never raw substring (java⊄javascript). */
function hasExactPhrase(haystackTokens: string[], phraseTokens: string[]): boolean {
  if (phraseTokens.length === 0) {
    return false;
  }
  if (phraseTokens.length === 1) {
    return haystackTokens.includes(phraseTokens[0]!);
  }

  outer: for (let i = 0; i <= haystackTokens.length - phraseTokens.length; i += 1) {
    for (let j = 0; j < phraseTokens.length; j += 1) {
      if (haystackTokens[i + j] !== phraseTokens[j]) {
        continue outer;
      }
    }
    return true;
  }
  return false;
}

function isShortAlias(aliasNorm: string, aliasTokens: string[]): boolean {
  return aliasNorm.length <= 3 || aliasTokens.every((token) => token.length <= 3);
}

function scoreAlias(
  haystack: string,
  haystackTokens: string[],
  alias: string,
): number {
  const aliasNorm = normalize(alias);
  if (!aliasNorm) {
    return 0;
  }

  if (haystack === aliasNorm) {
    return 1.2;
  }

  const aliasTokens = tokenize(alias);
  if (aliasTokens.length === 0) {
    return 0;
  }

  // Short aliases ("go", "c", "r", "js", "ts", "sql") — whole tokens only.
  if (isShortAlias(aliasNorm, aliasTokens)) {
    return aliasTokens.every((token) => haystackTokens.includes(token)) ? 0.95 : 0;
  }

  if (hasExactPhrase(haystackTokens, aliasTokens)) {
    return aliasTokens.length === 1 ? 1.05 : 0.9;
  }

  // Multi-word aliases only: token overlap (never substring includes).
  if (aliasTokens.length >= 2) {
    const titleSet = new Set(haystackTokens);
    let overlap = 0;
    for (const token of aliasTokens) {
      if (titleSet.has(token)) {
        overlap += 1;
      }
    }
    if (overlap / aliasTokens.length >= 0.7) {
      return 0.55;
    }
  }

  return 0;
}

/**
 * Exclusive language / product cues so Java ≠ JavaScript ≠ Python ≠ Go, etc.
 */
function exclusiveKeywordAdjustments(haystack: string, graphId: string): number {
  let delta = 0;
  const hasJavaScript = /\bjavascript\b/.test(haystack) || /\bjs\b/.test(haystack);
  const hasTypeScript = /\btypescript\b/.test(haystack) || /\bts\b/.test(haystack);
  const hasJava = /\bjava\b/.test(haystack) && !hasJavaScript;
  const hasPython = /\bpython\b/.test(haystack);
  const hasGo =
    /\bgolang\b/.test(haystack) ||
    /\blearn go\b/.test(haystack) ||
    /\bgo programming\b/.test(haystack) ||
    /\bgo language\b/.test(haystack) ||
    (/\bgo\b/.test(haystack) && !/\bgolang\b/.test(haystack) && haystack.split(" ").includes("go"));

  if (hasJava && graphId === "kg-java") delta += 1.1;
  if (hasJava && graphId === "kg-javascript") delta -= 1.6;
  if (hasJava && graphId === "kg-python") delta -= 1.6;
  if (hasJava && graphId === "kg-typescript") delta -= 1.2;

  if (hasJavaScript && graphId === "kg-javascript") delta += 1.1;
  if (hasJavaScript && graphId === "kg-java") delta -= 1.6;
  if (hasJavaScript && graphId === "kg-python") delta -= 1.2;

  if (hasTypeScript && graphId === "kg-typescript") delta += 1.1;
  if (hasTypeScript && graphId === "kg-javascript") delta -= 0.8;
  if (hasTypeScript && graphId === "kg-java") delta -= 1.2;

  if (hasPython && graphId === "kg-python") delta += 1.1;
  if (hasPython && (graphId === "kg-java" || graphId === "kg-javascript")) delta -= 1.6;

  if (hasGo && graphId === "kg-go") delta += 1.1;

  if (/\bsql\b/.test(haystack) && graphId === "kg-sql") delta += 0.9;
  if (/\breact\b/.test(haystack) && graphId === "kg-react") delta += 0.9;
  if (/\b(kubernetes|k8s)\b/.test(haystack) && graphId === "kg-kubernetes") delta += 0.9;
  if (/\bdata engineer/.test(haystack) && graphId === "kg-data-engineering") delta += 0.9;
  if (/\bdata science\b/.test(haystack) && graphId === "kg-data-science") delta += 0.9;
  if (/\bmachine learning\b/.test(haystack) && graphId === "kg-machine-learning") delta += 0.9;
  if (/\bdocker\b/.test(haystack) && graphId === "kg-docker") delta += 0.9;
  if (/\b(aws\s*saa|saa-c03|solutions architect)\b/.test(haystack) && graphId === "kg-aws-saa") {
    delta += 0.9;
  }
  if (/\b(az-?900|azure fundamentals)\b/.test(haystack) && graphId === "kg-azure-az900") {
    delta += 0.9;
  }
  if (/\bsystem design\b/.test(haystack) && graphId === "kg-system-design") delta += 0.9;
  if (/\bcybersecurity\b/.test(haystack) && graphId === "kg-cybersecurity") delta += 0.9;
  if (/\bnext\.?js\b/.test(haystack) && graphId === "kg-nextjs") delta += 0.9;

  return delta;
}

function scoreGraph(
  graph: KnowledgeGraph,
  goalTitle: string,
  goalCategory: GoalCategory,
  extraAliases: string[],
): number {
  const haystack = normalize([goalTitle, ...extraAliases].join(" "));
  const haystackTokens = tokenize(haystack);
  const slug = slugifyTitle(goalTitle);
  let score = 0;

  if (slug === graph.id || slug === graph.id.replace(/^kg-/, "")) {
    score += 1;
  }

  let bestAlias = 0;
  for (const alias of graph.aliases) {
    bestAlias = Math.max(bestAlias, scoreAlias(haystack, haystackTokens, alias));
  }
  score += bestAlias;

  if (graph.category === goalCategory) {
    score += 0.2;
  } else if (
    (goalCategory === "Cloud" || goalCategory === "DevOps") &&
    (graph.category === "Cloud" || graph.category === "DevOps")
  ) {
    score += 0.08;
  } else if (
    (goalCategory === "Data" || goalCategory === "AI / Machine Learning") &&
    (graph.category === "Data" || graph.category === "AI / Machine Learning")
  ) {
    score += 0.08;
  }

  score += exclusiveKeywordAdjustments(haystack, graph.id);

  return score;
}

/**
 * Resolve a knowledge graph from goal title/category/aliases.
 * Never maps unknown goals onto AWS/VPC/unrelated defaults.
 * Uses exact / normalized alias phrases + confidence — not unsafe substrings.
 */
export function resolveKnowledgeGraph(
  goalTitle: string,
  goalCategory: GoalCategory,
  aliases: string[] = [],
): ResolveKnowledgeGraphResult {
  const title = goalTitle.trim();
  if (!title) {
    return {
      status: "unsupported",
      graph: null,
      confidence: 0,
      reason: "Goal title is empty.",
    };
  }

  // Explicit id / slug hints in aliases.
  for (const alias of aliases) {
    const direct = getKnowledgeGraphById(alias) ?? getKnowledgeGraphById(`kg-${alias}`);
    if (direct) {
      return {
        status: "resolved",
        graph: direct,
        confidence: 1,
        reason: `Resolved by explicit graph id alias ${alias}.`,
      };
    }
  }

  const ranked = KNOWLEDGE_GRAPH_REGISTRY.map((graph) => ({
    graph,
    score: scoreGraph(graph, title, goalCategory, aliases),
  })).sort((a, b) => b.score - a.score);

  const top = ranked[0];
  const second = ranked[1];

  if (!top || top.score < 0.75) {
    return {
      status: "unsupported",
      graph: null,
      confidence: top?.score ?? 0,
      reason:
        "No high-confidence knowledge graph for this goal. Refusing unrelated defaults (including AWS/VPC).",
    };
  }

  if (second && top.score - second.score < 0.15 && second.score >= 0.75) {
    return {
      status: "ambiguous",
      graph: null,
      confidence: top.score,
      reason: `Ambiguous between ${top.graph.id} and ${second.graph.id}.`,
    };
  }

  return {
    status: "resolved",
    graph: top.graph,
    confidence: Math.min(1, top.score),
    reason: `Matched ${top.graph.id} from goal title/category.`,
  };
}
