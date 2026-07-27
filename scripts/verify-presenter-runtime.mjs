/**
 * Live browser verification for presenter mode journey.
 * Run: node scripts/verify-presenter-runtime.mjs
 */
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
const GOAL =
  "I am a beginner and want to learn Python in eight weeks. I can study six hours per week and prefer practical exercises.";

const results = [];

function record(name, passed, detail) {
  results.push({ name, passed, detail });
  console.log(`${passed ? "PASS" : "FAIL"}: ${name}${detail ? ` — ${detail}` : ""}`);
}

async function screenshot(page, name) {
  const file = path.join(OUT_DIR, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  console.log(`  screenshot: ${file}`);
  return file;
}

async function clickButton(page, name, options = {}) {
  const locator = page.getByRole("button", { name, exact: options.exact ?? false });
  const btn = options.last ? locator.last() : locator.first();
  await btn.waitFor({ state: "visible", timeout: 30000 });
  await btn.scrollIntoViewIfNeeded();
  await btn.click({ force: true, timeout: 30000 });
}

async function waitStep(page, stepLabel) {
  await page.getByText(stepLabel, { exact: false }).first().waitFor({ state: "visible", timeout: 30000 });
}

async function clickOnboardingContinue(page) {
  await page.evaluate(() => {
    const nav = document.querySelector("div.flex.flex-col-reverse");
    const buttons = nav?.querySelectorAll("button") ?? [];
    const continueBtn = [...buttons].find((btn) => btn.textContent?.trim() === "Continue");
    continueBtn?.click();
  });
  await page.waitForTimeout(400);
}

async function clickGeneratePlan(page) {
  await page.evaluate(() => {
    const nav = document.querySelector("div.flex.flex-col-reverse");
    const buttons = nav?.querySelectorAll("button") ?? [];
    const btn = [...buttons].find((b) =>
      b.textContent?.includes("Generate my personalized plan"),
    );
    btn?.click();
  });
}

async function clickSkillLevel(page, label) {
  await page.evaluate((levelLabel) => {
    const buttons = [...document.querySelectorAll("button")];
    const match = buttons.find(
      (btn) =>
        btn.textContent?.includes(levelLabel) &&
        btn.textContent?.includes("New to this topic"),
    );
    match?.click();
  }, label);
}

async function waitVisible(page, text, timeout = 30000) {
  await page.getByText(text, { exact: false }).first().waitFor({ state: "visible", timeout });
}

async function runFlow(page, label, simulateButton, { alreadyOnAssessment = false } = {}) {
  if (!alreadyOnAssessment) {
    const startLearning = page.getByRole("button", { name: "Start Learning" });
    if (await startLearning.isVisible().catch(() => false)) {
      await clickButton(page, "Start Learning");
      await page.waitForURL(/\/learn\//, { timeout: 60000 });
    }

    const checkIn = page.getByRole("button", { name: "Start topic check-in" });
    await checkIn.waitFor({ state: "visible", timeout: 60000 });
    await clickButton(page, "Start topic check-in");
    await page.waitForURL(/\/assessment\//, { timeout: 60000 });
    await waitVisible(page, "1 of 5");
  }

  if (label === "42pct" || !alreadyOnAssessment) {
    await screenshot(page, `${label}-01-assessment-with-presenter-buttons`);
  }

  const simulate = page.getByRole("button", { name: simulateButton });
  const simulateVisible = await simulate.isVisible().catch(() => false);
  record(
    `${label}: inline presenter controls visible`,
    simulateVisible,
    simulateVisible ? simulateButton : "Simulate buttons not found",
  );
  if (!simulateVisible) throw new Error(`${simulateButton} not visible`);

  await clickButton(page, simulateButton, { exact: true });

  await waitVisible(page, "MentorMind is analyzing your learning", 15000);
  await screenshot(page, `${label}-02-analyzing-overlay`);

  await waitVisible(page, "AI reasoning summary", 15000);
  await screenshot(page, `${label}-03-reasoning-screen`);

  await page.evaluate(() => {
    const buttons = [...document.querySelectorAll("button")];
    buttons.find((b) => b.textContent?.includes("Continue to mentor feedback"))?.click();
  });
  await page.waitForURL(/\/mentor\/feedback/, { timeout: 60000 });
  await waitVisible(page, "Mentor Feedback");
  await screenshot(page, `${label}-04-mentor-feedback`);

  await page.evaluate(() => {
    const buttons = [...document.querySelectorAll("button")];
    buttons.find((b) => b.textContent?.includes("See updated learning plan"))?.click();
  });
  await page.waitForURL(/\/plan-updated/, { timeout: 60000 });
  await waitVisible(page, "Updated Learning Plan");
  await screenshot(page, `${label}-05-updated-roadmap`);

  record(`${label}: full UI flow completed`, true, `/plan-updated reached`);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  try {
    // Clear persisted state for clean run
    await page.goto(`${BASE}/onboarding?presenter=true`);
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload();

    // --- Onboarding ---
    await page.getByLabel("Tell MentorMind what you want to achieve").fill(GOAL);
    await clickButton(page, "Understand my goal");
    await waitVisible(page, "Continue to skill level", 30000);
    await clickButton(page, "Continue to skill level");

    await clickSkillLevel(page, "Complete beginner");
    await page.waitForTimeout(300);
    await clickOnboardingContinue(page);
    await waitStep(page, "Timeline and availability");

    await clickOnboardingContinue(page);
    await waitStep(page, "Learning preferences");

    await clickOnboardingContinue(page);
    await waitStep(page, "Review your learning plan inputs");

    await clickGeneratePlan(page);

    await page.waitForURL(/\/onboarding\/loading|\/dashboard/, { timeout: 60000 });
    await page.waitForURL(/\/dashboard/, { timeout: 120000 });
    record("Onboarding → Dashboard", true, page.url());

    // --- Dashboard → Lesson → Assessment ---
    await clickButton(page, "Start Learning");
    await page.waitForURL(/\/learn\//, { timeout: 60000 });
    record("Dashboard → Lesson", true, page.url());

    const checkIn = page.getByRole("button", { name: "Start topic check-in" });
    await checkIn.waitFor({ state: "visible", timeout: 90000 });
    await checkIn.click({ force: true });
    await page.waitForURL(/\/assessment\//, { timeout: 60000 });

    // --- Question 1 verification ---
    const progress = page.getByText("1 of 5");
    const prevBtn = page.getByRole("button", { name: "Previous", exact: true });
    const nextBtn = page.getByRole("button", { name: "Next", exact: true });
    const sim42 = page.getByRole("button", { name: "Simulate 42%" });
    const sim95 = page.getByRole("button", { name: "Simulate 95%" });
    const fastForward = page.getByRole("button", { name: "Fast Forward 3 Days" });
    const resetJourney = page.getByRole("button", { name: /Reset journey/i });

    await progress.waitFor({ state: "visible", timeout: 30000 });
    record("Question progress 1 of 5", await progress.isVisible(), "");
    record("Previous button", await prevBtn.isVisible(), "");
    record("Next button", await nextBtn.isVisible(), "");
    record("Simulate 42%", await sim42.isVisible(), "");
    record("Simulate 95%", await sim95.isVisible(), "");
    record("Fast Forward 3 Days", await fastForward.isVisible(), "");
    record("Reset Journey", await resetJourney.isVisible(), "");

    await screenshot(page, "assessment-with-presenter-buttons");

    // --- 42% flow (already on assessment) ---
    await runFlow(page, "42pct", "Simulate 42%", { alreadyOnAssessment: true });

    // Back to dashboard for 95% flow
    await page.evaluate(() => {
      const buttons = [...document.querySelectorAll("button")];
      buttons.find((b) => b.textContent?.includes("Continue Learning"))?.click();
    });
    await page.waitForURL(/\/dashboard/, { timeout: 60000 });

    // --- 95% flow ---
    await runFlow(page, "95pct", "Simulate 95%");
  } catch (error) {
    record("Runtime verification", false, error instanceof Error ? error.message : String(error));
    await page.screenshot({ path: path.join(OUT_DIR, "error-state.png"), fullPage: true });
    throw error;
  } finally {
    await browser.close();
    const report = {
      timestamp: new Date().toISOString(),
      results,
      allPassed: results.every((r) => r.passed),
    };
    await writeFile(path.join(OUT_DIR, "report.json"), JSON.stringify(report, null, 2));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
