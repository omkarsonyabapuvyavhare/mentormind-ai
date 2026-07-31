/**
 * Minimal Gemini connectivity probe. Never prints the API key.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GoogleGenAI } from "@google/genai";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envText = fs.readFileSync(path.join(root, ".env.local"), "utf8");
const keyMatch = envText.match(/^GEMINI_API_KEY=(.*)$/m);
const modelMatch = envText.match(/^GEMINI_MODEL=(.*)$/m);
const apiKey = (keyMatch?.[1] ?? "").trim().replace(/^["']|["']$/g, "");
const model = (modelMatch?.[1] ?? "gemini-3-flash-preview").trim() || "gemini-3-flash-preview";

const result = {
  keyPresent: Boolean(apiKey),
  keyNonEmpty: apiKey.length > 0,
  model,
  connectivity: null,
  errorName: null,
  errorMessage: null,
  authError: false,
  quotaError: false,
  permissionError: false,
  durationMs: null,
};

if (!apiKey) {
  result.connectivity = "no-key";
  console.log(JSON.stringify(result, null, 2));
  process.exit(1);
}

const client = new GoogleGenAI({ apiKey });
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 45_000);
const started = Date.now();

try {
  const response = await client.models.generateContent({
    model,
    contents:
      'Return JSON only: {"ok":true,"topic":"python-variables","snippet":"x = 1"}',
    config: {
      responseMimeType: "application/json",
      abortSignal: controller.signal,
    },
  });

  result.durationMs = Date.now() - started;
  const text = response.text ?? "";
  result.connectivity = text.length > 0 ? "success" : "empty-response";
  result.responseChars = text.length;
} catch (error) {
  result.durationMs = Date.now() - started;
  result.connectivity = "failed";
  result.errorName = error instanceof Error ? error.name : "Unknown";
  const message = error instanceof Error ? error.message : String(error);
  result.errorMessage = message.slice(0, 200);
  const lower = message.toLowerCase();
  result.authError = /api key|unauthenticated|401|403|invalid.*key|permission denied/.test(lower);
  result.quotaError = /quota|rate limit|429|resource exhausted/.test(lower);
  result.permissionError = /permission|not allowed|forbidden/.test(lower);
  if (error instanceof Error && error.name === "AbortError") {
    result.connectivity = "timeout";
  }
} finally {
  clearTimeout(timeoutId);
}

console.log(JSON.stringify(result, null, 2));
