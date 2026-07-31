/**
 * Verification only — never prints the API key value.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const envPath = path.join(root, ".env.local");

function checkEnvFile() {
  const exists = fs.existsSync(envPath);
  let present = false;
  let nonEmpty = false;
  let keyLength = 0;

  if (exists) {
    const text = fs.readFileSync(envPath, "utf8");
    const match = text.match(/^GEMINI_API_KEY=(.*)$/m);
    if (match) {
      present = true;
      const value = (match[1] ?? "").trim().replace(/^["']|["']$/g, "");
      nonEmpty = value.length > 0;
      keyLength = value.length;
    }
  }

  return { exists, present, nonEmpty, keyLength };
}

async function postLesson(body) {
  const started = Date.now();
  const response = await fetch("http://localhost:3000/api/learn/generate-lesson", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const durationMs = Date.now() - started;
  const json = await response.json().catch(() => ({}));
  return { status: response.status, durationMs, json };
}

function qualityCheck(lesson, domain) {
  const haystack = JSON.stringify(lesson).toLowerCase();
  const issues = [];

  if (/explain key ideas in/.test(haystack)) issues.push("contains Explain key ideas");
  if (/"foundations"/.test(haystack) || /week \d+ — foundations/.test(haystack)) {
    issues.push("contains Foundations placeholder");
  }
  if (/best way to study|learning plan|roadmap milestone/.test(haystack)) {
    issues.push("meta instructional language");
  }

  if (domain === "python") {
    if (!/python|def |print\(|int|str|variable/.test(haystack)) {
      issues.push("missing Python technical content");
    }
    if (!lesson.practicalArtifact?.content) issues.push("missing practical artifact content");
    if (!lesson.handsOnExercise?.instructions?.length) issues.push("missing hands-on exercise");
    if (!lesson.sections?.some((s) => /mentor tips/i.test(s.heading))) {
      issues.push("missing Mentor Tips section");
    }
  }

  if (domain === "sql") {
    if (!/select|from|where|sql|query/.test(haystack)) {
      issues.push("missing SQL technical content");
    }
    if (!lesson.practicalArtifact?.content && !/select\s+/i.test(haystack)) {
      issues.push("missing SQL query example");
    }
    if (!lesson.handsOnExercise?.instructions?.length) issues.push("missing hands-on exercise");
  }

  return { ok: issues.length === 0, issues };
}

const pythonRequest = {
  goalId: "learn-python",
  goalSlug: "learn-python",
  goalTitle: "Learn Python",
  goalCategory: "Programming",
  goalType: "Skill",
  topicId: "python-syntax-and-basic-data-types",
  topicTitle: "Python Syntax and Basic Data Types",
  skillLevel: "beginner",
  durationMinutes: 45,
  learningObjectives: [
    "Declare Python variables with correct syntax",
    "Identify basic Python data types",
    "Print and inspect values",
  ],
  preferredFormats: ["video", "quiz"],
};

const sqlRequest = {
  goalId: "master-sql",
  goalSlug: "master-sql",
  goalTitle: "Learn SQL",
  goalCategory: "Data",
  goalType: "Skill",
  topicId: "select",
  topicTitle: "SELECT",
  skillLevel: "beginner",
  durationMinutes: 45,
  learningObjectives: [
    "Write a SELECT statement to project columns",
    "Identify the FROM clause source table",
  ],
  preferredFormats: ["video", "quiz"],
};

const env = checkEnvFile();
const report = {
  apiKeyDetected: env.present && env.nonEmpty,
  envLocalExists: env.exists,
  keyNonEmpty: env.nonEmpty,
  keyLengthChars: env.keyLength,
  nextJsLoadedEnvironment: null,
  geminiRequestSucceeded: null,
  firstLessonSource: null,
  firstGenerationPath: null,
  firstFallbackReason: null,
  secondLessonSource: null,
  secondOriginalSource: null,
  cacheWorking: null,
  pythonQuality: null,
  sqlLessonSource: null,
  sqlQuality: null,
  fallbackSimulation: null,
  errors: [],
  warnings: [],
};

// 1) Confirm Next.js sees the key via a live generate that returns ai vs missing-api-key
try {
  const first = await postLesson(pythonRequest);
  report.nextJsLoadedEnvironment =
    first.status === 200 && first.json?.fallbackReason !== "missing-api-key";

  if (first.status !== 200) {
    report.errors.push(`Python lesson HTTP ${first.status}`);
  }

  report.firstLessonSource = first.json?.source ?? null;
  report.firstGenerationPath = first.json?.generationPath ?? null;
  report.firstFallbackReason = first.json?.fallbackReason ?? null;
  report.geminiRequestSucceeded = first.json?.source === "ai";

  if (first.json?.source !== "ai") {
    report.errors.push(
      `Expected Gemini (ai), got source=${first.json?.source} reason=${first.json?.fallbackReason}`,
    );
  }

  if (first.json?.lesson) {
    report.pythonQuality = qualityCheck(first.json.lesson, "python");
    report.pythonLessonTitle = first.json.lesson.title;
    report.pythonHasCode = Boolean(first.json.lesson.practicalArtifact?.content);
    report.pythonHasExpectedOutput = Boolean(first.json.lesson.practicalArtifact?.expectedOutput);
    report.pythonHasHandsOn = Boolean(first.json.lesson.handsOnExercise?.instructions?.length);
    report.pythonDurationMs = first.durationMs;
  }

  // 2) Second identical API request — server always regenerates; cache is client-side.
  //    We still call again to confirm Gemini remains available (not flaky).
  const secondApi = await postLesson(pythonRequest);
  report.secondApiSource = secondApi.json?.source ?? null;
  if (secondApi.json?.source !== "ai") {
    report.warnings.push(
      `Second API call source=${secondApi.json?.source} (server has no session cache; client cache verified separately)`,
    );
  }
} catch (error) {
  report.errors.push(`Python lesson request failed: ${error instanceof Error ? error.message : error}`);
  report.geminiRequestSucceeded = false;
  report.nextJsLoadedEnvironment = false;
}

// 3) SQL lesson via Gemini
try {
  const sql = await postLesson(sqlRequest);
  report.sqlLessonSource = sql.json?.source ?? null;
  report.sqlFallbackReason = sql.json?.fallbackReason ?? null;
  report.sqlDurationMs = sql.durationMs;
  if (sql.json?.lesson) {
    report.sqlQuality = qualityCheck(sql.json.lesson, "sql");
    report.sqlLessonTitle = sql.json.lesson.title;
    report.sqlHasQuery = /select\s+/i.test(
      `${sql.json.lesson.practicalArtifact?.content ?? ""} ${JSON.stringify(sql.json.lesson.sections)}`,
    );
  }
  if (sql.json?.source !== "ai") {
    report.errors.push(`SQL lesson not from Gemini: source=${sql.json?.source}`);
  }
} catch (error) {
  report.errors.push(`SQL lesson request failed: ${error instanceof Error ? error.message : error}`);
}

console.log(JSON.stringify(report, null, 2));
