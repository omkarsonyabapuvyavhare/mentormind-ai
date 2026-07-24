export type AdaptationRevealKind = "weakness" | "mastery" | "neutral";

export interface AdaptationReveal {
  kind: AdaptationRevealKind;
  score: number;
  visible: boolean;
}
