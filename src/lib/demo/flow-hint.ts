export type DemoFlowHint = "adapt-seen" | "twin-seen" | "explain-seen";

const FLOW_ORDER: DemoFlowHint[] = ["adapt-seen", "twin-seen", "explain-seen"];

export function shouldAdvanceFlowCheckpoint(
  current: DemoFlowHint | null,
  next: DemoFlowHint,
): boolean {
  const currentIndex = current ? FLOW_ORDER.indexOf(current) : -1;
  const nextIndex = FLOW_ORDER.indexOf(next);
  return nextIndex > currentIndex;
}
