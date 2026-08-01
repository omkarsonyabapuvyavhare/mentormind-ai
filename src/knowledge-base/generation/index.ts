/** Phase 2 deterministic KG generators — not wired into AI providers yet. */
export {
  buildKgAssessment,
  type BuildKgAssessmentInput,
  type KgAssessmentResult,
} from "@/knowledge-base/generation/build-kg-assessment";
export {
  buildKgLesson,
  type BuildKgLessonInput,
  type KgLessonResult,
} from "@/knowledge-base/generation/build-kg-lesson";
export {
  buildKgRoadmap,
  type BuildKgRoadmapInput,
  type KgProposedGraphDraft,
  type KgRoadmapMilestone,
  type KgRoadmapResult,
  type KgRoadmapTaskDraft,
} from "@/knowledge-base/generation/build-kg-roadmap";
