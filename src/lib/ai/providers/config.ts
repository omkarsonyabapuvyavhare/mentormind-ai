import "server-only";

import type { AiProviderName } from "@/lib/ai/providers/types";

const DEFAULT_PRIMARY: AiProviderName = "gemini";
const DEFAULT_SECONDARY: AiProviderName = "grok";
const DEFAULT_GEMINI_MODEL = "gemini-3-flash-preview";
const DEFAULT_GROK_MODEL = "grok-3";
const DEFAULT_XAI_BASE_URL = "https://api.x.ai/v1";

function parseProviderName(raw: string | undefined, fallback: AiProviderName): AiProviderName {
  const normalized = raw?.trim().toLowerCase();
  if (normalized === "gemini" || normalized === "grok") {
    return normalized;
  }
  return fallback;
}

export function getPrimaryProviderName(): AiProviderName {
  return parseProviderName(process.env.AI_PROVIDER_PRIMARY, DEFAULT_PRIMARY);
}

export function getSecondaryProviderName(): AiProviderName {
  const secondary = parseProviderName(process.env.AI_PROVIDER_SECONDARY, DEFAULT_SECONDARY);
  const primary = getPrimaryProviderName();
  // Guard against identical primary/secondary configuration.
  return secondary === primary ? (primary === "gemini" ? "grok" : "gemini") : secondary;
}

export function getGeminiApiKey(): string | undefined {
  return process.env.GEMINI_API_KEY?.trim() || undefined;
}

export function getXaiApiKey(): string | undefined {
  return process.env.XAI_API_KEY?.trim() || undefined;
}

export function getGeminiModel(): string {
  return process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
}

export function getGrokModel(): string {
  return process.env.XAI_MODEL?.trim() || DEFAULT_GROK_MODEL;
}

export function getXaiBaseUrl(): string {
  const raw = process.env.XAI_BASE_URL?.trim();
  if (!raw) {
    return DEFAULT_XAI_BASE_URL;
  }
  return raw.replace(/\/$/, "");
}

export function isGeminiConfigured(): boolean {
  return Boolean(getGeminiApiKey());
}

export function isGrokConfigured(): boolean {
  return Boolean(getXaiApiKey());
}

export function isAnyAiProviderConfigured(): boolean {
  return isGeminiConfigured() || isGrokConfigured();
}

export function resolveTimeoutMs(
  envName: "AI_INTENT_PARSE_TIMEOUT_MS" | "AI_ROADMAP_GENERATE_TIMEOUT_MS" | "AI_LESSON_GENERATE_TIMEOUT_MS",
  fallbackMs: number,
  secondaryEnvName?: "AI_INTENT_PARSE_TIMEOUT_MS",
): number {
  const raw = process.env[envName] ?? (secondaryEnvName ? process.env[secondaryEnvName] : undefined);
  const parsed = raw ? Number(raw) : fallbackMs;

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallbackMs;
  }

  return parsed;
}
