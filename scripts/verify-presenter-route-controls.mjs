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

function record(name, passed, detail = "") {
  results.push({ name, passed, detail });
  console.log(`${passed ? "PASS" : "FAIL"}: ${name}${detail ? ` — ${detail}` : ""}`);
}

async function shot(page, name) {
  const file = path.join(OUT_DIR, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  console.log(`  screenshot: ${file}`);
}

async function waitText(page, text, timeout = 40000) {
  await page.getByText(text, { exact: false }).first().waitFor({ state: "visible", timeout });
}

async function clickByText(page, text) {
  await page.evaluate((label) => {
    const buttons = [...document.querySelectorAll("button,a")];
    const match = buttons.find((el) => el.textContent?.trim() === label || el.textContent?.includes(label));
    match?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
  }, text);
}

async function bootstrapToAssessment(page) {
  await page.goto(`${BASE}/onboarding?presenter=true`);
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload();

  await page.getByLabel("Tell MentorMind what you want to achieve").fill(GOAL);
  await page.getByRole("button", { name: "Understand my goal", exact: true }).click({ force: true });
  await waitText(page, "Continue to skill level");
  await page.getByRole("button", { name: "Continue to skill level", exact: true }).click({ force: true });

  await page.evaluate(() => {
    const buttons = [...document.querySelectorAll("button")];
    const level = buttons.find(
      (b) => b.textContent?.includes("Complete beginner") && b.textContent?.includes("New to this topic"),
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
  await waitText(page, "Timeline and availability");
  await clickContinue();
  await waitText(page, "Learning preferences");
  await clickContinue();
  await waitText(page, "Review your learning plan inputs");
  await page.getByRole("button", { name: "Generate my personalized plan", exact: true }).click({
    force: true,
  });
  await page.waitForURL(/\/dashboard/, { timeout: 120000 });

  await page.getByRole("button", { name: "Start Learning", exact: true }).click({ force: true });
  await page.waitForURL(/\/learn\//, { timeout: 60000 });
  await page.getByRole("button", { name: "Start topic check-in", exact: true }).click({ force: true });
  await page.waitForURL(/\/assessment\//, { timeout: 60000 });
}

async function verifyAssessmentButtonStyles(page) {
  const previous = page.getByRole("button", { name: "Previous", exact: true });
  const next = page.getByRole("button", { name: "Next", exact: true });
  const weak = page.getByRole("button", { name: "Submit 42% Score", exact: true });
  const mastery = page.getByRole("button", { name: "Submit 95% Score", exact: true });

  const previousClass = await previous.evaluate((el) => el.className);
  const nextClass = await next.evaluate((el) => el.className);
  const weakClass = await weak.evaluate((el) => el.className);
  const masteryClass = await mastery.evaluate((el) => el.className);

  record("Previous uses primary cyan style", previousClass.includes("bg-cyan-500"));
  record("Next uses primary cyan style", nextClass.includes("bg-cyan-500"));
  record("Submit 42% uses primary cyan style", weakClass.includes("bg-cyan-500"));
  record("Submit 95% uses primary cyan style", masteryClass.includes("bg-cyan-500"));
  record("Previous disabled on question 1", await previous.isDisabled());
}

async function verifyAssessmentControls(page) {
  await waitText(page, "Question progress");
  await waitText(page, "1 of 5");

  const has42 = await page.getByText("Submit 42% Score").first().isVisible();
  const has95 = await page.getByText("Submit 95% Score").first().isVisible();
  const hasFastForward = await page.getByText("Fast Forward 3 Days").first().isVisible().catch(() => false);
  const hasReset = await page.getByText("Reset Journey").first().isVisible().catch(() => false);

  record("Assessment shows Submit 42%", has42);
  record("Assessment shows Submit 95%", has95);
  record("Assessment hides Fast Forward", !hasFastForward);
  record("Assessment hides Reset Journey", !hasReset);
  await shot(page, "route-controls-assessment");
}

async function runScoreFlow(page, label, buttonText, expectedOverlayText) {
  await page.getByRole("button", { name: buttonText, exact: true }).click({ force: true });
  await waitText(page, expectedOverlayText, 20000);
  await shot(page, `${label}-overlay`);

  await waitText(page, "AI reasoning summary", 60000);
  await shot(page, `${label}-reasoning`);

  await waitText(page, "Continue to mentor feedback", 60000);
  await page.getByRole("button", { name: "Continue to mentor feedback", exact: true }).click({ force: true });
  await waitText(page, "Mentor Feedback", 60000);
  await shot(page, `${label}-feedback`);

  await waitText(page, "See updated learning plan", 60000);
  await page.getByRole("button", { name: "See updated learning plan", exact: true }).click({ force: true });
  await waitText(page, "Updated Learning Plan", 60000);
  await shot(page, `${label}-updated-plan`);
}

async function verifyDashboardControls(page) {
  await page.goto(`${BASE}/dashboard?presenter=true`);
  await waitText(page, "Fast Forward 3 Days", 60000);
  const has42 = await page.getByText("Submit 42% Score").first().isVisible().catch(() => false);
  const has95 = await page.getByText("Submit 95% Score").first().isVisible().catch(() => false);
  const hasFastForward = await page.getByText("Fast Forward 3 Days").first().isVisible();
  const hasReset = await page.getByText("Reset Journey").first().isVisible().catch(() => false);
  const fastForwardClass = await page
    .getByRole("button", { name: "Fast Forward 3 Days", exact: true })
    .evaluate((el) => el.className);
  const fixedPresenter = await page
    .locator(".fixed.bottom-4.right-4")
    .filter({ hasText: "Presenter controls" })
    .count();

  record("Dashboard hides Submit 42%", !has42);
  record("Dashboard hides Submit 95%", !has95);
  record("Dashboard shows Fast Forward", hasFastForward);
  record("Dashboard hides Reset Journey", !hasReset);
  record("Dashboard has no floating presenter panel", fixedPresenter === 0);
  record("Fast Forward uses primary cyan style", fastForwardClass.includes("bg-cyan-500"));
  await shot(page, "route-controls-dashboard");
}

async function verifyOtherRouteHidden(page) {
  await page.goto(`${BASE}/onboarding`);
  await waitText(page, "Create your learning plan", 30000);
  const anyPresenter = await page.getByText("Presenter controls").first().isVisible().catch(() => false);
  record("Non-dashboard/non-assessment routes hide presenter controls", !anyPresenter);
  await shot(page, "route-controls-onboarding-hidden");
}

async function verifyFastForwardAndReset(page) {
  page.on("dialog", async (dialog) => {
    await dialog.accept();
  });

  await page.goto(`${BASE}/dashboard?presenter=true`);
  await waitText(page, "Fast Forward 3 Days");
  await clickByText(page, "Fast Forward 3 Days");
  await waitText(page, "Accountability", 30000);
  await shot(page, "route-controls-fast-forward");
  record("Fast Forward triggers accountability update", true);

  const hasReset = await page.getByText("Reset Journey").first().isVisible().catch(() => false);
  record("Dashboard hides Reset Journey button", !hasReset);

  await page.keyboard.press("Alt+R");
  await waitText(page, "Create your learning plan", 30000);
  await shot(page, "route-controls-reset");
  record("Alt+R Reset Journey returns to onboarding", true);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });

  try {
    await bootstrapToAssessment(page);
    await verifyAssessmentControls(page);
    await verifyAssessmentButtonStyles(page);
    await verifyDashboardControls(page);
    await bootstrapToAssessment(page);
    await runScoreFlow(page, "flow-42", "Submit 42% Score", "MentorMind is analyzing your learning...");

    // Re-bootstrap before 95% flow to avoid stale per-assessment state after the first completion.
    await bootstrapToAssessment(page);
    await verifyAssessmentControls(page);
    await verifyAssessmentButtonStyles(page);
    await runScoreFlow(page, "flow-95", "Submit 95% Score", "MentorMind detected mastery.");
    await verifyFastForwardAndReset(page);
  } catch (error) {
    record("Route-aware presenter verification", false, error instanceof Error ? error.message : String(error));
    await shot(page, "route-controls-error");
    throw error;
  } finally {
    await browser.close();
    await writeFile(
      path.join(OUT_DIR, "report-route-controls.json"),
      JSON.stringify({ timestamp: new Date().toISOString(), results }, null, 2),
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
