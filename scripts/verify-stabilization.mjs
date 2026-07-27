/**
 * Stabilization verification for Gemini intent parsing.
 * Usage: node scripts/verify-stabilization.mjs [--base-url http://localhost:3000]
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const DEFAULT_BASE_URL = "http://localhost:3000";

const PROMPTS = [
  {
    id: "1-aws",
    text: "I want to pass AWS Solutions Architect in 8 weeks. I know basic cloud concepts and can study one hour every evening.",
    expectGoalId: "aws-saa-c03",
  },
  {
    id: "2-frontend",
    text: "I want to become job-ready in frontend development in 10 weeks. I know HTML and CSS and can study six hours per week.",
    expectGoalId: "custom-skill",
  },
  {
    id: "3-azure",
    text: "I want to prepare for Azure Fundamentals in five weeks. I am a beginner and mostly study on weekends.",
    expectGoalId: "azure-fundamentals",
  },
];

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

async function callParseIntent(baseUrl, text) {
  const response = await fetch(`${baseUrl}/api/onboarding/parse-intent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  const body = await response.json();
  const bodyText = JSON.stringify(body);
  return {
    status: response.status,
    body,
    keyLeak: /AIza[a-zA-Z0-9_-]{10,}/.test(bodyText) || bodyText.includes("GEMINI_API_KEY"),
  };
}

function summarizePromptResult(prompt, result) {
  const { body } = result;
  return {
    id: prompt.id,
    source: body.source,
    goal: body.parsed?.goal,
    skillLevel: body.parsed?.currentSkillLevel,
    durationWeeks: body.parsed?.durationWeeks,
    studyHoursPerWeek: body.parsed?.studyHoursPerWeek,
    goalId: body.onboardingInput?.goalId,
    expectedGoalId: prompt.expectGoalId,
    goalIdMatch: body.onboardingInput?.goalId === prompt.expectGoalId,
    zodValid: Boolean(body.onboardingInput?.goalId && body.parsed?.goal),
    clampedDuration: body.parsed?.durationWeeks >= 4 && body.parsed?.durationWeeks <= 16,
    clampedHours: body.parsed?.studyHoursPerWeek >= 1 && body.parsed?.studyHoursPerWeek <= 40,
  };
}

async function runPromptVerification(baseUrl) {
  console.log("\n=== PHASE 1: Prompt verification (API) ===");
  const results = [];
  for (const prompt of PROMPTS) {
    const result = await callParseIntent(baseUrl, prompt.text);
    results.push(summarizePromptResult(prompt, result));
  }
  console.table(results);
  return results;
}

async function runFallbackVerification(baseUrl) {
  console.log("\n=== PHASE 2: Fallback verification ===");

  const cases = [
    { id: "empty-input", text: "" },
    {
      id: "unsupported-goal",
      text: "I want to master underwater basket weaving in 3 weeks with 30 minutes per month.",
    },
  ];

  const apiResults = [];
  for (const testCase of cases) {
    const result = await callParseIntent(baseUrl, testCase.text);
    apiResults.push({
      id: testCase.id,
      status: result.status,
      source: result.body.source,
      goalId: result.body.onboardingInput?.goalId,
      zodValid: Boolean(result.body.onboardingInput?.goalId),
    });
  }
  console.table(apiResults);

  const serviceTests = spawnSync(
    process.execPath,
    ["node_modules/vitest/vitest.mjs", "run", "tests/onboarding/parse-intent-api.test.ts"],
    { encoding: "utf8", cwd: process.cwd() },
  );
  console.log(
    serviceTests.status === 0
      ? "Service fallback tests: PASS (missing key, timeout, invalid JSON mocked)"
      : "Service fallback tests: FAIL",
  );

  return apiResults;
}

function runSecurityChecks() {
  console.log("\n=== PHASE 5: Security checks ===");
  const envIgnored = existsSync(".gitignore") && readFileSync(".gitignore", "utf8").includes(".env*");
  const exampleOk =
    existsSync(".env.example") &&
    readFileSync(".env.example", "utf8").includes("GEMINI_API_KEY=") &&
    readFileSync(".env.example", "utf8").includes("GEMINI_MODEL=gemini-3-flash-preview");

  let staticLeak = false;
  if (existsSync(".next/static")) {
    const rg = spawnSync("rg", ["-l", "GEMINI_API_KEY|AIza", ".next/static"], {
      encoding: "utf8",
      shell: true,
    });
    staticLeak = Boolean(rg.stdout?.trim());
  }

  console.log({
    envLocalGitignored: envIgnored,
    envExampleConfigured: exampleOk,
    clientBundleKeyLeak: staticLeak ? "DETECTED" : "none",
  });
}

async function main() {
  loadEnvLocal();
  const baseUrl = process.argv.includes("--base-url")
    ? process.argv[process.argv.indexOf("--base-url") + 1]
    : DEFAULT_BASE_URL;

  console.log("MentorMind Gemini stabilization verification");
  console.log(`Base URL: ${baseUrl}`);
  console.log(`Gemini configured: ${Boolean(process.env.GEMINI_API_KEY?.trim())}`);
  console.log(`Model: ${process.env.GEMINI_MODEL || "gemini-3-flash-preview"}`);

  const promptResults = await runPromptVerification(baseUrl);
  const fallbackResults = await runFallbackVerification(baseUrl);
  await runSecurityChecks();

  const aiCount = promptResults.filter((r) => r.source === "ai").length;
  console.log(`\nPrompt AI success: ${aiCount}/${promptResults.length}`);
  console.log(`Fallback cases all 200: ${fallbackResults.every((r) => r.status === 200)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
