"use client";

import { useCallback, useState } from "react";
import { ClipboardCopy, Eye, EyeOff, Terminal, Wrench } from "lucide-react";

import type { GeneratedLessonPayload } from "@/lib/learn/lesson-response-schema";
import { Button } from "@/components/ui/button";

interface LessonPracticalBlockProps {
  practicalArtifact: GeneratedLessonPayload["practicalArtifact"];
  handsOnExercise: GeneratedLessonPayload["handsOnExercise"];
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }, [value]);

  return (
    <Button type="button" variant="secondary" size="sm" onClick={handleCopy} className="gap-2">
      <ClipboardCopy className="h-4 w-4" />
      {copied ? "Copied" : label}
    </Button>
  );
}

function ArtifactContent({
  content,
  language,
}: {
  content: string;
  language?: string;
}) {
  const isStructuredText =
    language === "yaml" ||
    language === "sql" ||
    language === "dockerfile" ||
    language === "bash" ||
    language === "python" ||
    language === "javascript" ||
    language === "typescript";

  if (isStructuredText) {
    return (
      <pre className="overflow-x-auto rounded-lg border border-white/10 bg-black/40 p-4 text-sm leading-6 text-cyan-50">
        <code>{content}</code>
      </pre>
    );
  }

  return (
    <pre className="overflow-x-auto rounded-lg border border-white/10 bg-black/30 p-4 text-sm leading-7 whitespace-pre-wrap text-muted">
      {content}
    </pre>
  );
}

export function LessonPracticalBlock({
  practicalArtifact,
  handsOnExercise,
}: LessonPracticalBlockProps) {
  const [showSolution, setShowSolution] = useState(false);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-emerald-200">
            <Terminal className="h-4 w-4" />
            Practical artifact
          </div>
          {practicalArtifact.language ? (
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-xs text-emerald-100">
              {practicalArtifact.language}
            </span>
          ) : null}
        </div>

        <div>
          <p className="text-sm font-medium text-emerald-100">{practicalArtifact.title}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.14em] text-muted">{practicalArtifact.type}</p>
        </div>

        <ArtifactContent content={practicalArtifact.content} language={practicalArtifact.language} />

        <div className="flex flex-wrap gap-2">
          <CopyButton value={practicalArtifact.content} label="Copy artifact" />
        </div>

        {practicalArtifact.expectedOutput ? (
          <div className="rounded-lg border border-emerald-400/10 bg-black/30 p-3">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-emerald-200">Expected output</p>
            <pre className="mt-2 overflow-x-auto text-sm leading-6 whitespace-pre-wrap text-muted">
              {practicalArtifact.expectedOutput}
            </pre>
          </div>
        ) : null}

        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">Explanation</p>
          <p className="mt-1 text-sm leading-7 text-muted">{practicalArtifact.explanation}</p>
        </div>
      </div>

      <div className="rounded-xl border border-violet-400/20 bg-violet-400/5 p-4 space-y-4">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-violet-200">
          <Wrench className="h-4 w-4" />
          Hands-on exercise
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">Instructions</p>
          <ol className="mt-2 list-decimal space-y-2 pl-5">
            {handsOnExercise.instructions.map((instruction) => (
              <li key={instruction} className="text-sm leading-7 text-muted">
                {instruction}
              </li>
            ))}
          </ol>
        </div>

        {handsOnExercise.starterContent ? (
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">Starter content</p>
            <ArtifactContent
              content={handsOnExercise.starterContent}
              language={practicalArtifact.language}
            />
          </div>
        ) : null}

        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">Hints</p>
          <ul className="mt-2 space-y-1">
            {handsOnExercise.hints.map((hint) => (
              <li key={hint} className="text-sm leading-7 text-muted">
                • {hint}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">Expected outcome</p>
          <p className="mt-1 text-sm leading-7 text-muted">{handsOnExercise.expectedOutcome}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setShowSolution((current) => !current)}
            className="gap-2"
          >
            {showSolution ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showSolution ? "Hide solution" : "Show solution"}
          </Button>
        </div>

        {showSolution ? (
          <div className="space-y-3 rounded-lg border border-violet-400/10 bg-violet-400/5 p-3">
            {handsOnExercise.solution ? (
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-violet-200">Solution</p>
                <ArtifactContent
                  content={handsOnExercise.solution}
                  language={practicalArtifact.language}
                />
              </div>
            ) : null}
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-violet-200">Why this works</p>
              <p className="mt-1 text-sm leading-7 text-muted">{handsOnExercise.solutionExplanation}</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
