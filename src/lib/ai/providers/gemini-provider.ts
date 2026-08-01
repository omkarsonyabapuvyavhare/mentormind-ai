import "server-only";

import { GoogleGenAI } from "@google/genai";

import {
  getGeminiApiKey,
  getGeminiModel,
  isGeminiConfigured,
} from "@/lib/ai/providers/config";
import { classifyTransportError } from "@/lib/ai/providers/classify-error";
import type {
  AIProvider,
  JsonCompletionRequest,
  JsonCompletionResult,
} from "@/lib/ai/providers/types";

export class GeminiProvider implements AIProvider {
  readonly name = "gemini" as const;

  isConfigured(): boolean {
    return isGeminiConfigured();
  }

  getModel(): string {
    return getGeminiModel();
  }

  async generateJson(request: JsonCompletionRequest): Promise<JsonCompletionResult> {
    const apiKey = getGeminiApiKey();

    if (!apiKey) {
      return {
        ok: false,
        provider: this.name,
        reason: "missing_api_key",
        message: "Gemini API key is not configured.",
      };
    }

    const client = new GoogleGenAI({ apiKey });
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), request.timeoutMs);

    try {
      const response = await client.models.generateContent({
        model: this.getModel(),
        contents: request.userContent,
        config: {
          systemInstruction: request.systemInstruction,
          responseMimeType: "application/json",
          abortSignal: controller.signal,
        },
      });

      const text = response.text?.trim();

      if (!text) {
        return {
          ok: false,
          provider: this.name,
          reason: "api_error",
          message: "Gemini returned empty content.",
        };
      }

      return {
        ok: true,
        provider: this.name,
        text,
        model: this.getModel(),
      };
    } catch (error) {
      const reason = classifyTransportError(error);
      return {
        ok: false,
        provider: this.name,
        reason,
        message: error instanceof Error ? error.message : "Gemini request failed.",
        httpStatus: typeof (error as { status?: number })?.status === "number"
          ? (error as { status: number }).status
          : undefined,
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

export const geminiProvider = new GeminiProvider();
