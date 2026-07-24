"use client";

import Link from "next/link";
import { useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Map,
  LayoutDashboard,
  Sparkles,
  UserRound,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { SectionStack } from "@/components/shared/page-container";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { theme } from "@/constants/theme";
import {
  demoStepEffects,
  demoStepSummaries,
  presenterGuideSteps,
} from "@/data/presenter-guide";
import { demoSteps } from "@/data/demo-script";
import { routes } from "@/constants/routes";
import {
  selectDashboardMetrics,
  selectInjectedRemedialTaskCount,
  selectWeakTopics,
} from "@/stores/selectors";
import { useAppStore } from "@/stores/use-app-store";

const DEMO_TIMESTAMP = "2026-07-17T09:00:00.000Z";

const routeIcons = {
  [routes.dashboard]: LayoutDashboard,
  [routes.roadmap]: Map,
  [routes.profile]: UserRound,
  [routes.mentor]: Sparkles,
} as const;

export function DemoView() {
  const state = useAppStore();
  const metrics = selectDashboardMetrics(state);
  const runNextDemoStep = useAppStore((store) => store.runNextDemoStep);
  const runAllDemoSteps = useAppStore((store) => store.runAllDemoSteps);
  const resetDemo = useAppStore((store) => store.resetDemo);
  const [showDetails, setShowDetails] = useState(false);
  const [showPresenterGuide, setShowPresenterGuide] = useState(true);

  const handleReset = () => {
    const confirmed = window.confirm(
      "Reset the demo to the initial AWS learner state? All adaptation progress will be cleared.",
    );
    if (confirmed) {
      resetDemo(DEMO_TIMESTAMP);
    }
  };

  const currentGuide = presenterGuideSteps[Math.min(state.demoStepIndex, presenterGuideSteps.length - 1)];

  return (
    <AppShell
      title="Recovery Panel"
      subtitle="Backup demo controls — use the in-app loop on Dashboard for live presentations."
    >
      <SectionStack>
          <GlassCard className={theme.cards.highlight}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <Badge className={theme.badges.demo}>Presenter mode</Badge>
                <p className="mt-3 text-sm text-muted">Current demo step</p>
                <p className="mt-1 text-3xl font-semibold tracking-tight text-cyan-300">
                  {Math.min(state.demoStepIndex + 1, demoSteps.length)} / {demoSteps.length}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => runNextDemoStep(DEMO_TIMESTAMP)}>Run Next Step</Button>
                <Button variant="secondary" onClick={() => runAllDemoSteps(DEMO_TIMESTAMP)}>
                  Run Full Demo
                </Button>
                <Button variant="destructive" onClick={handleReset}>
                  Reset Demo
                </Button>
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <button
              type="button"
              className="flex w-full items-center justify-between text-left"
              onClick={() => setShowPresenterGuide((value) => !value)}
              aria-expanded={showPresenterGuide}
            >
              <span className="text-lg font-semibold">Presenter Guide</span>
              {showPresenterGuide ? (
                <ChevronUp className="h-5 w-5 text-muted" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted" />
              )}
            </button>
            {showPresenterGuide ? (
              <div className="mt-5 space-y-4">
                {presenterGuideSteps.map((guide) => {
                  const isCurrent = state.demoStepIndex === guide.step - 1;
                  const isComplete = state.demoStepIndex > guide.step - 1;

                  return (
                    <div
                      key={guide.step}
                      className={`rounded-xl border px-4 py-4 ${
                        isCurrent
                          ? "border-cyan-400/30 bg-cyan-400/5"
                          : "border-white/10 bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          Step {guide.step}: {guide.title}
                        </p>
                        {isComplete ? (
                          <Badge className={theme.badges.success}>Done</Badge>
                        ) : null}
                        {isCurrent ? (
                          <Badge className="border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
                            Current
                          </Badge>
                        ) : null}
                      </div>
                      <dl className="mt-3 space-y-2 text-sm">
                        <div>
                          <dt className="text-muted">Say</dt>
                          <dd className="mt-1">&ldquo;{guide.say}&rdquo;</dd>
                        </div>
                        <div>
                          <dt className="text-muted">Click</dt>
                          <dd className="mt-1">{guide.click}</dd>
                        </div>
                        <div>
                          <dt className="text-muted">Show</dt>
                          <dd className="mt-1">{guide.show.join(" · ")}</dd>
                        </div>
                        <div>
                          <dt className="text-muted">Judge takeaway</dt>
                          <dd className="mt-1">{guide.takeaway}</dd>
                        </div>
                      </dl>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </GlassCard>

          {currentGuide ? (
            <GlassCard className={theme.cards.adaptation}>
              <p className="text-sm uppercase tracking-wide text-violet-200">Recommended next</p>
              <p className="mt-2 text-sm leading-7">{currentGuide.takeaway}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {currentGuide.routes.map((route) => {
                  const Icon = routeIcons[route.href as keyof typeof routeIcons];
                  return (
                    <Button key={route.href} asChild size="sm" variant="secondary">
                      <Link href={route.href}>
                        {Icon ? <Icon className="h-4 w-4" /> : null}
                        {route.label}
                      </Link>
                    </Button>
                  );
                })}
              </div>
            </GlassCard>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Snapshot label="Roadmap version" value={`v${metrics.roadmapVersion}`} />
            <Snapshot label="Dropout risk" value={`${metrics.dropoutRisk}`} />
            <Snapshot label="Decisions" value={`${state.decisions.length}`} />
            <Snapshot label="Nudges" value={`${state.nudges.length}`} />
            <Snapshot
              label="Injected remedial tasks"
              value={`${selectInjectedRemedialTaskCount(state)}`}
            />
            <Snapshot
              label="Weak topics"
              value={
                selectWeakTopics(state)
                  .map((topic) => topic.topicName)
                  .join(", ") || "None"
              }
            />
          </div>

          <GlassCard>
            <h2 className="text-lg font-semibold">Demo script</h2>
            <ol className="mt-5 space-y-4">
              {demoSteps.map((step, index) => {
                const completed = state.demoStepIndex > index;
                const current = state.demoStepIndex === index;
                const Icon = completed ? CheckCircle2 : Circle;
                const guide = presenterGuideSteps[index];

                return (
                  <li
                    key={step.id}
                    className={`rounded-xl border px-4 py-4 ${
                      current ? "border-cyan-400/30 bg-cyan-400/5" : "border-white/10 bg-white/5"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon
                        className={`mt-0.5 h-5 w-5 shrink-0 ${
                          completed ? "text-emerald-300" : "text-muted"
                        }`}
                      />
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">
                            Step {index + 1}: {step.label}
                          </p>
                          {current ? (
                            <Badge className="border-cyan-400/20 bg-cyan-400/10 text-cyan-200">
                              Current
                            </Badge>
                          ) : null}
                        </div>
                        <p className="text-sm text-muted">{demoStepSummaries[index]}</p>
                        <p className="text-sm">
                          <span className="text-muted">Visible effect: </span>
                          {demoStepEffects[index]}
                        </p>
                        {guide ? (
                          <div className="flex flex-wrap gap-2">
                            {guide.routes.map((route) => (
                              <Button key={route.href} asChild size="sm" variant="ghost">
                                <Link href={route.href}>{route.label}</Link>
                              </Button>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </GlassCard>

          <GlassCard>
            <button
              type="button"
              className="flex w-full items-center justify-between text-left"
              onClick={() => setShowDetails((value) => !value)}
              aria-expanded={showDetails}
            >
              <span className="text-lg font-semibold">Developer Details</span>
              {showDetails ? (
                <ChevronUp className="h-5 w-5 text-muted" />
              ) : (
                <ChevronDown className="h-5 w-5 text-muted" />
              )}
            </button>
            {showDetails ? (
              <pre className="mt-4 overflow-x-auto rounded-xl bg-black/30 p-4 text-xs text-cyan-100">
                {JSON.stringify(
                  {
                    demoStepIndex: state.demoStepIndex,
                    decisions: state.decisions,
                    nudges: state.nudges,
                    learnerEvents: state.learnerEvents,
                  },
                  null,
                  2,
                )}
              </pre>
            ) : null}
          </GlassCard>
        </SectionStack>
    </AppShell>
  );
}

function Snapshot({ label, value }: { label: string; value: string }) {
  return (
    <GlassCard>
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 line-clamp-2 text-xl font-semibold">{value}</p>
    </GlassCard>
  );
}
