import type { FailoverReason } from "@/lib/ai/providers/types";

function readHttpStatus(error: unknown): number | undefined {
  if (!error || typeof error !== "object") {
    return undefined;
  }

  const candidate = error as {
    status?: unknown;
    statusCode?: unknown;
    code?: unknown;
    cause?: unknown;
  };

  if (typeof candidate.status === "number") {
    return candidate.status;
  }
  if (typeof candidate.statusCode === "number") {
    return candidate.statusCode;
  }
  if (typeof candidate.code === "number") {
    return candidate.code;
  }

  return readHttpStatus(candidate.cause);
}

export function isAbortError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as { name?: string; message?: string };
  if (candidate.name === "AbortError") {
    return true;
  }

  const message = (candidate.message ?? "").toLowerCase();
  return message.includes("aborted") || message.includes("abort");
}

export function isQuotaError(error: unknown, httpStatus?: number): boolean {
  const status = httpStatus ?? readHttpStatus(error);
  if (status === 429) {
    return true;
  }

  const message =
    error instanceof Error
      ? error.message.toLowerCase()
      : typeof error === "string"
        ? error.toLowerCase()
        : JSON.stringify(error).toLowerCase();

  return (
    message.includes("quota") ||
    message.includes("rate limit") ||
    message.includes("resource_exhausted") ||
    message.includes("too many requests")
  );
}

/** Map transport/provider exceptions to a stable failover reason. */
export function classifyTransportError(error: unknown, httpStatus?: number): FailoverReason {
  if (isAbortError(error)) {
    return "timeout";
  }

  if (isQuotaError(error, httpStatus)) {
    return "quota";
  }

  return "api_error";
}

/** Map post-response pipeline failures (parse / schema / structure). */
export function classifyPipelineFailure(
  reason:
    | "empty-response"
    | "invalid-json"
    | "schema-validation"
    | "structure-validation"
    | "missing-api-key"
    | "request-error",
): FailoverReason {
  switch (reason) {
    case "invalid-json":
      return "malformed_json";
    case "schema-validation":
      return "validation";
    case "structure-validation":
      return "structure_validation";
    case "missing-api-key":
      return "missing_api_key";
    case "empty-response":
    case "request-error":
    default:
      return "api_error";
  }
}

export function failoverReasonLabel(reason: FailoverReason): string {
  switch (reason) {
    case "timeout":
      return "timeout";
    case "quota":
      return "quota";
    case "api_error":
      return "API error";
    case "validation":
    case "structure_validation":
      return "validation";
    case "malformed_json":
      return "malformed JSON";
    case "missing_api_key":
      return "missing API key";
    default:
      return reason;
  }
}
