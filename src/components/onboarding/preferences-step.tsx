"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { awsSaaTopics } from "@/data/aws-saa-seed";
import type { OnboardingInput } from "@/lib/onboarding/schema";
import type { LearningFormat, StudyTimeOfDay } from "@/types/learning-twin";

const studyTimes: StudyTimeOfDay[] = ["morning", "afternoon", "evening"];
const formats: LearningFormat[] = ["video", "reading", "lab", "quiz"];

export function PreferencesStep({
  input,
  onChange,
}: {
  input: OnboardingInput;
  onChange: (patch: Partial<OnboardingInput>) => void;
}) {
  const toggleFormat = (format: LearningFormat) => {
    const next = input.preferredFormats.includes(format)
      ? input.preferredFormats.filter((entry) => entry !== format)
      : [...input.preferredFormats, format];
    onChange({ preferredFormats: next.length > 0 ? next : [format] });
  };

  const toggleChallenge = (topicId: string) => {
    const next = input.knownChallengeTopicIds.includes(topicId)
      ? input.knownChallengeTopicIds.filter((entry) => entry !== topicId)
      : [...input.knownChallengeTopicIds, topicId];
    onChange({ knownChallengeTopicIds: next });
  };

  return (
    <GlassCard>
      <h2 className="text-xl font-semibold">Learning preferences</h2>
      <p className="mt-2 text-sm text-muted">
        Tell MentorMind how you learn best and where you expect friction.
      </p>

      <div className="mt-6 space-y-6">
        <div>
          <p className="text-sm text-muted">Preferred study time</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {studyTimes.map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => onChange({ studyTimeOfDay: time })}
                className={`rounded-xl px-4 py-2 text-sm capitalize ${
                  input.studyTimeOfDay === time
                    ? "bg-cyan-500/20 text-cyan-200"
                    : "bg-white/5 text-muted"
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        <label className="block">
          <span className="text-sm text-muted">Focus duration (minutes)</span>
          <input
            type="number"
            min={15}
            max={120}
            value={input.focusDurationMinutes}
            onChange={(event) => onChange({ focusDurationMinutes: Number(event.target.value) })}
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3"
          />
        </label>

        <div>
          <p className="text-sm text-muted">Preferred formats</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {formats.map((format) => (
              <button
                key={format}
                type="button"
                onClick={() => toggleFormat(format)}
                className={`rounded-xl px-4 py-2 text-sm capitalize ${
                  input.preferredFormats.includes(format)
                    ? "bg-cyan-500/20 text-cyan-200"
                    : "bg-white/5 text-muted"
                }`}
              >
                {format}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm text-muted">Known weak topics (optional)</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {awsSaaTopics.map((topic) => (
              <button
                key={topic.id}
                type="button"
                onClick={() => toggleChallenge(topic.id)}
                className={`rounded-xl px-3 py-2 text-sm ${
                  input.knownChallengeTopicIds.includes(topic.id)
                    ? "bg-amber-400/15 text-amber-100"
                    : "bg-white/5 text-muted"
                }`}
              >
                {topic.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
