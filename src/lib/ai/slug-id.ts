/** Deterministic slug from a human-readable title — no random UUIDs. */
export function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

export function buildMilestoneId(week: number): string {
  return `ms-week-${week}`;
}

export function buildTaskId(
  milestoneId: string,
  topicId: string,
  type: string,
  index: number,
): string {
  return `task-${milestoneId}-${topicId}-${type}-${index + 1}`;
}
