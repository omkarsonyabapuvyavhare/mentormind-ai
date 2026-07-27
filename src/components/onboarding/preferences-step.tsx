"use client";

import { useMemo } from "react";

import { FieldHintBadge } from "@/components/onboarding/field-hint-badge";
import { GlassCard } from "@/components/ui/glass-card";
import { inferFocusAreas } from "@/lib/goals/goal-identity";
import { mapFocusAreasToTopicIds } from "@/lib/onboarding/map-parsed-intent";
import type { OnboardingDraft } from "@/lib/onboarding/onboarding-draft";
import type { LearningFormat } from "@/types/learning-twin";

const formatOptions: Array<{ value: LearningFormat; label: string }> = [
  { value: "video", label: "Video" },
  { value: "reading", label: "Reading" },
  { value: "lab", label: "Hands-on practice" },
  { value: "quiz", label: "Quizzes" },
];

function buildGoalAwareChallengeOptions(draft: OnboardingDraft) {
  const focusAreas =
    draft.recommendedFocusAreas.length > 0
      ? draft.recommendedFocusAreas
      : inferFocusAreas(draft.goalTitle, draft.goalCategory);

  return focusAreas.map((area) => ({
    id: mapFocusAreasToTopicIds([area], draft.goalSlug)[0]!,
    name: area,
  }));
}

export function PreferencesStep({
  draft,
  onFormatsChange,
  onChallengesChange,
}: {
  draft: OnboardingDraft;
  onFormatsChange: (formats: LearningFormat[]) => void;
  onChallengesChange: (topicIds: string[]) => void;
}) {
  const challengeOptions = useMemo(
    () => buildGoalAwareChallengeOptions(draft),
    [draft.goalCategory, draft.goalTitle, draft.recommendedFocusAreas],
  );

  const toggleFormat = (format: LearningFormat) => {
    const current = draft.preferredFormats.value;
    const next = current.includes(format)
      ? current.filter((entry) => entry !== format)
      : [...current, format];
    onFormatsChange(next.length > 0 ? next : [format]);
  };

  const toggleChallenge = (topicId: string) => {
    const current = draft.knownChallengeTopicIds.value;
    const next = current.includes(topicId)
      ? current.filter((entry) => entry !== topicId)
      : [...current, topicId];
    onChallengesChange(next);
  };

  return (
    <GlassCard>
      <h2 className="text-xl font-semibold">Learning preferences</h2>
      <p className="mt-2 text-sm text-muted">
        Tell MentorMind how you learn best and where you expect friction.
      </p>

      <div className="mt-6 space-y-6">
        <div>
          <p className="text-sm text-muted">Preferred formats</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {formatOptions.map((format) => (
              <button
                key={format.value}
                type="button"
                onClick={() => toggleFormat(format.value)}
                className={`rounded-xl px-4 py-2 text-sm ${
                  draft.preferredFormats.value.includes(format.value)
                    ? "bg-cyan-500/20 text-cyan-200"
                    : "bg-white/5 text-muted"
                }`}
              >
                {format.label}
              </button>
            ))}
          </div>
          <FieldHintBadge source={draft.preferredFormats.source} />
        </div>

        <div>
          <p className="text-sm text-muted">Known challenges or topics for extra help (optional)</p>
          <p className="mt-1 text-xs text-muted">
            Suggested from your goal — select any areas where you want extra support.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {challengeOptions.map((topic) => (
              <button
                key={topic.id}
                type="button"
                onClick={() => toggleChallenge(topic.id)}
                className={`rounded-xl px-3 py-2 text-sm ${
                  draft.knownChallengeTopicIds.value.includes(topic.id)
                    ? "bg-amber-400/15 text-amber-100"
                    : "bg-white/5 text-muted"
                }`}
              >
                {topic.name}
              </button>
            ))}
          </div>
          <FieldHintBadge source={draft.knownChallengeTopicIds.source} />
        </div>
      </div>
    </GlassCard>
  );
}
