import type { TranscriptEntry } from "@/lib/arena/exp7/sessionStore";

/** Minimum learner turns required before a debrief report can be generated. */
export const EXP7_MIN_REPORT_LEARNER_TURNS = 4;

/** Minimum total learner words required before a debrief report can be generated. */
export const EXP7_MIN_REPORT_LEARNER_WORDS = 25;

export const EXP7_INSUFFICIENT_CONTENT_MESSAGE =
  "Not enough content to generate the report.";

export type Exp7ContentSufficiency = {
  ok: boolean;
  learnerTurns: number;
  learnerWords: number;
  minTurns: number;
  minWords: number;
  message: string | null;
};

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}

/** Count non-empty learner turns and total learner words in a transcript. */
export function measureLearnerContent(transcript: TranscriptEntry[]): {
  learnerTurns: number;
  learnerWords: number;
} {
  let learnerTurns = 0;
  let learnerWords = 0;
  for (const entry of transcript) {
    if (entry.role !== "learner") continue;
    const text = String(entry.text ?? "").trim();
    if (!text) continue;
    learnerTurns += 1;
    learnerWords += countWords(text);
  }
  return { learnerTurns, learnerWords };
}

/**
 * Report gate: learner must have at least 4 turns AND at least 25 words.
 * Both conditions are required.
 */
export function assessReportContentSufficiency(
  transcript: TranscriptEntry[],
): Exp7ContentSufficiency {
  const { learnerTurns, learnerWords } = measureLearnerContent(transcript);
  const ok =
    learnerTurns >= EXP7_MIN_REPORT_LEARNER_TURNS &&
    learnerWords >= EXP7_MIN_REPORT_LEARNER_WORDS;
  return {
    ok,
    learnerTurns,
    learnerWords,
    minTurns: EXP7_MIN_REPORT_LEARNER_TURNS,
    minWords: EXP7_MIN_REPORT_LEARNER_WORDS,
    message: ok ? null : EXP7_INSUFFICIENT_CONTENT_MESSAGE,
  };
}
