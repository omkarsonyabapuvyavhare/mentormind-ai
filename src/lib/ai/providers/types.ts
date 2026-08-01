/** Logical AI vendors used for content bootstrap only (not Decision Engine). */
export type AiProviderName = "gemini" | "grok";

/** Human-readable failover reasons (development observability). */
export type FailoverReason =
  | "timeout"
  | "quota"
  | "api_error"
  | "validation"
  | "structure_validation"
  | "malformed_json"
  | "missing_api_key";

export interface JsonCompletionRequest {
  systemInstruction: string;
  userContent: string;
  timeoutMs: number;
  /** Optional correlation for logs. */
  context?: {
    goalId?: string;
    topicId?: string;
    flow?: "intent" | "roadmap" | "lesson";
  };
}

export interface JsonCompletionSuccess {
  ok: true;
  provider: AiProviderName;
  text: string;
  model: string;
}

export interface JsonCompletionFailure {
  ok: false;
  provider: AiProviderName;
  reason: FailoverReason;
  message: string;
  httpStatus?: number;
}

export type JsonCompletionResult = JsonCompletionSuccess | JsonCompletionFailure;

export interface AIProvider {
  readonly name: AiProviderName;
  isConfigured(): boolean;
  getModel(): string;
  generateJson(request: JsonCompletionRequest): Promise<JsonCompletionResult>;
}
