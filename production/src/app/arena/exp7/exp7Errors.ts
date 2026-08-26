/** Map API / voice errors to learner-safe copy (never expose status codes or internal names). */
export function humanizeExp7Error(raw: string): string {
  const text = String(raw ?? "").trim();
  if (!text) return "Something went wrong. Please try again.";

  const lower = text.toLowerCase();
  if (lower.includes("exp7 api") || /^api error/i.test(text) || /^\d{3}$/.test(text)) {
    return "Practice isn't available right now. Try again in a moment.";
  }
  if (lower.includes("openai") || lower.includes("realtime") || lower.includes("api key")) {
    return "Voice practice isn't available right now. Try again in a moment.";
  }
  if (lower.includes("session expired") || lower.includes("session not found")) {
    return "Your session expired — refresh the page and start again.";
  }
  if (lower.includes("microphone") || lower.includes("notallowederror")) {
    return "Microphone access is required. Allow the mic in your browser, then try again.";
  }
  if (lower.includes("conversation not saved")) {
    return text.replace(/^conversation not saved\s*[—-]\s*/i, "We couldn't save that turn — ");
  }
  if (
    lower.includes("not enough content") ||
    lower.includes("insufficient_content") ||
    lower.includes("insufficient content")
  ) {
    return "Not enough content to generate the report.";
  }
  return text;
}

export function parseExp7Error(err: unknown): string {
  if (err instanceof Error) {
    try {
      const data = JSON.parse(err.message) as { error?: string };
      if (data.error) return humanizeExp7Error(data.error);
    } catch {
      /* message is plain text */
    }
    return humanizeExp7Error(err.message);
  }
  return humanizeExp7Error(String(err));
}
