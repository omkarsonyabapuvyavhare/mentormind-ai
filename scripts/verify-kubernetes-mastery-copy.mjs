import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const playwrightPath = path.join(process.env.TEMP ?? "", "pw-temp", "node_modules", "playwright");
const { chromium } = require(playwrightPath);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "..", "runtime-screenshots");
const BASE = "http://localhost:3000";
const GOAL = "I want to learn Kubernetes in 8 weeks.";

const results = [];

function record(name, passed, detail = "") {
  results.push({ name, passed, detail });
  console.log(`${passed ? "PASS" : "FAIL"}: ${name}${detail ? ` — ${detail}` : ""}`);
}

async function shot(page, name) {
  const file = path.join(OUT_DIR, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
}

async function waitText(page, text, timeout = 60000) {
  await page.getByText(text, { exact: false }).first().waitFor({ state: "visible", timeout });
}

async function clickByExactText(page, label) {
  await page.evaluate((buttonLabel) => {
    const nodes = Array.from(document.querySelectorAll("button, a"));
    const target = nodes.find((node) => node.textContent?.trim() === buttonLabel);
    target?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
  }, label);
}

async function readRoadmapCompletionPercent(page) {
  await page.goto(`${BASE}/roadmap`);
  await waitText(page, "Overall completion", 60000);

  const completionText = await page.evaluate(() => {
    const progress = document.querySelector('[aria-label="Overall roadmap completion"]');
    return progress?.closest("section,div")?.textContent ?? document.body.textContent ?? "";
  });
  const match = completionText.match(/(\d+)%/);
  return match ? Number(match[1]) : 0;
}

async function bootstrapToAssessment(page) {
  await page.goto(`${BASE}/onboarding?presenter=true`);
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload();

  await page.getByLabel("Tell MentorMind what you want to achieve").fill(GOAL);
  await clickByExactText(page, "Understand my goal");
  await waitText(page, "Continue to skill level");
  await clickByExactText(page, "Continue to skill level");

  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const beginner = buttons.find(
      (button) =>
        button.textContent?.includes("Complete beginner") &&
        button.textContent?.includes("New to this topic"),
    );
    beginner?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
  });

  const clickContinue = async () => {
    await page.evaluate(() => {
      const nav = document.querySelector("div.flex.flex-col-reverse");
      const continueButton = Array.from(nav?.querySelectorAll("button") ?? []).find(
        (button) => button.textContent?.trim() === "Continue",
      );
      continueButton?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    });
    await page.waitForTimeout(250);
  };

  await clickContinue();
  await waitText(page, "Timeline and availability");
  await clickContinue();
  await waitText(page, "Learning preferences");
  await clickContinue();
  await waitText(page, "Review your learning plan inputs");
  await clickByExactText(page, "Generate my personalized plan");
  await page.waitForURL(/\/dashboard/, { timeout: 120000 });

  const baselineCompletion = await readRoadmapCompletionPercent(page);
  await page.goto(`${BASE}/dashboard?presenter=true`);
  await waitText(page, "Start Learning", 60000);

  await clickByExactText(page, "Start Learning");
  await page.waitForURL(/\/learn\//, { timeout: 60000 });
  await clickByExactText(page, "Start topic check-in");
  await page.waitForURL(/\/assessment\//, { timeout: 60000 });
  return baselineCompletion;
}

async function goToUpdatedPlan(page, simulateButtonText, stagePrefix) {
  await page.getByRole("button", { name: simulateButtonText, exact: true }).click({ force: true });
  await waitText(page, "AI REASONING SUMMARY", 60000);
  await shot(page, `${stagePrefix}-reasoning`);
  await page.getByRole("button", { name: "Continue to mentor feedback", exact: true }).click({ force: true });
  await waitText(page, "Mentor Feedback", 60000);
  await shot(page, `${stagePrefix}-feedback`);
  await page.getByRole("button", { name: "See updated learning plan", exact: true }).click({ force: true });
  await waitText(page, "Updated Learning Plan", 60000);
  await shot(page, `${stagePrefix}-updated-plan`);
}

async function navigateBackToAssessment(page) {
  await page.goto(`${BASE}/dashboard?presenter=true`);
  await waitText(page, "Start Learning", 60000);

  const startCheckInVisible = await page
    .getByRole("button", { name: "Start topic check-in", exact: true })
    .isVisible()
    .catch(() => false);

  if (startCheckInVisible) {
    await clickByExactText(page, "Start topic check-in");
    await page.waitForURL(/\/assessment\//, { timeout: 60000 });
    return;
  }

  await clickByExactText(page, "Start Learning");
  await page.waitForURL(/\/learn\//, { timeout: 60000 });
  await clickByExactText(page, "Start topic check-in");
  await page.waitForURL(/\/assessment\//, { timeout: 60000 });
}

async function assertNoAwsExamLanguage(page, label) {
  const pageText = (await page.locator("body").innerText()).toLowerCase();
  const hasForbidden = /\bvpc\b|\baws\b|exam|certification/.test(pageText);
  record(`${label}: no VPC/AWS/exam/cert wording`, !hasForbidden);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });

  try {
    const baselineCompletion = await bootstrapToAssessment(page);
    const assessmentUrl = page.url();
    const topicId = assessmentUrl.split("/assessment/")[1] ?? "";
    record("Assessment topic is cluster-architecture", topicId === "cluster-architecture", topicId);

    await waitText(page, "1 of 5");
    const has42 = await page.getByText("Submit 42% Score", { exact: true }).isVisible();
    const has95 = await page.getByText("Submit 95% Score", { exact: true }).isVisible();
    const hasFastForward = await page.getByText("Fast Forward 3 Days", { exact: true }).isVisible().catch(() => false);
    record("Assessment shows Submit 42%", has42);
    record("Assessment shows Submit 95%", has95);
    record("Assessment hides Fast Forward", !hasFastForward);
    await shot(page, "k8s-assessment");

    await goToUpdatedPlan(page, "Submit 42% Score", "k8s-42");
    await assertNoAwsExamLanguage(page, "42% updated plan");

    await navigateBackToAssessment(page);
    await waitText(page, "Submit 95% Score", 60000);
    await goToUpdatedPlan(page, "Submit 95% Score", "k8s-95");
    await assertNoAwsExamLanguage(page, "95% updated plan");

    const updatedText = (await page.locator("body").innerText()).toLowerCase();
    record(
      "95% updated plan references cluster architecture strength",
      updatedText.includes("cluster architecture moved to your strengths"),
    );
    record(
      "95% updated plan references advanced kubernetes unlock",
      updatedText.includes("advanced kubernetes content unlocked"),
    );

    await page.getByRole("button", { name: "Continue Learning", exact: true }).click({ force: true });
    await page.waitForURL(/\/dashboard/, { timeout: 60000 });
    await page.goto(`${BASE}/dashboard?presenter=true`);
    await waitText(page, "Fast Forward 3 Days", 60000);
    await page.getByRole("button", { name: "Fast Forward 3 Days", exact: true }).click({ force: true });
    await waitText(page, "Accountability", 60000);
    await shot(page, "k8s-fast-forward-accountability");

    const accountabilityText = (await page.locator("body").innerText()).toLowerCase();
    record(
      "Fast Forward nudge is Kubernetes-aware",
      /kubernetes|cluster architecture/.test(accountabilityText),
    );
    record(
      "Fast Forward nudge has no AWS/VPC/exam/cert wording",
      !/\bvpc\b|\baws\b|exam|certification/.test(accountabilityText),
    );

    const finalCompletion = await readRoadmapCompletionPercent(page);
    record(
      "Overall completion increases after lesson and quiz",
      finalCompletion > baselineCompletion,
      `baseline=${baselineCompletion}% final=${finalCompletion}%`,
    );
  } catch (error) {
    record(
      "Kubernetes mastery copy verification",
      false,
      error instanceof Error ? error.message : String(error),
    );
    await shot(page, "k8s-copy-error");
    throw error;
  } finally {
    await browser.close();
    await writeFile(
      path.join(OUT_DIR, "report-kubernetes-mastery-copy.json"),
      JSON.stringify({ timestamp: new Date().toISOString(), results }, null, 2),
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
