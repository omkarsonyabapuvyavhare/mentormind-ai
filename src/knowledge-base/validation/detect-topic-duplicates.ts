import { slugifyTitle } from "@/lib/ai/slug-id";

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(title: string): Set<string> {
  return new Set(normalizeTitle(title).split(" ").filter((token) => token.length > 2));
}

function nearDuplicate(a: string, b: string): boolean {
  const left = normalizeTitle(a);
  const right = normalizeTitle(b);

  if (!left || !right) {
    return false;
  }

  if (left === right || slugifyTitle(a) === slugifyTitle(b)) {
    return true;
  }

  if (left.includes(right) || right.includes(left)) {
    const shorter = left.length <= right.length ? left : right;
    return shorter.length >= 12;
  }

  const leftTokens = tokens(a);
  const rightTokens = tokens(b);
  if (leftTokens.size < 2 || rightTokens.size < 2) {
    return false;
  }

  let overlap = 0;
  for (const token of leftTokens) {
    if (rightTokens.has(token)) {
      overlap += 1;
    }
  }

  const ratio = overlap / Math.min(leftTokens.size, rightTokens.size);
  return ratio >= 0.85;
}

export interface TopicDuplicateIssue {
  leftIndex: number;
  rightIndex: number;
  leftTitle: string;
  rightTitle: string;
  reason: string;
}

export function detectTopicDuplicates(titles: string[]): TopicDuplicateIssue[] {
  const issues: TopicDuplicateIssue[] = [];

  for (let i = 0; i < titles.length; i += 1) {
    for (let j = i + 1; j < titles.length; j += 1) {
      const left = titles[i] ?? "";
      const right = titles[j] ?? "";
      if (nearDuplicate(left, right)) {
        issues.push({
          leftIndex: i,
          rightIndex: j,
          leftTitle: left,
          rightTitle: right,
          reason: "Duplicate or near-duplicate topic titles.",
        });
      }
    }
  }

  return issues;
}
