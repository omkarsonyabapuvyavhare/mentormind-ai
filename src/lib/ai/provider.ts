import type { Decision } from "@/types/decisions";
import type { LearningTwin } from "@/types/learning-twin";

export interface ExplanationProvider {
  enhanceExplanation(decision: Decision, twin: LearningTwin): Promise<string>;
}

/** Returns the engine-generated template explanation without calling an AI API. */
export class TemplateExplanationProvider implements ExplanationProvider {
  async enhanceExplanation(decision: Decision, _twin: LearningTwin): Promise<string> {
    return decision.explanation;
  }
}

export const defaultExplanationProvider: ExplanationProvider =
  new TemplateExplanationProvider();
