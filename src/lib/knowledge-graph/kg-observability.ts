/**
 * Development-only Knowledge Graph pipeline logs.
 * Never logs API keys or raw provider secrets.
 */

export type KgPipelineFlow = "roadmap" | "lesson" | "assessment";

export interface KgPipelineDevLog {
  flow: KgPipelineFlow;
  providersTried?: string[];
  providerAccepted?: string | null;
  finalSource?: string | null;
  knowledgeGraphId?: string | null;
  kgConfidence?: number | null;
  canonicalTopics?: string[];
  canonicalTopicId?: string | null;
  conceptsCovered?: string[];
  conceptsMissing?: string[];
  diversityOk?: boolean;
  uniqueConceptCount?: number;
  questionTypes?: string[];
  reasons?: string[];
  goalId?: string;
  topicId?: string;
}

function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}

export function logKgPipelineDev(payload: KgPipelineDevLog): void {
  if (!isDevelopment()) {
    return;
  }

  console.info(`[kg-pipeline:${payload.flow}:dev]`, {
    providersTried: payload.providersTried,
    providerAccepted: payload.providerAccepted ?? null,
    finalSource: payload.finalSource,
    knowledgeGraphId: payload.knowledgeGraphId ?? null,
    kgConfidence: payload.kgConfidence ?? null,
    canonicalTopics: payload.canonicalTopics,
    canonicalTopicId: payload.canonicalTopicId ?? null,
    conceptsCovered: payload.conceptsCovered,
    conceptsMissing: payload.conceptsMissing,
    diversityOk: payload.diversityOk,
    uniqueConceptCount: payload.uniqueConceptCount,
    questionTypes: payload.questionTypes,
    reasons: payload.reasons,
    goalId: payload.goalId,
    topicId: payload.topicId,
  });
}
