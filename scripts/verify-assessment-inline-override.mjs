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
const results = [];

function record(name, passed, detail = "") {
  results.push({ name, passed, detail });
  console.log(`${passed ? "PASS" : "FAIL"}: ${name}${detail ? ` — ${detail}` : ""}`);
}

async function shot(page, name) {
  const file = path.join(OUT_DIR, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  console.log(`  screenshot: ${file}`);
}

async function waitText(page, text, timeout = 30000) {
  await page.getByText(text, { exact: false }).first().waitFor({ state: "visible", timeout });
}

async function bootstrapJourney(page) {
  await page.goto(`${BASE}/onboarding?presenter=true`);
  await page.getByLabel("Tell MentorMind what you want to achieve").fill(
    "I am a beginner and want to learn Python in eight weeks. I can study six hours per week and prefer practical exercises.",
  );
  await page.getByRole("button", { name: "Understand my goal", exact: true }).click({ force: true });
  await waitText(page, "Continue to skill level", 40000);
  await page.getByRole("button", { name: "Continue to skill level", exact: true }).click({ force: true });

  await page.evaluate(() => {
    const buttons = [...document.querySelectorAll("button")];
    const level = buttons.find(
      (el) => el.textContent?.includes("Complete beginner") && el.textContent?.includes("New to this topic"),
    );
    level?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
  });

  const clickContinue = async () => {
    await page.evaluate(() => {
      const nav = document.querySelector("div.flex.flex-col-reverse");
      const btn = [...(nav?.querySelectorAll("button") ?? [])].find((b) => b.textContent?.trim() === "Continue");
      btn?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    });
    await page.waitForTimeout(250);
  };

  await clickContinue();
  await waitText(page, "Timeline and availability", 30000);
  await clickContinue();
  await waitText(page, "Learning preferences", 30000);
  await clickContinue();
  await waitText(page, "Review your learning plan inputs", 30000);
  await page.evaluate(() => {
    const nav = document.querySelector("div.flex.flex-col-reverse");
    const btn = [...(nav?.querySelectorAll("button") ?? [])].find((b) =>
      b.textContent?.includes("Generate my personalized plan"),
    );
    btn?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
  });
  await page.waitForURL(/\/dashboard/, { timeout: 120000 });
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1400, height: 1000 } });
  const page = await context.newPage();

  try {
    await page.goto(`${BASE}/assessment/foundations`);
    const hasQuestionProgress = await page
      .getByText("Question progress", { exact: false })
      .first()
      .isVisible()
      .catch(() => false);

    if (!hasQuestionProgress) {
      await bootstrapJourney(page);
      await page.goto(`${BASE}/assessment/foundations`);
    }

    await waitText(page, "Question progress", 60000);
    await waitText(page, "1 of 5", 60000);
    await waitText(page, "Submit 42% Score", 60000);
    await waitText(page, "Submit 95% Score", 60000);
    const hasFastForwardOnAssessment = await page
      .getByText("Fast Forward 3 Days", { exact: true })
      .isVisible()
      .catch(() => false);
    const hasResetOnAssessment = await page
      .getByText("Reset Journey", { exact: true })
      .isVisible()
      .catch(() => false);
    await shot(page, "route-mapping-assessment");
    record("Assessment shows score controls", true);
    record(
      "Assessment hides dashboard controls",
      !hasFastForwardOnAssessment && !hasResetOnAssessment,
      hasFastForwardOnAssessment || hasResetOnAssessment ? "unexpected dashboard controls" : "",
    );

    await page.getByRole("button", { name: "Submit 42% Score", exact: true }).click({ force: true });
    await waitText(page, "MentorMind is analyzing your learning", 20000);
    await shot(page, "inline-override-42-overlay");
    record("Submit 42% starts analysis overlay", true);

    await page.goto(`${BASE}/assessment/foundations`);
    await waitText(page, "Submit 95% Score", 60000);
    await page.getByRole("button", { name: "Submit 95% Score", exact: true }).click({ force: true });
    await waitText(page, "MentorMind detected mastery.", 20000);
    await shot(page, "route-mapping-95-overlay");
    record("Submit 95% starts mastery overlay", true);

    await page.goto(`${BASE}/dashboard?presenter=true`);
    await waitText(page, "Fast Forward 3 Days", 60000);
    const hasResetOnDashboard = await page
      .getByText("Reset Journey", { exact: true })
      .isVisible()
      .catch(() => false);
    const has42OnDashboard = await page
      .getByText("Submit 42% Score", { exact: true })
      .isVisible()
      .catch(() => false);
    const has95OnDashboard = await page
      .getByText("Submit 95% Score", { exact: true })
      .isVisible()
      .catch(() => false);
    await shot(page, "route-mapping-dashboard");
    record("Dashboard shows Fast Forward", true);
    record(
      "Dashboard hides Reset Journey",
      !hasResetOnDashboard,
      hasResetOnDashboard ? "Reset Journey should not be visible" : "",
    );
    record(
      "Dashboard hides score controls",
      !has42OnDashboard && !has95OnDashboard,
      has42OnDashboard || has95OnDashboard ? "unexpected score controls" : "",
    );
  } catch (error) {
    record("Assessment inline override verification", false, error instanceof Error ? error.message : String(error));
    await shot(page, "inline-override-error");
    throw error;
  } finally {
    await browser.close();
    await writeFile(
      path.join(OUT_DIR, "report-inline-override.json"),
      JSON.stringify({ timestamp: new Date().toISOString(), results }, null, 2),
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
