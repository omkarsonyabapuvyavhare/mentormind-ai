import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockGeminiGenerateJson = vi.hoisted(() => vi.fn());
const mockGrokGenerateJson = vi.hoisted(() => vi.fn());
const mockGeminiConfigured = vi.hoisted(() => vi.fn());
const mockGrokConfigured = vi.hoisted(() => vi.fn());

vi.mock("@/lib/ai/providers/gemini-provider", () => ({
  geminiProvider: {
    name: "gemini",
    isConfigured: () => mockGeminiConfigured(),
    getModel: () => "gemini-mock",
    generateJson: mockGeminiGenerateJson,
  },
  GeminiProvider: class {},
}));

vi.mock("@/lib/ai/providers/grok-provider", () => ({
  grokProvider: {
    name: "grok",
    isConfigured: () => mockGrokConfigured(),
    getModel: () => "grok-mock",
    generateJson: mockGrokGenerateJson,
  },
  GrokProvider: class {},
}));

import { runWithProviderFailover } from "@/lib/ai/providers/failover";

describe("AI provider failover", () => {
  beforeEach(() => {
    mockGeminiGenerateJson.mockReset();
    mockGrokGenerateJson.mockReset();
    mockGeminiConfigured.mockReturnValue(true);
    mockGrokConfigured.mockReturnValue(true);
    process.env.AI_PROVIDER_PRIMARY = "gemini";
    process.env.AI_PROVIDER_SECONDARY = "grok";
  });

  afterEach(() => {
    delete process.env.AI_PROVIDER_PRIMARY;
    delete process.env.AI_PROVIDER_SECONDARY;
  });

  it("1. Gemini success → provider gemini", async () => {
    mockGeminiGenerateJson.mockResolvedValue({
      ok: true,
      provider: "gemini",
      text: '{"ok":true}',
      model: "gemini-mock",
    });

    const result = await runWithProviderFailover({
      request: {
        systemInstruction: "sys",
        userContent: "user",
        timeoutMs: 1000,
        context: { flow: "lesson" },
      },
      finalize: async (text) => ({ ok: true, data: JSON.parse(text) }),
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.provider).toBe("gemini");
    }
    expect(mockGrokGenerateJson).not.toHaveBeenCalled();
  });

  it("2. Gemini quota (429) → Grok", async () => {
    mockGeminiGenerateJson.mockResolvedValue({
      ok: false,
      provider: "gemini",
      reason: "quota",
      message: "429 quota",
      httpStatus: 429,
    });
    mockGrokGenerateJson.mockResolvedValue({
      ok: true,
      provider: "grok",
      text: '{"from":"grok"}',
      model: "grok-mock",
    });

    const result = await runWithProviderFailover({
      request: {
        systemInstruction: "sys",
        userContent: "user",
        timeoutMs: 1000,
        context: { flow: "lesson" },
      },
      finalize: async (text) => ({ ok: true, data: JSON.parse(text) }),
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.provider).toBe("grok");
      expect(result.failoverFrom?.reason).toBe("quota");
    }
  });

  it("3. Gemini timeout → Grok", async () => {
    mockGeminiGenerateJson.mockResolvedValue({
      ok: false,
      provider: "gemini",
      reason: "timeout",
      message: "aborted",
    });
    mockGrokGenerateJson.mockResolvedValue({
      ok: true,
      provider: "grok",
      text: '{"from":"grok"}',
      model: "grok-mock",
    });

    const result = await runWithProviderFailover({
      request: {
        systemInstruction: "sys",
        userContent: "user",
        timeoutMs: 1000,
        context: { flow: "intent" },
      },
      finalize: async (text) => ({ ok: true, data: JSON.parse(text) }),
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.provider).toBe("grok");
      expect(result.failoverFrom?.reason).toBe("timeout");
    }
  });

  it("4. Gemini validation failure → Grok", async () => {
    mockGeminiGenerateJson.mockResolvedValue({
      ok: true,
      provider: "gemini",
      text: '{"bad":true}',
      model: "gemini-mock",
    });
    mockGrokGenerateJson.mockResolvedValue({
      ok: true,
      provider: "grok",
      text: '{"good":true}',
      model: "grok-mock",
    });

    let finalizeCalls = 0;
    const result = await runWithProviderFailover({
      request: {
        systemInstruction: "sys",
        userContent: "user",
        timeoutMs: 1000,
        context: { flow: "roadmap" },
      },
      finalize: async (text, provider) => {
        finalizeCalls += 1;
        if (provider === "gemini") {
          return { ok: false, reason: "validation", message: "schema failed" };
        }
        return { ok: true, data: JSON.parse(text) };
      },
    });

    expect(finalizeCalls).toBe(2);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.provider).toBe("grok");
      expect(result.failoverFrom?.reason).toBe("validation");
    }
  });

  it("5. Gemini + Grok both fail → deterministic path (caller)", async () => {
    mockGeminiGenerateJson.mockResolvedValue({
      ok: false,
      provider: "gemini",
      reason: "api_error",
      message: "gemini down",
    });
    mockGrokGenerateJson.mockResolvedValue({
      ok: false,
      provider: "grok",
      reason: "api_error",
      message: "grok down",
    });

    const result = await runWithProviderFailover({
      request: {
        systemInstruction: "sys",
        userContent: "user",
        timeoutMs: 1000,
        context: { flow: "lesson" },
      },
      finalize: async () => ({ ok: true, data: {} }),
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.attempts).toHaveLength(2);
      expect(result.reason).toBe("api_error");
    }
  });
});
