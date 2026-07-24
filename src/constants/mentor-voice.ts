/** One learner question per page — consistent mentor voice across the product. */
export const PAGE_QUESTIONS = {
  dashboard: "What am I learning today?",
  roadmap: "Why is my plan like this?",
  assessment: "Why am I taking this quiz?",
  learningTwin: "What does the AI know about me?",
  mentor: "What is the AI recommending now?",
} as const;

export const MENTOR_VOICE = {
  eyebrow: "Your AI Mentor",
  insightLabels: {
    what: "What",
    why: "Why",
    expectedBenefit: "Expected benefit",
  },
} as const;

export type PageQuestionKey = keyof typeof PAGE_QUESTIONS;
