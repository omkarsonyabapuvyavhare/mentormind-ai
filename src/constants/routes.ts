export const routes = {
  home: "/",
  onboarding: "/onboarding",
  onboardingLoading: "/onboarding/loading",
  dashboard: "/dashboard",
  lesson: (topicId: string) => `/learn/${topicId}`,
  roadmap: "/roadmap",
  assessment: "/assessment",
  assessmentVpc: "/assessment/vpc-networking",
  assessmentTopic: (topicId: string) => `/assessment/${topicId}`,
  mentor: "/mentor",
  mentorFeedback: "/mentor/feedback",
  planUpdated: "/plan-updated",
  profile: "/profile",
  demo: "/demo",
} as const;

export type AppRoute = (typeof routes)[keyof typeof routes];

export const publicRoutes: AppRoute[] = [
  routes.home,
  routes.onboarding,
  routes.onboardingLoading,
  routes.demo,
];
