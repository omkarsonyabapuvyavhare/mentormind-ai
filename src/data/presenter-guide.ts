export const presenterGuideSteps = [
  {
    step: 1,
    title: "Initialize learner",
    say: "MentorMind starts with a structured AWS certification learner already making progress toward SAA-C03.",
    click: "Run Next Step",
    show: ["Dashboard", "Learning Twin"],
    takeaway: "The product opens on a credible learner dashboard — not an empty shell.",
    routes: [
      { label: "View Dashboard", href: "/dashboard" },
      { label: "View Learning Twin", href: "/profile" },
    ],
  },
  {
    step: 2,
    title: "Simulate 42% quiz failure",
    say: "The learner scored 42% in VPC Networking — below the mastery threshold.",
    click: "Run Next Step",
    show: ["Roadmap", "Learning Twin", "AI Mentor"],
    takeaway: "The AI does not just record the score — it changes the learning journey.",
    routes: [
      { label: "View Dashboard", href: "/dashboard" },
      { label: "View Roadmap", href: "/roadmap" },
      { label: "View Learning Twin", href: "/profile" },
      { label: "View AI Mentor", href: "/mentor" },
    ],
  },
  {
    step: 3,
    title: "Simulate 3-day inactivity",
    say: "After three days away, MentorMind detects disengagement risk.",
    click: "Run Next Step",
    show: ["Dashboard", "AI Mentor"],
    takeaway: "The system shortens the next session and sends a contextual nudge before dropout risk rises further.",
    routes: [
      { label: "View Dashboard", href: "/dashboard" },
      { label: "View AI Mentor", href: "/mentor" },
      { label: "View Learning Twin", href: "/profile" },
    ],
  },
  {
    step: 4,
    title: "Simulate 95% mastery",
    say: "After remediation, the learner demonstrates mastery with a 95% VPC score.",
    click: "Run Next Step",
    show: ["Roadmap", "Learning Twin", "AI Mentor"],
    takeaway: "MentorMind removes remedial work, unlocks advanced content, and accelerates the roadmap.",
    routes: [
      { label: "View Dashboard", href: "/dashboard" },
      { label: "View Roadmap", href: "/roadmap" },
      { label: "View Learning Twin", href: "/profile" },
      { label: "View AI Mentor", href: "/mentor" },
    ],
  },
] as const;

export const demoStepSummaries = [
  "Creates the AWS SAA learner, roadmap, and PPT-aligned dashboard baseline.",
  "VPC marked weak · 2 revision tasks · 1 lab · milestone delayed · explanation generated.",
  "Risk increased · next session shortened · contextual nudge generated.",
  "VPC marked strong · pending revision removed · advanced content unlocked · roadmap accelerated.",
] as const;

export const demoStepEffects = [
  "68% completion · 12-day streak · VPC Lab as next task · low dropout risk",
  "VPC weakness · 3 injected tasks · milestone +3 days · roadmap version increases",
  "Streak resets · dropout risk rises · next task shortened · nudge sent",
  "VPC moves to strengths · remedial tasks removed · HA unlocked · roadmap accelerated 2 days",
] as const;
