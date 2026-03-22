export type SupplySearchErrorCode =
  | "RATE_LIMIT"
  | "AUTH"
  | "FORBIDDEN"
  | "MODEL_NOT_FOUND"
  | "NETWORK"
  | "EMPTY"
  | "CONFIG"
  | "UNKNOWN";

/** Map raw Gemini / fetch errors to a safe, short message. Never forward full API bodies to the client. */
export function mapGeminiFailure(raw: string): {
  message: string;
  code: SupplySearchErrorCode;
  httpStatus: number;
} {
  const t = raw.toLowerCase();

  if (t.includes("failed to fetch") || t.includes("networkerror") || t.includes("load failed")) {
    return {
      message: "Could not reach the server. Check your connection and try again.",
      code: "NETWORK",
      httpStatus: 503,
    };
  }

  if (
    raw.includes("429") ||
    t.includes("too many requests") ||
    t.includes("resource_exhausted") ||
    t.includes("quota") ||
    t.includes("rate limit")
  ) {
    return {
      message:
        "Google’s Gemini quota or rate limit was hit. Wait a few minutes, try another model (GEMINI_MODEL), or review usage in Google AI Studio.",
      code: "RATE_LIMIT",
      httpStatus: 429,
    };
  }

  if (raw.includes("401") || t.includes("api key not valid") || t.includes("invalid api key")) {
    return {
      message: "The Gemini API key was rejected. Confirm GEMINI_API_KEY in .env.local and restart the dev server.",
      code: "AUTH",
      httpStatus: 401,
    };
  }

  if (raw.includes("403") || (t.includes("permission") && t.includes("denied"))) {
    return {
      message: "Access to Gemini was denied for this key. Check API enablement and restrictions in Google Cloud / AI Studio.",
      code: "FORBIDDEN",
      httpStatus: 403,
    };
  }

  if (
    (raw.includes("404") && t.includes("model")) ||
    t.includes("is not found for api version") ||
    (t.includes("model") && t.includes("not found"))
  ) {
    return {
      message:
        "That model is not available for your key. Set GEMINI_MODEL to one you have access to (for example gemini-1.5-flash).",
      code: "MODEL_NOT_FOUND",
      httpStatus: 502,
    };
  }

  if (t.includes("overloaded") || t.includes("503") || t.includes("service unavailable")) {
    return {
      message: "Gemini is temporarily busy. Try again in a moment.",
      code: "RATE_LIMIT",
      httpStatus: 503,
    };
  }

  return {
    message: "Something went wrong while contacting Gemini. Showing demo routes instead.",
    code: "UNKNOWN",
    httpStatus: 502,
  };
}

export function titleForSupplyErrorCode(code: string): string {
  switch (code) {
    case "RATE_LIMIT":
      return "Rate limit";
    case "AUTH":
      return "API key";
    case "FORBIDDEN":
      return "Access denied";
    case "MODEL_NOT_FOUND":
      return "Model";
    case "NETWORK":
      return "Connection";
    case "EMPTY":
      return "No results";
    case "CONFIG":
      return "Configuration";
    default:
      return "AI unavailable";
  }
}

export function clientFriendlySupplyError(error: unknown): {
  title: string;
  message: string;
  code: SupplySearchErrorCode;
} {
  const raw = error instanceof Error ? error.message : String(error);
  const mapped = mapGeminiFailure(raw);
  return {
    title: titleForSupplyErrorCode(mapped.code),
    message: mapped.message,
    code: mapped.code,
  };
}
