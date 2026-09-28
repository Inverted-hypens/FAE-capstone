import { APICallError, RetryError } from "ai";

export function getChatErrorCode(error: unknown): "rate_limit" | "generic" {
  const inspectedError = RetryError.isInstance(error) ? error.lastError : error;

  if (APICallError.isInstance(inspectedError) && inspectedError.statusCode === 429) {
    return "rate_limit";
  }

  return "generic";
}
