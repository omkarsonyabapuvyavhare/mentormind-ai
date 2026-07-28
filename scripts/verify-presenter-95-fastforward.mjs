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

async function waitText(page, text, timeout = 60000) {
  await page.getByText(text, { exact: false }).first().waitFor({ state: "visible", timeout });
}

async function clickButton(page, name) {
  await page.getByRole("button", { name, exact: true }).first().click({ force: true, timeout: 30000 });
}

async function setupToAssessment(page) {
  await page.goto(`${BASE}/onboarding?presenter=true`);
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload();

  await page.getByLabel("Tell MentorMind what you want to achieve").fill(GOAL);
  await clickButton(page, "Understand my goal");
  await waitText(page, "Continue to skill level", 30000);
  await clickButton(page, "Continue to skill level");

  await page.evaluate(() => {
    const buttons = [...document.querySelectorAll("button")];
    const match = buttons.find(
      (btn) =>
        btn.textContent?.includes("Complete beginner") &&
        btn.textContent?.includes("New to this topic"),
    );
    match?.click();
  });

  const clickContinue = async () => {
    await page.evaluate(() => {
      const nav = document.querySelector("div.flex.flex-col-reverse");
      const btn = [...(nav?.querySelectorAll("button") ?? [])].find((b) => b.textContent?.trim() === "Continue");
      btn?.click();
    });
    await page.waitForTimeout(300);
  };

  await clickContinue();
  await waitText(page, "Timeline and availability");
  await clickContinue();
  await waitText(page, "Learning preferences");
  await clickContinue();
  await waitText(page, "Review your learning plan inputs");

  await page.evaluate(() => {
    const nav = document.querySelector("div.flex.flex-col-reverse");
    const btn = [...(nav?.querySelectorAll("button") ?? [])].find((b) =>
      b.textContent?.includes("Generate my personalized plan"),
    );
    btn?.click();
  });

  await page.waitForURL(/\/dashboard/, { timeout: 120000 });
  await clickButton(page, "Start Learning");
  await page.waitForURL(/\/learn\//, { timeout: 60000 });
  await clickButton(page, "Start topic check-in");
  await page.waitForURL(/\/assessment\//, { timeout: 60000 });
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  try {
    page.on("dialog", async (dialog) => {
      await dialog.accept();
    });

    await setupToAssessment(page);
    await waitText(page, "1 of 5", 30000);
    await shot(page, "95flow-assessment-with-presenter-buttons");
    record(
      "Assessment shows inline presenter controls",
      await page.getByText("Submit 95% Score").isVisible(),
    );

    await clickButton(page, "Submit 95% Score");
    const masteryVisible = await page
      .getByText("MentorMind detected mastery", { exact: false })
      .first()
      .isVisible()
      .catch(() => false);
    if (!masteryVisible) {
      await waitText(page, "MentorMind detected mastery", 15000);
    }
    await shot(page, "95flow-mastery-overlay");

    await waitText(page, "AI reasoning summary", 30000);
    await shot(page, "95flow-reasoning");
    await clickButton(page, "Continue to mentor feedback");
    await page.waitForURL(/\/mentor\/feedback/, { timeout: 60000 });
    await waitText(page, "Your AI mentor reviewed your assessment.", 60000);
    await shot(page, "95flow-mentor-feedback");

    await clickButton(page, "See updated learning plan");
    await page.waitForURL(/\/plan-updated/, { timeout: 60000 });
    await waitText(page, "Updated Learning Plan", 60000);
    await shot(page, "95flow-updated-roadmap");
    record("95% path reaches updated roadmap", true);

    await page.goto(`${BASE}/dashboard?presenter=true`);
    await waitText(page, "Start Learning", 30000);
    await clickButton(page, "Fast Forward 3 Days");
    await waitText(page, "Accountability", 30000);
    await shot(page, "95flow-fast-forward-accountability");
    record("Fast Forward shows accountability", true);

    await page.keyboard.press("Alt+R");
    await waitText(page, "Create your learning plan", 30000);
    await shot(page, "95flow-reset-journey");
    record("Reset journey returns onboarding state", true);
  } catch (error) {
    record("95 + fast-forward runtime", false, error instanceof Error ? error.message : String(error));
    await shot(page, "95flow-error-state");
    throw error;
  } finally {
    await browser.close();
    await writeFile(
      path.join(OUT_DIR, "report-95-fastforward.json"),
      JSON.stringify({ timestamp: new Date().toISOString(), results }, null, 2),
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
