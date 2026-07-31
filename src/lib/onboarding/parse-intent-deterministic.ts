import { awsSaaGoal, awsSaaTopics } from "@/data/aws-saa-seed";
import {
  AWS_CERTIFICATION_SLUG,
  classifyGoalCategory,
  detectGoalType,
  inferFocusAreas,
  resolveGoalIdentityFromText,
} from "@/lib/goals/goal-identity";
import type { ParsedGoalIntent } from "@/lib/onboarding/parse-intent-schema";
import {
  clampDurationWeeks,
  clampParsedGoalIntent,
  clampStudyHoursPerWeek,
} from "@/lib/onboarding/parse-intent-schema";
import type { GoalCategory } from "@/lib/goals/goal-identity";
import type { SkillLevel } from "@/types/learning-twin";

const AWS_FOCUS_AREA_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /\bvpc\b|virtual private cloud/i, label: "VPC Networking" },
  { pattern: /\bec2\b|compute/i, label: "EC2" },
  { pattern: /\bs3\b|storage/i, label: "S3" },
  { pattern: /\biam\b|identity/i, label: "IAM" },
];

function normalizeWhitespace(text: string): string {
  return text.trim().replace(/\s+/g, " ");
}

function parseSkillLevel(text: string): SkillLevel {
  if (/\b(advanced|expert|experienced professional)\b/i.test(text)) {
    return "advanced";
  }

  if (/\b(intermediate|some experience|working knowledge)\b/i.test(text)) {
    return "intermediate";
  }

  if (/\b(beginner|basic|fundamental|new to|just starting|little experience)\b/i.test(text)) {
    return "beginner";
  }

  return "intermediate";
}

function parseDurationWeeks(text: string): number | undefined {
  const match = text.match(/(\d+)\s*(?:weeks?|wk)\b/i);
  if (!match) {
    return undefined;
  }

  return clampDurationWeeks(Number(match[1]));
}

function parseStudyHoursPerWeek(text: string): number | undefined {
  const hoursPerDayMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h)\s*(?:per|\/|each|every)\s*day/i);
  if (hoursPerDayMatch) {
    return clampStudyHoursPerWeek(Number(hoursPerDayMatch[1]) * 7);
  }

  const minutesPerDayMatch = text.match(/(\d+)\s*(?:minutes?|mins?)\s*(?:per|\/|each|every)\s*day/i);
  if (minutesPerDayMatch) {
    return clampStudyHoursPerWeek(Number(minutesPerDayMatch[1]) / 60 * 7);
  }

  const perWeekMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h)\s*(?:per|\/|each|every)\s*week/i);
  if (perWeekMatch) {
    return clampStudyHoursPerWeek(Number(perWeekMatch[1]));
  }

  const dailyHourMatch = text.match(/(?:study|learn)\s+(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h)\s*(?:a|each|every)\s*day/i);
  if (dailyHourMatch) {
    return clampStudyHoursPerWeek(Number(dailyHourMatch[1]) * 7);
  }

  return undefined;
}

function extractGoalTitle(text: string): string {
  const wantMatch = text.match(/(?:i want to|i'd like to|help me|my goal is to)\s+(.+?)(?:\.|$)/i);
  if (wantMatch?.[1]) {
    return wantMatch[1].trim();
  }

  return text.slice(0, 120).trim();
}

function extractAwsFocusAreas(text: string): string[] {
  const matches = AWS_FOCUS_AREA_PATTERNS.filter(({ pattern }) => pattern.test(text)).map(
    ({ label }) => label,
  );

  if (matches.length > 0) {
    return matches;
  }

  return awsSaaTopics.slice(0, 4).map((topic) => topic.name);
}

function isAwsIntent(text: string, goalSlug: string): boolean {
  return (
    goalSlug === AWS_CERTIFICATION_SLUG ||
    /\b(aws|amazon web services|solutions architect|saa-c03|saa c03)\b/i.test(text)
  );
}

function categoryToDomain(category: GoalCategory): string {
  if (category === "Unknown") {
    return "Professional Development";
  }

  return category;
}

function buildParsedIntentFromText(text: string): ParsedGoalIntent {
  const goalTitle = extractGoalTitle(text);
  const identity = resolveGoalIdentityFromText(goalTitle, text);
  const goalCategory = classifyGoalCategory(`${goalTitle} ${text}`) || identity.goalCategory;
  const goalType = detectGoalType(text);
  const durationWeeks = parseDurationWeeks(text) ?? 8;
  const studyHoursPerWeek = parseStudyHoursPerWeek(text) ?? 7;
  const currentSkillLevel = parseSkillLevel(text);

  let targetOutcome = "Reach a structured learning outcome for this goal";
  if (goalType === "Certification") {
    targetOutcome = `Prepare for ${identity.goalTitle}`;
  } else if (/\bmaster\b/i.test(text)) {
    targetOutcome = `Master ${identity.goalTitle}`;
  } else if (/\bbecome\b/i.test(text)) {
    targetOutcome = `Become proficient in ${identity.goalTitle}`;
  }

  const recommendedFocusAreas = isAwsIntent(text, identity.goalSlug)
    ? extractAwsFocusAreas(text)
    : inferFocusAreas(identity.goalTitle, goalCategory);

  return clampParsedGoalIntent({
    goal: identity.goalTitle,
    domain: categoryToDomain(goalCategory),
    goalCategory,
    goalType,
    currentSkillLevel,
    targetOutcome,
    durationWeeks,
    studyHoursPerWeek,
    recommendedFocusAreas,
  });
}

/** Pure offline parser — no network, no API key required. */
export function parseGoalIntentDeterministic(text: string): ParsedGoalIntent | null {
  const normalized = normalizeWhitespace(text);

  if (!normalized) {
    return null;
  }

  return buildParsedIntentFromText(normalized);
}

export function buildDefaultParsedIntent(): ParsedGoalIntent {
  return clampParsedGoalIntent({
    goal: "Personal learning goal",
    domain: "General Technology",
    goalCategory: "General Technology",
    goalType: "Skill",
    currentSkillLevel: "beginner",
    targetOutcome: "Reach a structured learning outcome for this goal",
    durationWeeks: 8,
    studyHoursPerWeek: 6,
    recommendedFocusAreas: [
      "Goal Fundamentals",
      "Core Techniques",
      "Practical Workflows",
      "Applied Project",
    ],
  });
}
