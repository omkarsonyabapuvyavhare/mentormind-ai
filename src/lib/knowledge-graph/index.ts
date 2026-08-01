export {
  currentKgValidationVersion,
  hasKgProvenance,
  withKgValidationVersion,
  type KnowledgeGraphProvenance,
} from "@/lib/knowledge-graph/kg-metadata";
export {
  logKgPipelineDev,
  type KgPipelineDevLog,
  type KgPipelineFlow,
} from "@/lib/knowledge-graph/kg-observability";
export {
  buildRoadmapFromKgResult,
  buildRoadmapFromValidatedAiMilestones,
  kgMilestonesToAiMilestones,
} from "@/lib/knowledge-graph/map-kg-roadmap";
export {
  buildTopicAssessmentFromKgQuestions,
  mapKgQuestionToAssessmentQuestion,
} from "@/lib/knowledge-graph/map-kg-assessment";
export {
  ensureKgLessonPassesLiveGates,
  repairKgLessonForLiveGates,
  type EnsuredKgLesson,
} from "@/lib/knowledge-graph/ensure-kg-lesson";
