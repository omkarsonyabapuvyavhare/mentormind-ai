/**
 * Phase 1 runtime verification for /api/onboarding/parse-intent.
 *
 * Usage:
 *   node scripts/verify-parse-intent-runtime.mjs
 *   node scripts/verify-parse-intent-runtime.mjs --base-url http://localhost:3000
 *
 * Requires a running Next.js dev server for HTTP mode.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const DEFAULT_BASE_URL = "http://localhost:3000";

const PROMPTS = {
  A: "I want to pass the AWS Solutions Architect Associate exam in 8 weeks. I know basic cloud concepts and can study one hour every evening.",
  B: "I want to become job-ready in frontend development within 10 weeks. I can study six hours each week and I already know basic HTML and CSS.",
  C: "I want to prepare for Azure Fundamentals in five weeks. I am a beginner and can study on weekends.",
};

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) {
    return;
  }

  const content = readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const eq = trimmed.indexOf("=");
    if (eq === -1) {
      continue;
    }
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function parseArgs() {
  const args = process.argv.slice(2);
  const baseUrlIndex = args.indexOf("--base-url");
  return {
    baseUrl: baseUrlIndex >= 0 ? args[baseUrlIndex + 1] : DEFAULT_BASE_URL,
  };
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
    bodyText,
    hasKeyLeak: /AIza[a-zA-Z0-9_-]{10,}/.test(bodyText) || bodyText.includes("GEMINI_API_KEY"),
  };
}

function summarize(label, result) {
  const { body } = result;
  return {
    label,
    status: result.status,
    source: body.source,
    goal: body.parsed?.goal,
    skillLevel: body.parsed?.currentSkillLevel,
    durationWeeks: body.parsed?.durationWeeks,
    studyHoursPerWeek: body.parsed?.studyHoursPerWeek,
    goalId: body.onboardingInput?.goalId,
    zodValid: Boolean(body.onboardingInput?.goalId && body.parsed?.goal),
    keyLeak: result.hasKeyLeak,
  };
}

async function main() {
  loadEnvLocal();
  const { baseUrl } = parseArgs();
  const geminiConfigured = Boolean(process.env.GEMINI_API_KEY?.trim());

  console.log("=== MentorMind parse-intent runtime verification ===");
  console.log(`Base URL: ${baseUrl}`);
  console.log(`Gemini configured (local env): ${geminiConfigured}`);
  console.log(`Model: ${process.env.GEMINI_MODEL || "gemini-2.5-flash"}`);
  console.log(`Timeout ms: ${process.env.AI_INTENT_PARSE_TIMEOUT_MS || "8000"}`);
  console.log("");

  const results = [];

  for (const [label, text] of Object.entries(PROMPTS)) {
    const result = await callParseIntent(baseUrl, text);
    results.push(summarize(label, result));
  }

  console.log("--- Prompt tests A/B/C ---");
  console.table(results);

  const failureTests = [];

  failureTests.push(
    summarize("empty-input", await callParseIntent(baseUrl, "")),
  );
  failureTests.push(
    summarize("unsupported-goal", await callParseIntent(
      baseUrl,
      "I want to master underwater basket weaving in 3 weeks with 30 minutes per month.",
    )),
  );

  console.log("--- Failure / edge cases ---");
  console.table(failureTests);

  const anyKeyLeak = [...results, ...failureTests].some((row) => row.keyLeak);
  console.log(`API key leak in responses: ${anyKeyLeak ? "YES (FAIL)" : "none detected"}`);

  if (geminiConfigured) {
    const aiCount = results.filter((row) => row.source === "ai").length;
    console.log(`Gemini path used for ${aiCount}/${results.length} prompt tests (expect 3 when key is valid).`);
  } else {
    console.log("Gemini key not set locally — prompt tests expected to return source=deterministic.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
