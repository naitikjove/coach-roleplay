import type { TranscriptEntry } from "@/lib/arena/exp7/sessionStore";

export function formatExp7Transcript(transcript: TranscriptEntry[]): string {
  if (!transcript.length) return "(empty)";
  return transcript
    .map((t) => {
      if (t.role === "learner") return `Learner: ${t.text}`;
      const id = String(t.speakerId || "").toLowerCase();
      const who =
        id === "jordan" || id === "claire"
          ? "Claire"
          : id === "sam"
            ? "Sam"
            : id === "alex"
              ? "Alex"
              : t.speakerId || "Claire";
      return `${who}: ${t.text}`;
    })
    .join("\n");
}

export function parseJsonObject<T extends Record<string, unknown>>(raw: string): Partial<T> {
  const text = raw.trim();
  if (!text) return {};
  try {
    return JSON.parse(text) as T;
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]) as T;
      } catch {
        return {};
      }
    }
    return {};
  }
}
