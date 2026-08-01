export {
  detectDomainContamination,
  type DomainContaminationIssue,
} from "@/knowledge-base/validation/detect-domain-contamination";
export {
  detectTopicDuplicates,
  type TopicDuplicateIssue,
} from "@/knowledge-base/validation/detect-topic-duplicates";
export {
  KG_MIN_QUESTION_TYPES,
  KG_MIN_UNIQUE_CONCEPTS,
  KG_REQUIRED_ASSESSMENT_QUESTIONS,
  validateAssessmentAgainstKg,
  type AssessmentKgValidationResult,
} from "@/knowledge-base/validation/validate-assessment-against-kg";
export {
  countLessonKnowledgeChecks,
  validateLessonAgainstKg,
  type LessonKgValidationResult,
} from "@/knowledge-base/validation/validate-lesson-against-kg";
export {
  validateRoadmapAgainstKg,
  type NormalizedKgRoadmapTopic,
  type RoadmapKgValidationResult,
  type RoadmapTopicInput,
} from "@/knowledge-base/validation/validate-roadmap-against-kg";
