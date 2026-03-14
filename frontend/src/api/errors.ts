import { ApiClientError } from "./http";

export function getApiErrorMessage(error: unknown, fallback = "Something went wrong") {
  if (error instanceof ApiClientError) {
    switch (error.code) {
      case "RATE_LIMITED":
        return "Too many requests. Please try again shortly.";
      case "INVALID_CREDENTIALS":
        return "Invalid email or password.";
      case "VALIDATION_ERROR":
        return "Please check the form and try again.";
      default:
        return error.message || fallback;
    }
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
}
