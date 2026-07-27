/** Lightweight topic-id formatter — keep free of lesson/seed imports for client bundles. */
export function formatTopicTitle(topicId: string): string {
  return topicId
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
