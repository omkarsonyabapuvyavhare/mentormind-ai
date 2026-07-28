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

async function clickByText(page, text) {
  await page.evaluate((label) => {
    const buttons = [...document.querySelectorAll("button,a")];
    const match = buttons.find(
      (el) => el.textContent?.trim().toLowerCase() === label.toLowerCase() ||
        el.textContent?.toLowerCase().includes(label.toLowerCase()),
    );
    match?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
  }, text);
}

const GOAL =
  "I am a beginner and want to learn Python in eight weeks. I can study six hours per week and prefer practical exercises.";

async function waitText(page, text, timeout = 40000) {
  await page.getByText(text, { exact: false }).first().waitFor({ state: "visible", timeout });
}

async function bootstrapDemoLearner(page) {
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
  await clickByText(page, "Generate my personalized plan");
  await page.waitForURL(/\/dashboard/, { timeout: 180000 });
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });

  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });
  page.on("pageerror", (error) => {
    consoleErrors.push(error.message);
  });

  try {
    page.on("dialog", async (dialog) => {
      await dialog.accept();
    });

    await bootstrapDemoLearner(page);
    await page.goto(`${BASE}/roadmap`);
    await page.waitForTimeout(5000);

    const hasOverallCompletion = await page.getByText("Overall completion").isVisible().catch(() => false);
    const percentageVisible = await page.locator("text=/\\d+%/").first().isVisible().catch(() => false);
    const taskCountVisible = await page
      .getByText(/\d+ of \d+ tasks completed/)
      .isVisible()
      .catch(() => false);
    const progressBar = await page
      .getByRole("progressbar", { name: "Overall roadmap completion" })
      .isVisible()
      .catch(() => false);

    const hasSnapshotWarning = consoleErrors.some((entry) =>
      entry.includes("getSnapshot should be cached"),
    );
    const hasDepthError = consoleErrors.some((entry) =>
      entry.includes("Maximum update depth exceeded"),
    );

    await page.screenshot({
      path: path.join(OUT_DIR, "roadmap-completion.png"),
      fullPage: true,
    });

    const report = {
      url: page.url(),
      hasOverallCompletion,
      percentageVisible,
      taskCountVisible,
      progressBar,
      hasSnapshotWarning,
      hasDepthError,
      consoleErrors,
    };

    await writeFile(
      path.join(OUT_DIR, "report-roadmap-completion.json"),
      JSON.stringify(report, null, 2),
    );

    if (hasSnapshotWarning || hasDepthError) {
      throw new Error(`Roadmap page console errors: ${consoleErrors.join(" | ")}`);
    }

    if (!(hasOverallCompletion && percentageVisible && taskCountVisible && progressBar)) {
      throw new Error(`Roadmap completion UI incomplete: ${JSON.stringify(report)}`);
    }

    console.log("Roadmap completion verification passed.", report);
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
