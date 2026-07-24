/** Central design tokens for MentorMind AI — use these instead of scattered magic values. */
export const theme = {
  layout: {
    pageMaxWidth: "80rem", // max-w-7xl
    contentPadding: "1rem",
    contentPaddingMd: "2rem",
    sectionGap: "1.5rem",
    cardRadius: "1rem",
  },
  typography: {
    pageTitle: "text-2xl font-semibold md:text-3xl",
    sectionTitle: "text-lg font-semibold",
    cardTitle: "text-base font-semibold",
    body: "text-sm leading-7",
    muted: "text-sm text-muted",
    label: "text-xs uppercase tracking-wide text-muted",
  },
  colors: {
    accent: {
      cyan: "#22d3ee",
      blue: "#3b82f6",
      violet: "#8b5cf6",
      emerald: "#10b981",
    },
    risk: {
      low: "#22c55e",
      medium: "#f59e0b",
      high: "#ef4444",
    },
    semantic: {
      success: "emerald",
      warning: "amber",
      error: "red",
      info: "cyan",
    },
    task: {
      lesson: "#3b82f6",
      quiz: "#8b5cf6",
      revision: "#f97316",
      lab: "#06b6d4",
      review: "#64748b",
    },
  },
  riskLevels: {
    low: 30,
    medium: 60,
  },
  badges: {
    task: {
      lesson: "border-blue-400/20 bg-blue-400/10 text-blue-200",
      quiz: "border-violet-400/20 bg-violet-400/10 text-violet-200",
      revision: "border-amber-400/20 bg-amber-400/10 text-amber-200",
      lab: "border-cyan-400/20 bg-cyan-400/10 text-cyan-200",
      review: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
    },
    milestone: {
      completed: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
      current: "border-cyan-400/20 bg-cyan-400/10 text-cyan-200",
      upcoming: "border-white/10 bg-white/5 text-muted",
      delayed: "border-amber-400/20 bg-amber-400/10 text-amber-200",
    },
    risk: {
      low: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
      medium: "border-amber-400/30 bg-amber-400/10 text-amber-300",
      high: "border-red-400/30 bg-red-400/10 text-red-300",
    },
    injected: "border-violet-400/30 bg-violet-400/15 text-violet-100",
    demo: "border-amber-400/30 bg-amber-400/10 text-amber-100",
    success: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
    warning: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  },
  cards: {
    default: "glass-panel rounded-2xl p-5 md:p-6",
    highlight: "glass-panel rounded-2xl p-5 md:p-6 border-cyan-400/25",
    adaptation: "glass-panel rounded-2xl p-5 md:p-6 border-violet-400/25 bg-violet-400/5",
    injected: "rounded-xl border border-violet-400/35 bg-violet-400/10 ring-1 ring-violet-400/20",
    success: "glass-panel rounded-2xl p-5 md:p-6 border-emerald-400/25 bg-emerald-400/5",
    warning: "glass-panel rounded-2xl p-5 md:p-6 border-amber-400/25 bg-amber-400/5",
  },
  statAccent: {
    cyan: "text-cyan-300",
    blue: "text-blue-300",
    violet: "text-violet-300",
    emerald: "text-emerald-300",
    warning: "text-amber-300",
  },
} as const;

export type TaskTypeKey = keyof typeof theme.badges.task;
export type MilestoneStatusKey = keyof typeof theme.badges.milestone;
export type RiskLevelKey = keyof typeof theme.badges.risk;
export type StatAccentKey = keyof typeof theme.statAccent;
