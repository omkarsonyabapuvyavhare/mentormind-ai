import type { KnowledgeGraph, KnowledgeTopic } from "@/knowledge-base/schema";
import { slugifyTitle } from "@/lib/ai/slug-id";

export interface TopicMatchResult {
  topic: KnowledgeTopic | null;
  confidence: number;
  reason: string;
}

const HIGH_CONFIDENCE = 0.78;

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text: string): string[] {
  return normalize(text).split(" ").filter((token) => token.length > 0);
}

function tokenSet(text: string): Set<string> {
  return new Set(tokenize(text).filter((token) => token.length > 1));
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) {
    return 0;
  }

  let intersection = 0;
  for (const token of a) {
    if (b.has(token)) {
      intersection += 1;
    }
  }

  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

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

/**
 * If the query names a language/product that does not belong to this graph,
 * refuse the match (prevents Java titles resolving onto Python topics via "data types").
 */
function hasConflictingDomainHint(input: string, graph: KnowledgeGraph): boolean {
  const n = normalize(input);
  const rules: Array<{ hint: RegExp; allowedGraphIds: string[] }> = [
    {
      hint: /\bpython\b/,
      allowedGraphIds: [
        "kg-python",
        "kg-pandas",
        "kg-numpy",
        "kg-data-science",
        "kg-machine-learning",
        "kg-deep-learning",
        "kg-data-engineering",
        "kg-statistics",
      ],
    },
    { hint: /\bjava\b(?!script)/, allowedGraphIds: ["kg-java"] },
    {
      hint: /\bjavascript\b/,
      allowedGraphIds: [
        "kg-javascript",
        "kg-typescript",
        "kg-react",
        "kg-nextjs",
        "kg-vue",
        "kg-angular",
        "kg-html",
        "kg-css",
      ],
    },
    {
      hint: /\btypescript\b/,
      allowedGraphIds: ["kg-typescript", "kg-react", "kg-nextjs", "kg-angular", "kg-javascript"],
    },
    { hint: /\bgolang\b|\bgo programming\b|\bgo language\b|(?:^| )go(?: |$)/, allowedGraphIds: ["kg-go"] },
    { hint: /\brust\b/, allowedGraphIds: ["kg-rust"] },
    { hint: /\bc#\b|\bcsharp\b|\bdotnet\b/, allowedGraphIds: ["kg-csharp"] },
    { hint: /\bsql\b/, allowedGraphIds: ["kg-sql", "kg-data-engineering", "kg-data-science"] },
    { hint: /\breact\b/, allowedGraphIds: ["kg-react", "kg-nextjs"] },
    { hint: /\b(kubernetes|k8s)\b/, allowedGraphIds: ["kg-kubernetes"] },
  ];

  for (const rule of rules) {
    if (rule.hint.test(n) && !rule.allowedGraphIds.includes(graph.id)) {
      return true;
    }
  }
  return false;
}

function scoreCandidate(
  normalizedInput: string,
  inputTokens: string[],
  slug: string,
  topic: KnowledgeTopic,
  candidate: string,
): number {
  const candidateNorm = normalize(candidate);
  const candidateSlug = slugifyTitle(candidate);
  const candidateTokens = tokenize(candidate);

  if (!candidateNorm) {
    return 0;
  }

  if (normalizedInput === candidateNorm || slug === candidateSlug || slug === topic.id) {
    return 1;
  }

  // Short / generic single-token aliases need whole-token equality only.
  if (candidateTokens.length === 1 && candidateNorm.length <= 3) {
    return inputTokens.includes(candidateNorm) ? 0.88 : 0;
  }

  if (hasExactPhrase(inputTokens, candidateTokens)) {
    // Prefer longer, more specific candidates over generic phrases like "data types".
    const specificity = Math.min(0.12, candidateTokens.length * 0.03 + candidateNorm.length / 400);
    return Math.min(0.96, 0.82 + specificity);
  }

  if (candidateTokens.length >= 2) {
    const set = new Set(inputTokens);
    const overlap = candidateTokens.filter((token) => set.has(token)).length;
    if (overlap === candidateTokens.length) {
      return Math.min(0.93, 0.78 + overlap * 0.04);
    }
    if (overlap / candidateTokens.length >= 0.7) {
      return 0.72 + (overlap / candidateTokens.length) * 0.12;
    }
  }

  const overlap = jaccard(tokenSet(normalizedInput), tokenSet(candidateNorm));
  if (overlap >= 0.65 && candidateTokens.length >= 2) {
    return Math.min(0.9, 0.68 + overlap * 0.25);
  }

  return 0;
}

/**
 * High-confidence topic mapping only.
 * Never invents a default unrelated topic when confidence is low.
 * Uses phrase/token matching — not unsafe substrings (java⊄javascript).
 */
export function matchTopic(graph: KnowledgeGraph, aiTopicTitle: string): TopicMatchResult {
  const raw = aiTopicTitle.trim();
  if (!raw) {
    return { topic: null, confidence: 0, reason: "Empty topic title." };
  }

  if (hasConflictingDomainHint(raw, graph)) {
    return {
      topic: null,
      confidence: 0,
      reason: `Topic title conflicts with knowledge graph ${graph.id} domain.`,
    };
  }

  const normalized = normalize(raw);
  const slug = slugifyTitle(raw);
  const inputTokens = tokenize(raw);

  let best: { topic: KnowledgeTopic; confidence: number; reason: string } | null = null;

  for (const topic of graph.topics) {
    const candidates = [topic.title, topic.id, ...topic.aliases];

    for (const candidate of candidates) {
      const confidence = scoreCandidate(normalized, inputTokens, slug, topic, candidate);
      if (confidence <= 0) {
        continue;
      }

      if (confidence >= 1) {
        return {
          topic,
          confidence: 1,
          reason: `Exact match against ${candidate}`,
        };
      }

      if (!best || confidence > best.confidence) {
        best = {
          topic,
          confidence,
          reason: `Phrase/token match against ${candidate}`,
        };
      }
    }
  }

  if (!best || best.confidence < HIGH_CONFIDENCE) {
    return {
      topic: null,
      confidence: best?.confidence ?? 0,
      reason: best
        ? `Best candidate below high-confidence threshold (${best.confidence.toFixed(2)}).`
        : "No candidate topic found.",
    };
  }

  return best;
}

export const TOPIC_MATCH_HIGH_CONFIDENCE = HIGH_CONFIDENCE;
