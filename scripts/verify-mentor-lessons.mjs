/**
 * Verifies technical instructor-style lessons (no instructional meta language).
 * Run: node scripts/verify-mentor-lessons.mjs
 */

const GOALS = [
  {
    label: "Python",
    body: {
      goalId: "learn-python",
      goalSlug: "learn-python",
      goalTitle: "Learn Python in 8 weeks",
      goalCategory: "Programming",
      goalType: "Skill",
      topicId: "python-syntax-data-types",
      topicTitle: "Python Syntax and Basic Data Types",
      skillLevel: "beginner",
      durationMinutes: 45,
      learningObjectives: ["Declare variables", "Use int, float, bool, and str", "Call print()"],
      preferredFormats: ["video", "quiz"],
    },
  },
  {
    label: "SQL",
    body: {
      goalId: "master-sql",
      goalSlug: "master-sql",
      goalTitle: "Master SQL for data analysis",
      goalCategory: "Data",
      goalType: "Skill",
      topicId: "sql-joins",
      topicTitle: "SQL JOINs",
      skillLevel: "intermediate",
      durationMinutes: 45,
      learningObjectives: ["Write INNER and LEFT JOINs", "Explain join cardinality"],
      preferredFormats: ["video", "quiz"],
    },
  },
  {
    label: "Kubernetes",
    body: {
      goalId: "learn-kubernetes",
      goalSlug: "learn-kubernetes",
      goalTitle: "Learn Kubernetes",
      goalCategory: "DevOps",
      goalType: "Skill",
      topicId: "kubernetes-networking",
      topicTitle: "Kubernetes Networking",
      skillLevel: "intermediate",
      durationMinutes: 45,
      learningObjectives: ["Explain Pod networking", "Configure Services", "Understand ClusterIP vs NodePort"],
      preferredFormats: ["video", "quiz"],
    },
  },
];

const MENTOR_HEADINGS = [
  "Lesson Overview",
  "Real-World Context",
  "Core Explanation",
  "Hands-on Practice",
  "Practical Example",
  "Common Misconceptions",
  "Mentor Tips",
  "Key Takeaways",
];

const META_PATTERNS = [
  /today you will work through/i,
  /by the end of this session/i,
  /your roadmap/i,
  /your learning goal/i,
  /session focus/i,
  /topic check-in/i,
  /passive reading/i,
  /explain key ideas/i,
  /learn python in 8 weeks/i,
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function validateLesson(label, goal, lesson) {
  assert(lesson.sections?.length === 8, `${label}: expected 8 sections`);
  assert(
    lesson.sections.map((s) => s.heading).join("|") === MENTOR_HEADINGS.join("|"),
    `${label}: section headings mismatch`,
  );

  const handsOn = lesson.sections.find((s) => s.heading === "Hands-on Practice");
  assert(handsOn?.handsOnPractice?.exercise, `${label}: missing hands-on exercise`);

  assert(lesson.practicalArtifact?.content?.trim(), `${label}: missing practicalArtifact content`);
  assert(lesson.handsOnExercise?.instructions?.length, `${label}: missing handsOnExercise instructions`);
  assert(lesson.practicalArtifact.expectedOutput?.trim(), `${label}: missing expected output`);

  if (label === "Python") {
    assert(/print\(|type\(/.test(lesson.practicalArtifact.content), `${label}: missing Python code artifact`);
    assert(/fix|bug|correct/i.test(lesson.handsOnExercise.instructions.join(" ")), `${label}: missing coding exercise`);
  }

  if (label === "SQL") {
    assert(/\bSELECT\b|\bJOIN\b/i.test(lesson.practicalArtifact.content), `${label}: missing SQL artifact`);
  }

  if (label === "Kubernetes") {
    assert(
      /apiVersion:|kubectl/.test(lesson.practicalArtifact.content),
      `${label}: missing YAML or kubectl artifact`,
    );
  }

  const text = JSON.stringify(lesson);
  for (const pattern of META_PATTERNS) {
    assert(!pattern.test(text), `${label}: instructional meta language detected (${pattern})`);
  }

  const objectives = goal.body.learningObjectives ?? [];
  const teachesObjectives = objectives.some((obj) => text.includes(obj.split(" ")[0]));
  assert(teachesObjectives, `${label}: lesson body should reference technical objectives`);

  const core = lesson.sections.find((s) => s.heading === "Core Explanation");
  assert(core && core.content.length >= 120, `${label}: Core Explanation too thin`);

  console.log(`✓ ${label}: technical instructor lesson validated (${lesson.title})`);
}

async function fetchLesson(baseUrl, goal) {
  const response = await fetch(`${baseUrl}/api/learn/generate-lesson`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(goal.body),
  });
  assert(response.ok, `${goal.label}: API ${response.status}`);
  const payload = await response.json();
  return payload.lesson;
}

async function main() {
  const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";
  console.log(`Verifying technical instructor lessons via ${baseUrl}…`);

  for (const goal of GOALS) {
    const lesson = await fetchLesson(baseUrl, goal);
    validateLesson(goal.label, goal, lesson);
  }

  console.log("\nPython, SQL, and Kubernetes lessons teach technical content without meta instructional language.");
}

main().catch((error) => {
  console.error("\nVerification failed:", error.message);
  process.exit(1);
});
