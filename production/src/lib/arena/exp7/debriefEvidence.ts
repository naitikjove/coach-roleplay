import type { TranscriptEntry } from "@/lib/arena/exp7/sessionStore";

export type Exp7DebriefEvidenceItem = {
  note: string;
  learnerQuote: string;
  suggestedLine?: string;
};

export function learnerLinesFromTranscript(transcript: TranscriptEntry[]): string[] {
  return transcript
    .filter((t) => t.role === "learner")
    .map((t) => t.text.trim())
    .filter(Boolean);
}

function normalizeForMatch(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[^\w\s']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function wordOverlap(a: string, b: string): number {
  const wa = new Set(a.split(/\s+/).filter((w) => w.length > 2));
  const wb = new Set(b.split(/\s+/).filter((w) => w.length > 2));
  if (!wa.size || !wb.size) return 0;
  let shared = 0;
  for (const w of wa) {
    if (wb.has(w)) shared += 1;
  }
  return shared / Math.max(wa.size, wb.size);
}

/**
 * Prefer a contiguous span from the learner line that matches the LLM quote.
 * Avoid expanding every substring into the full turn (which collapses highlights).
 */
function extractSpanFromLine(line: string, quote: string): string | null {
  const trimmedQuote = quote.trim();
  if (!trimmedQuote) return null;

  const lowerLine = line.toLowerCase();
  const lowerQuote = trimmedQuote.toLowerCase();
  const exactIndex = lowerLine.indexOf(lowerQuote);
  if (exactIndex >= 0) {
    return line.slice(exactIndex, exactIndex + trimmedQuote.length).trim();
  }

  const normalizedLine = normalizeForMatch(line);
  const normalizedQuote = normalizeForMatch(trimmedQuote);
  if (!normalizedQuote || !normalizedLine.includes(normalizedQuote)) return null;

  // Quote is a cleaned substring — keep the model's wording for display uniqueness.
  return trimmedQuote.length <= line.length + 24 ? trimmedQuote : null;
}

/** Map an LLM quote to a learner utterance span (prefer partial highlight over full turn). */
export function resolveLearnerQuote(
  quote: string,
  transcript: TranscriptEntry[],
): string | null {
  const trimmed = quote.trim();
  if (!trimmed) return null;

  const lines = learnerLinesFromTranscript(transcript);
  if (!lines.length) return null;

  const normalizedQuote = normalizeForMatch(trimmed);

  for (const line of lines) {
    const span = extractSpanFromLine(line, trimmed);
    if (span) return span;
  }

  // If the quote nearly covers the whole line, use the full line.
  for (const line of lines) {
    const overlap = wordOverlap(normalizedQuote, normalizeForMatch(line));
    if (overlap >= 0.75) return line;
  }

  let best: { line: string; score: number } | null = null;
  for (const line of lines) {
    const score = wordOverlap(normalizedQuote, normalizeForMatch(line));
    if (!best || score > best.score) {
      best = { line, score };
    }
  }

  // Weak fuzzy match: only keep if unique enough; still prefer span-length quote when short.
  if (best && best.score >= 0.45) {
    if (trimmed.length < best.line.length * 0.7) return trimmed;
    return best.line;
  }

  return null;
}

export function truncateQuote(text: string, max = 160): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trim()}…`;
}

function firstMatchingLearnerLine(
  transcript: TranscriptEntry[],
  pattern: RegExp,
): string | null {
  for (const line of learnerLinesFromTranscript(transcript)) {
    if (pattern.test(line)) return line;
  }
  return null;
}

export function lastLearnerLine(transcript: TranscriptEntry[]): string | null {
  const lines = learnerLinesFromTranscript(transcript);
  return lines.length ? lines[lines.length - 1] : null;
}

export function pickLearnerLineForPattern(
  transcript: TranscriptEntry[],
  pattern: RegExp,
): string | null {
  return firstMatchingLearnerLine(transcript, pattern) || lastLearnerLine(transcript);
}

type RawEvidence = {
  note?: string;
  learnerQuote?: string;
  suggestedLine?: string;
};

export function normalizeEvidenceItem(
  raw: RawEvidence | string,
  transcript: TranscriptEntry[],
  options?: { requireSuggestedLine?: boolean; usedQuotes?: Set<string> },
): Exp7DebriefEvidenceItem | null {
  if (typeof raw === "string") {
    const note = raw.trim();
    if (!note) return null;
    const fallbackQuote = unusedQuoteFallback(transcript, options?.usedQuotes);
    if (!fallbackQuote) return { note, learnerQuote: "" };
    options?.usedQuotes?.add(fallbackQuote);
    return { note, learnerQuote: fallbackQuote };
  }

  const note = String(raw.note || "").trim();
  if (!note) return null;

  const rawQuote = String(raw.learnerQuote || "").trim();
  let resolved = resolveLearnerQuote(rawQuote, transcript) || "";

  if (resolved && options?.usedQuotes?.has(normalizeForMatch(resolved))) {
    // Same span already used — try another learner line before collapsing highlights.
    const alt = unusedQuoteFallback(transcript, options.usedQuotes);
    if (alt) resolved = alt;
  }

  if (!resolved) {
    resolved = unusedQuoteFallback(transcript, options?.usedQuotes) || "";
  }

  if (resolved) options?.usedQuotes?.add(normalizeForMatch(resolved));

  const item: Exp7DebriefEvidenceItem = {
    note,
    learnerQuote: resolved,
  };

  const suggested = String(raw.suggestedLine || "").trim();
  if (options?.requireSuggestedLine && suggested) {
    item.suggestedLine = suggested;
  } else if (suggested) {
    item.suggestedLine = suggested;
  }

  return item;
}

function unusedQuoteFallback(
  transcript: TranscriptEntry[],
  used?: Set<string>,
): string {
  for (const line of learnerLinesFromTranscript(transcript)) {
    const key = normalizeForMatch(line);
    if (used?.has(key)) continue;
    return line;
  }
  return lastLearnerLine(transcript) || "";
}

export function trimEvidenceItems(
  items: Exp7DebriefEvidenceItem[],
  max = 5,
): Exp7DebriefEvidenceItem[] {
  return items.filter((item) => item.note.trim()).slice(0, max);
}
