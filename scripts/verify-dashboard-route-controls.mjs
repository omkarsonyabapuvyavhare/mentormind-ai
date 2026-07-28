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

async function waitText(page, text, timeout = 60000) {
  await page.getByText(text, { exact: false }).first().waitFor({ state: "visible", timeout });
}

async function clickByText(page, text) {
  await page.evaluate((label) => {
    const nodes = [...document.querySelectorAll("button,a")];
    const target = nodes.find((node) => node.textContent?.trim() === label);
    target?.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
  }, text);
}

async function bootstrapToDashboard(page) {
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
      const btn = [...(nav?.querySelectorAll("button") ?? [])].find((item) => item.textContent?.trim() === "Continue");
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
  await page.waitForURL(/\/dashboard/, { timeout: 120000 });
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });

  try {
    page.on("dialog", async (dialog) => {
      await dialog.accept();
    });

    await bootstrapToDashboard(page);
    await page.goto(`${BASE}/dashboard?presenter=true`);
    await waitText(page, "Start Learning", 60000);
    await page.screenshot({
      path: path.join(OUT_DIR, "route-mapping-dashboard.png"),
      fullPage: true,
    });

    const presenterControlsCards = await page.getByText("Presenter controls", { exact: true }).count();
    const hiddenShortcuts = await page
      .getByText("Hidden simulation shortcuts", { exact: true })
      .isVisible()
      .catch(() => false);
    const fastForwardButtons = await page.getByRole("button", { name: /Fast [Ff]orward 3 [Dd]ays/i }).count();
    const hasReset = await page
      .getByText("Reset Journey", { exact: true })
      .isVisible()
      .catch(() => false);
    const has42 = await page
      .getByText("Submit 42% Score", { exact: true })
      .isVisible()
      .catch(() => false);
    const has95 = await page
      .getByText("Submit 95% Score", { exact: true })
      .isVisible()
      .catch(() => false);

    await writeFile(
      path.join(OUT_DIR, "report-dashboard-controls.json"),
      JSON.stringify(
        {
          presenterControlsCards,
          hiddenShortcuts,
          fastForwardButtons,
          hasReset,
          has42,
          has95,
          url: page.url(),
        },
        null,
        2,
      ),
    );

    if (presenterControlsCards > 0 || hiddenShortcuts || fastForwardButtons > 1 || hasReset || has42 || has95) {
      throw new Error(
        `Unexpected dashboard controls visibility: presenterCards=${presenterControlsCards} hiddenShortcuts=${hiddenShortcuts} fastForwardButtons=${fastForwardButtons} reset=${hasReset} 42=${has42} 95=${has95}`,
      );
    }

    console.log("PASS: No duplicate Presenter Controls card on dashboard");
    console.log(`PASS: Fast Forward button count is ${fastForwardButtons} (max 1)`);

    await page.evaluate(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { altKey: true, key: "r", bubbles: true }));
    });
    await page.waitForURL(/\/onboarding/, { timeout: 90000 });
    console.log("PASS: Alt+R reset shortcut works on dashboard");
    await page.screenshot({
      path: path.join(OUT_DIR, "route-mapping-dashboard-reset.png"),
      fullPage: true,
    });
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
