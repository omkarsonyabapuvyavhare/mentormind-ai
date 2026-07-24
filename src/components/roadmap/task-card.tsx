"use client";

import { Lock, Sparkles, Unlock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { theme, type TaskTypeKey } from "@/constants/theme";
import { cn } from "@/lib/utils";
import type { LearningTask } from "@/types/roadmap";

export function TaskCard({ task, emphasize = false }: { task: LearningTask; emphasize?: boolean }) {
  const locked = !task.unlocked;
  const completed = task.status === "completed";
  const injected = Boolean(task.injectedBy);
  const isAdvancedUnlock =
    task.topicId === "high-availability" && task.unlocked && task.type === "lesson";

  return (
    <li
      className={cn(
        "flex flex-col gap-3 rounded-xl border px-4 py-3 transition-subtle sm:flex-row sm:items-center sm:justify-between",
        injected && !completed && theme.cards.injected,
        emphasize && "animate-task-in ring-1 ring-violet-400/30",
        completed && "border-emerald-400/25 bg-emerald-400/5",
        !injected && !completed && locked && "border-white/5 bg-white/[0.02] opacity-70",
        !injected && !completed && !locked && "border-white/10 bg-white/5",
        isAdvancedUnlock && "border-emerald-400/30 bg-emerald-400/10",
      )}
    >
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium">{task.title}</p>
          {injected ? (
            <Badge className={theme.badges.injected}>
              <Sparkles className="mr-1 h-3 w-3" />
              Added by MentorMind
            </Badge>
          ) : null}
          {isAdvancedUnlock ? (
            <Badge className={theme.badges.success}>
              <Unlock className="mr-1 h-3 w-3" />
              Unlocked after mastery
            </Badge>
          ) : null}
          {locked ? (
            <Badge className="border-white/10 bg-white/5 text-muted">
              <Lock className="mr-1 h-3 w-3" />
              Locked
            </Badge>
          ) : null}
        </div>
        <p className="mt-1 text-sm text-muted">{task.estimatedMinutes} minutes</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge className={theme.badges.task[task.type as TaskTypeKey]}>{task.type}</Badge>
        <Badge className="border-white/10 bg-white/5 capitalize text-muted">{task.status}</Badge>
      </div>
    </li>
  );
}
