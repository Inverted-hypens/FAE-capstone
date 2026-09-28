import { describe, expect, it } from "vitest";
import { APICallError, RetryError } from "ai";
import { getChatErrorCode } from "./chat-errors";

describe("getChatErrorCode", () => {
  it("returns 'rate_limit' for a plain APICallError with statusCode 429", () => {
    const error = new APICallError({
      message: "Rate limit exceeded",
      url: "https://api.example.com",
      requestBodyValues: {},
      statusCode: 429,
    });

    expect(getChatErrorCode(error)).toBe("rate_limit");
  });

  it("returns 'rate_limit' for a RetryError (reason 'maxRetriesExceeded') whose errors are a 503 APICallError then a 429 APICallError", () => {
    const err503 = new APICallError({
      message: "Service unavailable",
      url: "https://api.example.com",
      requestBodyValues: {},
      statusCode: 503,
    });
    const err429 = new APICallError({
      message: "Rate limit exceeded",
      url: "https://api.example.com",
      requestBodyValues: {},
      statusCode: 429,
    });

    const error = new RetryError({
      message: "Retries failed",
      reason: "maxRetriesExceeded",
      errors: [err503, err429],
    });

    expect(getChatErrorCode(error)).toBe("rate_limit");
  });

  it("returns 'generic' for a RetryError whose last error is a 503", () => {
    const err429 = new APICallError({
      message: "Rate limit exceeded",
      url: "https://api.example.com",
      requestBodyValues: {},
      statusCode: 429,
    });
    const err503 = new APICallError({
      message: "Service unavailable",
      url: "https://api.example.com",
      requestBodyValues: {},
      statusCode: 503,
    });

    const error = new RetryError({
      message: "Retries failed",
      reason: "maxRetriesExceeded",
      errors: [err429, err503],
    });

    expect(getChatErrorCode(error)).toBe("generic");
  });

  it("returns 'generic' for a plain Error", () => {
    const error = new Error("Something broke");

    expect(getChatErrorCode(error)).toBe("generic");
  });
});
