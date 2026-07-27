export const appConfig = {
  name: "MentorMind AI",
  description: "AI-powered Personal Learning Agent",
  defaultGoalWeeks: 8,
  storageKeys: {
    twin: "mentormind-twin",
    roadmap: "mentormind-roadmap",
    mentor: "mentormind-mentor",
    app: "mentormind-app",
  },
  features: {
    aiExplanationsEnabled: false,
    presenterModeEnabled: true,
  },
} as const;
