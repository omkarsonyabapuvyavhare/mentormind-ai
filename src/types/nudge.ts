export type NudgeSeverity = "info" | "warning" | "urgent";

export interface Nudge {
  id: string;
  title: string;
  body: string;
  severity: NudgeSeverity;
  createdAt: string;
  read: boolean;
}
