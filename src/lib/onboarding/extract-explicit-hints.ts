import type { StudyTimeOfDay, SkillLevel } from "@/types/learning-twin";
import {
  clampDurationWeeks,
  clampStudyHoursPerWeek,
} from "@/lib/onboarding/parse-intent-schema";

const WORD_TO_NUMBER: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
};

const NUMBER_TOKEN = String.raw`\d+(?:\.\d+)?|(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)`;

function parseNumberToken(token: string): number | undefined {
  const normalized = token.trim().toLowerCase();

  if (/^\d+(?:\.\d+)?$/.test(normalized)) {
    return Number(normalized);
  }

  return WORD_TO_NUMBER[normalized];
}

export function parseExplicitSkillLevel(text: string): SkillLevel | undefined {
  if (/\b(advanced|expert|experienced professional)\b/i.test(text)) {
    return "advanced";
  }

  if (/\b(intermediate|some experience|working knowledge)\b/i.test(text)) {
    return "intermediate";
  }

  if (
    /\b(complete beginner|total beginner|brand new|new to|just starting|little experience|no experience)\b/i.test(
      text,
    )
  ) {
    return "beginner";
  }

  if (/\bbeginner\b/i.test(text)) {
    return "beginner";
  }

  return undefined;
}

export function parseExplicitDurationWeeks(text: string): number | undefined {
  const match = text.match(new RegExp(`(${NUMBER_TOKEN})\\s*(?:weeks?|wk)\\b`, "i"));

  if (!match?.[1]) {
    return undefined;
  }

  const weeks = parseNumberToken(match[1]);

  if (weeks === undefined) {
    return undefined;
  }

  return clampDurationWeeks(weeks);
}

export function parseExplicitStudyHoursPerWeek(text: string): number | undefined {
  const hoursPerDayMatch = text.match(
    new RegExp(`(${NUMBER_TOKEN})\\s*(?:hours?|hrs?|h)\\s*(?:per|\\/|each|every)\\s*day`, "i"),
  );

  if (hoursPerDayMatch?.[1]) {
    const hours = parseNumberToken(hoursPerDayMatch[1]);

    if (hours !== undefined) {
      return clampStudyHoursPerWeek(hours * 7);
    }
  }

  const minutesPerDayMatch = text.match(
    new RegExp(`(${NUMBER_TOKEN})\\s*(?:minutes?|mins?)\\s*(?:per|\\/|each|every)\\s*day`, "i"),
  );

  if (minutesPerDayMatch?.[1]) {
    const minutes = parseNumberToken(minutesPerDayMatch[1]);

    if (minutes !== undefined) {
      return clampStudyHoursPerWeek((minutes / 60) * 7);
    }
  }

  const perWeekMatch = text.match(
    new RegExp(`(${NUMBER_TOKEN})\\s*(?:hours?|hrs?|h)\\s*(?:per|\\/|each|every)\\s*week`, "i"),
  );

  if (perWeekMatch?.[1]) {
    const hours = parseNumberToken(perWeekMatch[1]);

    if (hours !== undefined) {
      return clampStudyHoursPerWeek(hours);
    }
  }

  const canStudyMatch = text.match(
    new RegExp(`(?:can study|study)\\s+(${NUMBER_TOKEN})\\s*(?:hours?|hrs?|h)`, "i"),
  );

  if (canStudyMatch?.[1]) {
    const hours = parseNumberToken(canStudyMatch[1]);

    if (hours !== undefined) {
      return clampStudyHoursPerWeek(hours);
    }
  }

  const dailyHourMatch = text.match(
    new RegExp(`(?:study|learn)\\s+(${NUMBER_TOKEN})\\s*(?:hours?|hrs?|h)\\s*(?:a|each|every)\\s*day`, "i"),
  );

  if (dailyHourMatch?.[1]) {
    const hours = parseNumberToken(dailyHourMatch[1]);

    if (hours !== undefined) {
      return clampStudyHoursPerWeek(hours * 7);
    }
  }

  const oneHourDailyMatch = text.match(/\bone hour\b.*\b(?:evening|morning|afternoon|day)\b/i);

  if (oneHourDailyMatch) {
    return clampStudyHoursPerWeek(7);
  }

  return undefined;
}

export function parseExplicitStudyTimeOfDay(text: string): StudyTimeOfDay | undefined {
  if (/\b(evening|nights?|after work)\b/i.test(text)) {
    return "evening";
  }

  if (/\b(morning|before work)\b/i.test(text)) {
    return "morning";
  }

  if (/\b(afternoon)\b/i.test(text)) {
    return "afternoon";
  }

  return undefined;
}
