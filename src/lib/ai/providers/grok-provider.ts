import "server-only";

import {
  getGrokModel,
  getXaiApiKey,
  getXaiBaseUrl,
  isGrokConfigured,
} from "@/lib/ai/providers/config";
import { classifyTransportError } from "@/lib/ai/providers/classify-error";
import type {
  AIProvider,
  JsonCompletionRequest,
  JsonCompletionResult,
} from "@/lib/ai/providers/types";

interface XaiChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
  error?: {
    message?: string;
    code?: string | number;
  };
}

export class GrokProvider implements AIProvider {
  readonly name = "grok" as const;

  isConfigured(): boolean {
    return isGrokConfigured();
  }

  getModel(): string {
    return getGrokModel();
  }

  async generateJson(request: JsonCompletionRequest): Promise<JsonCompletionResult> {
    const apiKey = getXaiApiKey();

    if (!apiKey) {
      return {
        ok: false,
        provider: this.name,
        reason: "missing_api_key",
        message: "xAI API key is not configured.",
      };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), request.timeoutMs);

    try {
      const response = await fetch(`${getXaiBaseUrl()}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.getModel(),
          temperature: 0.2,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: request.systemInstruction },
            { role: "user", content: request.userContent },
          ],
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        let message = `Grok API error (${response.status}).`;
        try {
          const errBody = (await response.json()) as XaiChatCompletionResponse;
          if (errBody.error?.message) {
            message = errBody.error.message;
          }
        } catch {
          // keep status message
        }

        const reason = classifyTransportError(new Error(message), response.status);
        return {
          ok: false,
          provider: this.name,
          reason,
          message,
          httpStatus: response.status,
        };
      }

      const body = (await response.json()) as XaiChatCompletionResponse;
      const text = body.choices?.[0]?.message?.content?.trim();

      if (!text) {
        return {
          ok: false,
          provider: this.name,
          reason: "api_error",
          message: "Grok returned empty content.",
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
        message: error instanceof Error ? error.message : "Grok request failed.",
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

export const grokProvider = new GrokProvider();
