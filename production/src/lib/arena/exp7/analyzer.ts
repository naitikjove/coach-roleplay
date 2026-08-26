import type { Exp7CompetencyScore } from "@/app/arena/exp7/exp7Types";
import { loadOpenAiKey } from "@/lib/arena/loadOpenAiKey";
import {
  headlineLabel,
  loadAnalyzerPrompt,
  loadExp7Scene,
  type Exp7SceneConfig,
} from "@/lib/arena/exp7/content";
import {
  lastLearnerLine,
  normalizeEvidenceItem,
  pickLearnerLineForPattern,
  trimEvidenceItems,
  type Exp7DebriefEvidenceItem,
} from "@/lib/arena/exp7/debriefEvidence";
import type { TranscriptEntry } from "@/lib/arena/exp7/sessionStore";
import { formatExp7Transcript, parseJsonObject } from "@/lib/arena/exp7/transcript";

export type Exp7DebriefPayload = {
  score: number;
  headline: "nailed_it" | "solid" | "try_again";
  headlineLabel: string;
  /** 1–2 sentence coach recap. */
  summary?: string;
  strengths: Exp7DebriefEvidenceItem[];
  improvements: Exp7DebriefEvidenceItem[];
  /** Note-only one-liners (preferred UI). */
  didWell?: string[];
  keyTakeaways?: string[];
  transcriptImprovements?: Exp7DebriefEvidenceItem[];
  lessonRef?: string;
  lessonTitle?: string;
  lessonSlug?: string;
  /** Per-competency ratings (Jordan multi-anchor and future multi-skill scenes). */
  competencies?: Exp7CompetencyScore[];
  /** Sum of the four competency scores. Untested competencies contribute 0. */
  sumScore?: number;
  /** Always 4 competencies x 10 for multi-anchor scenes. */
  maxScore?: number;
  /** round(sumScore / maxScore * 100). */
  percent?: number;
  /** True when the model returned no usable grade — UI must not treat this as a scored 0%. */
  evaluationFailed?: boolean;
};

export type { Exp7CompetencyScore };

type RawEvidence = {
  note?: string;
  learnerQuote?: string;
  suggestedLine?: string;
};

type AnalyzerPayload = {
  score?: number;
  headline?: string;
  summary?: string;
  strengths?: Array<RawEvidence | string>;
  improvements?: Array<RawEvidence | string>;
  didWell?: Array<string | RawEvidence>;
  keyTakeaways?: Array<string | RawEvidence>;
  transcriptImprovements?: Array<RawEvidence | string>;
  bullets?: string[];
  competencies?: Array<{
    id?: string;
    name?: string;
    score?: number | null;
    level?: string;
    administered?: boolean;
    goals?: Array<{ id?: string; points?: number; max?: number; quote?: string }>;
    note?: string;
    learnerQuote?: string;
  }> | Record<string, unknown>;
  sumScore?: number;
  maxScore?: number;
  percent?: number;
};

export type Exp7DebriefSections = {
  strengths: Exp7DebriefEvidenceItem[];
  improvements: Exp7DebriefEvidenceItem[];
};

export type Exp7AnalyzerDebug = {
  formattedTranscript: string;
  analyzerUserMessage: string;
  rawResponse?: string;
  parsed?: AnalyzerPayload;
  scoreBeforeFloor?: number;
  scoreAdjusted?: boolean;
  bulletsSanitized?: boolean;
};

export type Exp7AnalyzerResult = {
  debrief: Exp7DebriefPayload;
  debug: Exp7AnalyzerDebug;
};

const LEARNER_REFUSAL_ON_MAIN = [
  /\b(can't|cannot|won't|not going to|i'm not going to)\b/i,
  /\b(not like (before|old times|we used to|launch))\b/i,
  /\b(not redoing|won't redo|can't redo|not rewriting)\b/i,
  /\b(can't take (that|this|it) on)\b/i,
  /\b(you (own|are the owner)|your (demo|slide|deck|walkthrough|prep))\b/i,
];

const LEARNER_PARTIAL_PUSHBACK = [
  /^\s*no\b[,.]?/i,
  /\bdon'?t trust\b/i,
];

const LEARNER_EXPLORATION = [
  /\b(why|what if|how|when|who)\b/i,
  /\?/,
];

const EXPLICIT_CAVE_PATTERNS = [
  /\b(i('ll| will) (redo|rewrite|polish|do it for you|take care of|handle it for you))\b/i,
  /\b(sure,? i('ll| will) (do|handle|rewrite|polish|take))\b/i,
  /\b(happy to (redo|rewrite|polish|do it for you))\b/i,
];

const CHARACTER_RESOLUTION_PATTERNS = [
  /\b(i('ll| will) (draft|handle|send|figure|prep|take care))\b/i,
  /\b(i('ll| will) do it)\b/i,
];

const BULLET_IMPLIES_LEARNER_PREP =
  /\byou\b.{0,50}\b(agree(?:d|ing)?|draft(?:ed|ing)?|redo(?:ing)?|polish(?:ed|ing)?|took on|taking on|crossed the line|doing (?:his |the )?prep|doing the work|undermines your boundary)\b/i;

const IMPROVEMENT_HINT =
  /\b(next time|however|you didn'?t|you never|try to|consider|without offering|would have|could have|instead of|more clearly)\b/i;

type TranscriptFacts = {
  learnerTurns: number;
  learnerExplicitlyAgreedToPrep: boolean;
  characterClosedWithSelfResolution: boolean;
  learnerNamedOwnership: boolean;
  learnerOfferedLighterHelp: boolean;
  learnerPartialPushback: boolean;
  learnerLastLineIncomplete: boolean;
};

function learnerText(transcript: TranscriptEntry[]): string {
  return transcript
    .filter((t) => t.role === "learner")
    .map((t) => t.text)
    .join(" ");
}

function alexText(transcript: TranscriptEntry[]): string {
  return transcript
    .filter((t) => t.role === "character")
    .map((t) => t.text)
    .join(" ");
}

function hasLearnerRefusalOnMain(transcript: TranscriptEntry[]): boolean {
  const text = learnerText(transcript);
  return LEARNER_REFUSAL_ON_MAIN.some((p) => p.test(text));
}

function hasLearnerOwnership(transcript: TranscriptEntry[]): boolean {
  return /\b(you (own|are the owner)|your (demo|slide|deck|walkthrough|prep))\b/i.test(
    learnerText(transcript),
  );
}

function hasLearnerConstructiveHelp(transcript: TranscriptEntry[]): boolean {
  return /\b(review|feedback|dry run|1-1|one-on-one|one on one|look at|pair on)\b/i.test(
    learnerText(transcript),
  );
}

function hasLearnerExploration(transcript: TranscriptEntry[]): boolean {
  const lines = transcript.filter((t) => t.role === "learner");
  return lines.length >= 2 && lines.some((l) => LEARNER_EXPLORATION.some((p) => p.test(l.text)));
}

function hasLearnerPartialPushback(transcript: TranscriptEntry[]): boolean {
  return transcript
    .filter((t) => t.role === "learner")
    .some((l) => LEARNER_PARTIAL_PUSHBACK.some((p) => p.test(l.text.trim())));
}

function lastLearnerLineIncomplete(transcript: TranscriptEntry[]): boolean {
  const last = lastLearnerLine(transcript) || "";
  return /\b(but|and|so|though|however)\s*\.{0,3}$/i.test(last) || last.endsWith("...");
}

function hasExplicitLearnerCave(transcript: TranscriptEntry[]): boolean {
  return EXPLICIT_CAVE_PATTERNS.some((p) => p.test(learnerText(transcript)));
}

function matchesCharacterResolution(text: string): boolean {
  return CHARACTER_RESOLUTION_PATTERNS.some((p) => p.test(text));
}

function characterClosedWithResolution(transcript: TranscriptEntry[]): boolean {
  const lastAlex = [...transcript].reverse().find((t) => t.role === "character")?.text || "";
  return matchesCharacterResolution(lastAlex);
}

function buildTranscriptFacts(transcript: TranscriptEntry[]): TranscriptFacts {
  return {
    learnerTurns: transcript.filter((t) => t.role === "learner").length,
    learnerExplicitlyAgreedToPrep: hasExplicitLearnerCave(transcript),
    characterClosedWithSelfResolution: characterClosedWithResolution(transcript),
    learnerNamedOwnership: hasLearnerOwnership(transcript),
    learnerOfferedLighterHelp: hasLearnerConstructiveHelp(transcript),
    learnerPartialPushback: hasLearnerPartialPushback(transcript),
    learnerLastLineIncomplete: lastLearnerLineIncomplete(transcript),
  };
}

function bulletImpliesLearnerTookPrep(note: string): boolean {
  return BULLET_IMPLIES_LEARNER_PREP.test(note);
}

function buildAnalyzerUserMessage(transcript: TranscriptEntry[]): string {
  const facts = buildTranscriptFacts(transcript);
  const factsBlock = [
    "FACTS (ground truth from speaker labels — do not override with alex lines):",
    `- learner_turns: ${facts.learnerTurns}`,
    `- learner_explicitly_agreed_to_prep: ${facts.learnerExplicitlyAgreedToPrep}`,
    `- character_closed_with_self_resolution: ${facts.characterClosedWithSelfResolution}`,
    `- learner_named_ownership: ${facts.learnerNamedOwnership}`,
    `- learner_offered_lighter_help: ${facts.learnerOfferedLighterHelp}`,
    `- learner_partial_pushback: ${facts.learnerPartialPushback}`,
    `- learner_last_line_incomplete: ${facts.learnerLastLineIncomplete}`,
  ].join("\n");

  return `${factsBlock}\n\nTRANSCRIPT:\n${formatExp7Transcript(transcript)}`;
}

function looksLikeImprovement(note: string): boolean {
  return IMPROVEMENT_HINT.test(note);
}

/** Soft cap so a long transcript cannot flood the card; never pad up to this. */
const MAX_EVIDENCE_ITEMS = 5;

function asArray<T = unknown>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === "object") {
    return Object.values(value as Record<string, T>);
  }
  if (typeof value === "string" && value.trim()) return [value as T];
  return [];
}

function mapNotePointers(
  items: Array<string | RawEvidence> | unknown,
  max: number,
): string[] {
  const list = asArray<string | RawEvidence>(items);
  if (!list.length) return [];
  const out: string[] = [];
  const seen = new Set<string>();
  for (const item of list) {
    const note =
      typeof item === "string" ? item.trim() : String(item?.note || "").trim();
    if (!note) continue;
    const key = note.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(note);
    if (out.length >= max) break;
  }
  return out;
}

function buildUiDebriefSections(
  parsed: AnalyzerPayload,
  sections: Exp7DebriefSections,
  transcript: TranscriptEntry[],
): Pick<Exp7DebriefPayload, "didWell" | "keyTakeaways" | "transcriptImprovements"> {
  const didWell =
    mapNotePointers(parsed.didWell, 4).length > 0
      ? mapNotePointers(parsed.didWell, 4)
      : sections.strengths.map((s) => s.note.trim()).filter(Boolean).slice(0, 4);

  const keyTakeaways =
    mapNotePointers(parsed.keyTakeaways, 4).length > 0
      ? mapNotePointers(parsed.keyTakeaways, 4)
      : sections.improvements.map((i) => i.note.trim()).filter(Boolean).slice(0, 4);

  const fromParsed = mapEvidenceSection(parsed.transcriptImprovements, transcript, {
    requireSuggestedLine: true,
  }).slice(0, 4);

  const transcriptImprovements =
    fromParsed.length > 0
      ? fromParsed
      : sections.improvements
          .filter((i) => i.learnerQuote.trim() || Boolean(i.suggestedLine?.trim()))
          .slice(0, 4);

  return { didWell, keyTakeaways, transcriptImprovements };
}

function mapEvidenceSection(
  items: Array<RawEvidence | string> | unknown,
  transcript: TranscriptEntry[],
  options?: { requireSuggestedLine?: boolean },
  max = MAX_EVIDENCE_ITEMS,
): Exp7DebriefEvidenceItem[] {
  const usedQuotes = new Set<string>();
  const mapped = asArray<RawEvidence | string>(items)
    .map((item) =>
      normalizeEvidenceItem(item, transcript, {
        ...options,
        usedQuotes,
      }),
    )
    .filter((item): item is Exp7DebriefEvidenceItem => Boolean(item));
  return trimEvidenceItems(mapped, max);
}

function normalizeDebriefSections(
  parsed: AnalyzerPayload,
  transcript: TranscriptEntry[],
): Exp7DebriefSections {
  const strengths = mapEvidenceSection(parsed.strengths, transcript);
  const improvements = mapEvidenceSection(parsed.improvements, transcript, {
    requireSuggestedLine: true,
  });

  if (strengths.length || improvements.length) {
    return { strengths, improvements };
  }

  const legacy = (parsed.bullets || [])
    .map((b) => String(b).trim())
    .filter(Boolean)
    .slice(0, 6);

  return {
    strengths: mapEvidenceSection(
      legacy.filter((b) => !looksLikeImprovement(b)),
      transcript,
    ),
    improvements: mapEvidenceSection(
      legacy.filter((b) => looksLikeImprovement(b)),
      transcript,
      { requireSuggestedLine: true },
    ),
  };
}

function unusedLearnerQuote(
  transcript: TranscriptEntry[],
  used: Set<string>,
  pattern?: RegExp,
): string {
  const preferred = pattern
    ? pickLearnerLineForPattern(transcript, pattern) || ""
    : "";
  const preferredKey = preferred ? quoteKey(preferred) : "";
  if (preferred && preferredKey && !used.has(preferredKey)) {
    used.add(preferredKey);
    return preferred;
  }

  for (const line of transcript.filter((t) => t.role === "learner").map((t) => t.text.trim())) {
    const key = quoteKey(line);
    if (!line || used.has(key)) continue;
    used.add(key);
    return line;
  }

  // Prefer empty over repeating another card's highlight.
  return "";
}

function quoteKey(quote: string): string {
  return quote
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[^\w\s']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function dedupeByNote(items: Exp7DebriefEvidenceItem[]): Exp7DebriefEvidenceItem[] {
  const seenNotes = new Set<string>();
  return items.filter((item) => {
    const key = item.note.trim().toLowerCase();
    if (seenNotes.has(key)) return false;
    seenNotes.add(key);
    return true;
  });
}

function padDebriefSections(
  sections: Exp7DebriefSections,
  transcript: TranscriptEntry[],
  score: number,
  opts?: { multiAnchor?: boolean; characterName?: string },
): Exp7DebriefSections {
  const lowScore = score <= 3;
  const replacements = replacementSections(transcript, opts);
  let strengths = dedupeByNote([...sections.strengths]);
  let improvements = dedupeByNote([...sections.improvements]).map((item) =>
    item.suggestedLine?.trim()
      ? item
      : {
          ...item,
          suggestedLine: opts?.multiAnchor
            ? "You own the rewrite — bring it to me before it goes back to leadership."
            : "I can review what you send — I won't rewrite the deck for you tonight.",
        },
  );

  // Only fill empty sections from transcript heuristics — never pad to a fixed count.
  if (!lowScore && !strengths.length) {
    strengths = trimEvidenceItems(replacements.strengths, MAX_EVIDENCE_ITEMS);
  }
  if (!improvements.length) {
    improvements = trimEvidenceItems(replacements.improvements, MAX_EVIDENCE_ITEMS);
  }

  if (lowScore) {
    strengths = [];
  }

  return {
    strengths: trimEvidenceItems(dedupeByNote(strengths), MAX_EVIDENCE_ITEMS),
    improvements: trimEvidenceItems(dedupeByNote(improvements), MAX_EVIDENCE_ITEMS),
  };
}

function replacementSections(
  transcript: TranscriptEntry[],
  opts?: { multiAnchor?: boolean; characterName?: string },
): Exp7DebriefSections {
  const multiAnchor = Boolean(opts?.multiAnchor);
  const who = opts?.characterName?.trim() || (multiAnchor ? "Claire" : "Alex");
  const strengths: Exp7DebriefEvidenceItem[] = [];
  const improvements: Exp7DebriefEvidenceItem[] = [];
  const usedQuotes = new Set<string>();

  if (multiAnchor) {
    if (hasLearnerExploration(transcript)) {
      strengths.push({
        note: `You asked into what went wrong before jumping to a fix—that keeps ${who} open.`,
        learnerQuote: unusedLearnerQuote(transcript, usedQuotes, /\?|why|when|what|how/i),
      });
    }
    if (hasLearnerPartialPushback(transcript) || hasLearnerRefusalOnMain(transcript)) {
      strengths.push({
        note: "You held a clear line under pressure instead of taking the work back.",
        learnerQuote: unusedLearnerQuote(
          transcript,
          usedQuotes,
          /\b(can't|cannot|won't|not going|no\b|don't)\b/i,
        ),
      });
    }
    if (!strengths.length && learnerText(transcript).trim()) {
      strengths.push({
        note: "You stayed in the 1:1 and responded in the moment—useful practice.",
        learnerQuote: unusedLearnerQuote(transcript, usedQuotes),
      });
    }

    improvements.push({
      note: `Name the miss and the recovery path out loud so ${who} hears both accountability and a plan.`,
      learnerQuote: unusedLearnerQuote(transcript, usedQuotes, /\b(okay|why|plan|happened)\b/i),
      suggestedLine:
        "Leadership sent it back—story, claims, and numbers. You own the rewrite; I'll review Thursday before it goes up.",
    });
    improvements.push({
      note: `Keep ownership with ${who}, and set a concrete check before resubmit—not just a no.`,
      learnerQuote: unusedLearnerQuote(
        transcript,
        usedQuotes,
        /\b(don't send|cannot|responsible|have to do)\b/i,
      ),
      suggestedLine:
        "You rewrite it. Bring it to me Thursday afternoon, then it goes to leadership—not straight up tonight.",
    });

    return { strengths, improvements };
  }

  if (hasLearnerConstructiveHelp(transcript)) {
    strengths.push({
      note: "You offered a lighter path instead of taking on his full prep—that's useful boundary practice.",
      learnerQuote: unusedLearnerQuote(
        transcript,
        usedQuotes,
        /\b(review|feedback|dry run|1-1|one-on-one|look at|pair on)\b/i,
      ),
    });
  }

  if (hasLearnerOwnership(transcript)) {
    strengths.push({
      note: "You steered toward Alex owning his own prep—that's the right direction.",
      learnerQuote: unusedLearnerQuote(
        transcript,
        usedQuotes,
        /\b(you (own|are the owner)|your (demo|slide|deck|walkthrough|prep))\b/i,
      ),
    });
  } else if (hasLearnerExploration(transcript) || hasLearnerPartialPushback(transcript)) {
    strengths.push({
      note: "You stayed in the conversation and raised real questions—that's useful practice.",
      learnerQuote: unusedLearnerQuote(transcript, usedQuotes, /\?|why|when|what|how/i),
    });
  }

  if (hasLearnerRefusalOnMain(transcript) || hasLearnerPartialPushback(transcript)) {
    strengths.push({
      note: "You pushed back at points, even if you didn't land a clear line with an alternative.",
      learnerQuote: unusedLearnerQuote(
        transcript,
        usedQuotes,
        /\b(can't|cannot|won't|not going|no\b|don't think)\b/i,
      ),
    });
  }

  if (lastLearnerLineIncomplete(transcript)) {
    improvements.push({
      note: "Your last line trailed off—you started to push back but didn't finish the thought.",
      learnerQuote: unusedLearnerQuote(transcript, usedQuotes),
      suggestedLine: "I'm not going to redo your slides — let's talk about how you prep on your own.",
    });
  }

  if (!hasLearnerOwnership(transcript)) {
    improvements.push({
      note: "Name clearly that the demo and deck are Alex's to own and deliver.",
      learnerQuote: unusedLearnerQuote(transcript, usedQuotes, /\b(what do you want|help|can't|feedback)\b/i),
      suggestedLine: "The demo and slides are yours to own and send — I'm not taking that on.",
    });
  }

  if (!hasLearnerConstructiveHelp(transcript)) {
    improvements.push({
      note: "Offer lighter help you can stand behind—review or feedback—not taking on his core prep.",
      learnerQuote: unusedLearnerQuote(transcript, usedQuotes),
      suggestedLine: "Happy to review what you draft tonight — I won't rewrite your deck for you.",
    });
  } else {
    improvements.push({
      note: "Next time, pair the lighter help with a clear line that his core prep stays with him.",
      learnerQuote: unusedLearnerQuote(
        transcript,
        usedQuotes,
        /\b(review|feedback|like I used to|can't help)\b/i,
      ),
      suggestedLine:
        "I can give feedback on what you draft — I won't polish the deck the way we used to.",
    });
  }

  return { strengths, improvements };
}

function sectionItemCount(sections: Exp7DebriefSections): number {
  return sections.strengths.length + sections.improvements.length;
}

function applyRefusalScoreFloor(transcript: TranscriptEntry[], score: number): {
  score: number;
  adjusted: boolean;
} {
  // Allow 6 → 7 when learner clearly refused AND offered lighter help.
  if (score >= 7) return { score, adjusted: false };
  if (!learnerText(transcript).trim()) return { score, adjusted: false };
  if (hasExplicitLearnerCave(transcript)) return { score, adjusted: false };

  const refused = hasLearnerRefusalOnMain(transcript);
  const partial = hasLearnerPartialPushback(transcript);
  const ownership = hasLearnerOwnership(transcript);
  const constructive = hasLearnerConstructiveHelp(transcript);
  const explored = hasLearnerExploration(transcript);

  if (refused && constructive) {
    return { score: Math.max(score, 7), adjusted: score < 7 };
  }
  if (refused && ownership) {
    return { score: Math.max(score, 6), adjusted: score < 6 };
  }
  if (refused || partial || (explored && ownership)) {
    return { score: Math.max(score, 5), adjusted: score < 5 };
  }
  if (explored && !hasExplicitLearnerCave(transcript)) {
    return { score: Math.max(score, 4), adjusted: score < 4 };
  }

  return { score, adjusted: false };
}

function sanitizeEvidenceList(
  items: Exp7DebriefEvidenceItem[],
  transcript: TranscriptEntry[],
  score: number,
): { items: Exp7DebriefEvidenceItem[]; sanitized: boolean } {
  const learnerCaved = hasExplicitLearnerCave(transcript);
  const characterResolved =
    characterClosedWithResolution(transcript) || matchesCharacterResolution(alexText(transcript));
  let sanitized = false;

  const cleaned = items.filter((item) => {
    if (!bulletImpliesLearnerTookPrep(item.note)) return true;
    if (learnerCaved) return true;
    if (!learnerCaved && characterResolved) {
      sanitized = true;
      return false;
    }
    if (score >= 5) {
      sanitized = true;
      return false;
    }
    return true;
  });

  return { items: cleaned, sanitized };
}

function sanitizeDebriefSections(
  sections: Exp7DebriefSections,
  transcript: TranscriptEntry[],
  score: number,
  opts?: { multiAnchor?: boolean; characterName?: string },
): { sections: Exp7DebriefSections; sanitized: boolean } {
  const strengthsResult = sanitizeEvidenceList(sections.strengths, transcript, score);
  const improvementsResult = sanitizeEvidenceList(sections.improvements, transcript, score);
  const sanitized = strengthsResult.sanitized || improvementsResult.sanitized;

  const padded = padDebriefSections(
    {
      strengths: strengthsResult.items,
      improvements: improvementsResult.items,
    },
    transcript,
    score,
    opts,
  );

  return { sections: padded, sanitized };
}

function scoreToHeadline(score: number): Exp7DebriefPayload["headline"] {
  if (score >= 8) return "nailed_it";
  if (score <= 3) return "try_again";
  return "solid";
}

function percentToHeadline(percent: number): Exp7DebriefPayload["headline"] {
  if (percent >= 80) return "nailed_it";
  if (percent >= 50) return "solid";
  return "try_again";
}

function clampScore(score: number): number {
  return Math.min(10, Math.max(1, Math.round(score)));
}

/** Competency scores run 0–10: 0 means the pressure was never administered. */
function clampCompetencyScore(score: number): number {
  return Math.min(10, Math.max(0, Math.round(score)));
}

/**
 * The analyzer has historically emitted the competency number under `level`
 * instead of `score`, or only as per-goal points. Read all three so a schema
 * wobble never silently becomes a default score.
 */
function readCompetencyScore(raw: {
  score?: number | null;
  level?: string;
  goals?: Array<{ points?: number }>;
}): number | null {
  if (raw.score != null && Number.isFinite(Number(raw.score))) {
    return clampCompetencyScore(Number(raw.score));
  }
  const levelAsNumber = Number(String(raw.level ?? "").trim());
  if (String(raw.level ?? "").trim() !== "" && Number.isFinite(levelAsNumber)) {
    return clampCompetencyScore(levelAsNumber);
  }
  const goals = asArray<{ points?: number }>(raw.goals);
  if (goals.length) {
    const sum = goals.reduce((total, g) => {
      const points = Number(g?.points);
      return total + (Number.isFinite(points) ? points : 0);
    }, 0);
    return clampCompetencyScore(sum);
  }
  return null;
}

const JORDAN_COMPETENCY_META: Array<{ id: string; name: string }> = [
  { id: "building_trust", name: "Building Trust" },
  { id: "expectation_setting", name: "Setting Goals" },
  { id: "delegation", name: "Directing Work" },
  { id: "accountability", name: "Ensuring Accountability" },
];

function buildDebriefSummary(
  parsed: AnalyzerPayload,
  score: number,
  competencies: Exp7CompetencyScore[] | undefined,
): string {
  const raw = (parsed.summary || "").trim().replace(/\s+/g, " ");
  if (raw) {
    // Cap to ~2 sentences / ~280 chars for UI
    const sentences = raw.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [raw];
    return sentences.slice(0, 2).join(" ").trim().slice(0, 320);
  }

  if (!competencies?.length) {
    if (score >= 8) return "You handled this 1:1 with strong judgment overall. Keep that steady leadership style.";
    if (score <= 3) return "This call did not yet show clear management moves. Use a retake to name the miss and set a recovery path.";
    return "You covered parts of the 1:1 solidly. A clearer plan and ownership line would lift the next attempt.";
  }

  const observed = competencies.filter(
    (c) => c.level !== "not_observed" && typeof c.score === "number",
  );
  const strong = observed.filter((c) => (c.score as number) >= 7).map((c) => c.name);
  const weak = observed.filter((c) => (c.score as number) <= 4).map((c) => c.name);
  const notObs = competencies
    .filter((c) => c.level === "not_observed")
    .map((c) => c.name);

  const parts: string[] = [];
  if (strong.length) {
    parts.push(`Strongest on ${strong.slice(0, 2).join(" and ")}.`);
  } else if (score >= 5) {
    parts.push("A solid base showed under pressure.");
  } else {
    parts.push("Judgment under pressure needs a sharper recovery path.");
  }
  if (weak.length) {
    parts.push(`Focus next on ${weak.slice(0, 2).join(" and ")}.`);
  } else if (notObs.length) {
    parts.push(
      `${notObs.slice(0, 2).join(" and ")} did not fully surface—use the next run to address them when your report brings them up.`,
    );
  }
  return parts.join(" ").slice(0, 320);
}

function mapCompetencyLevel(
  level: string | undefined,
  score: number | null,
): Exp7CompetencyScore["level"] {
  const l = String(level ?? "").toLowerCase().replace(/\s+/g, "_");
  if (l === "not_observed" || l === "notobserved") return "not_observed";
  if (l === "strong" || l === "adequate" || l === "needs_work") {
    return l as Exp7CompetencyScore["level"];
  }
  if (score == null) return "not_observed";
  if (score >= 8) return "strong";
  if (score >= 5) return "adequate";
  return "needs_work";
}

function normalizeCompetencies(
  parsed: AnalyzerPayload,
  transcript: TranscriptEntry[],
): Exp7CompetencyScore[] {
  type RawComp = {
    id?: string;
    name?: string;
    score?: number | null;
    level?: string;
    administered?: boolean;
    goals?: Array<{ points?: number }>;
    note?: string;
    learnerQuote?: string;
  };

  const byId = new Map<string, RawComp>();
  for (const c of asArray<RawComp>(parsed.competencies)) {
    const rawId =
      (c?.id || "").trim() ||
      (typeof c === "object" && c && "name" in c ? String(c.name || "") : "");
    const id = rawId.toLowerCase().replace(/\s+/g, "_");
    if (id) byId.set(id, c);
    if (c && typeof c === "object") {
      for (const meta of JORDAN_COMPETENCY_META) {
        if (id === meta.id || id === meta.name.toLowerCase().replace(/\s+/g, "_")) {
          byId.set(meta.id, { ...c, id: meta.id });
        }
      }
    }
  }

  if (
    parsed.competencies &&
    !Array.isArray(parsed.competencies) &&
    typeof parsed.competencies === "object"
  ) {
    for (const [key, value] of Object.entries(
      parsed.competencies as Record<string, unknown>,
    )) {
      const id = key.trim().toLowerCase().replace(/\s+/g, "_");
      if (!value || typeof value !== "object") continue;
      byId.set(id, { id, ...(value as object) } as RawComp);
    }
  }

  return JORDAN_COMPETENCY_META.map((meta) => {
    const raw = byId.get(meta.id);
    const levelRaw = String(raw?.level ?? "").toLowerCase().replace(/\s+/g, "_");
    const parsedScore = raw ? readCompetencyScore(raw) : null;
    const administeredFlag =
      typeof raw?.administered === "boolean" ? raw.administered : null;
    const levelSaysNotObs =
      levelRaw === "not_observed" || levelRaw === "notobserved";

    // Prefer explicit administered flag. Score 0 on an opened pressure is needs_work, not not_observed.
    const explicitNotObs =
      !raw ||
      administeredFlag === false ||
      (administeredFlag !== true && (levelSaysNotObs || parsedScore === null));

    if (explicitNotObs) {
      return {
        id: meta.id,
        name: meta.name,
        score: null,
        level: "not_observed" as const,
        note: (
          raw?.note ||
          "This pressure did not clearly appear in the conversation."
        ).trim(),
        learnerQuote: "",
      };
    }

    const score = parsedScore ?? 0;
    let level = mapCompetencyLevel(raw.level, score);
    if (level === "not_observed") level = score >= 5 ? "adequate" : "needs_work";

    const note = (raw.note || "").trim() || `How you handled ${meta.name.toLowerCase()}.`;
    const quoteRaw = (raw.learnerQuote || "").trim();
    let learnerQuote = "";
    if (quoteRaw) {
      const matched = pickLearnerLineForPattern(
        transcript,
        new RegExp(escapeRegExp(quoteRaw.slice(0, Math.min(40, quoteRaw.length))), "i"),
      );
      learnerQuote = matched || quoteRaw;
    }

    return {
      id: meta.id,
      name: meta.name,
      score,
      level,
      note,
      learnerQuote: learnerQuote.slice(0, 280),
    };
  });
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export type Exp7CompetencyRollup = {
  sumScore: number;
  maxScore: number;
  percent: number;
  score: number;
};

/**
 * Sum, never average. A competency that was never administered contributes 0
 * and still counts toward the denominator, so the total reflects how much of
 * the whole conversation the learner actually handled.
 */
function rollupCompetencies(
  competencies: Exp7CompetencyScore[],
): Exp7CompetencyRollup | null {
  if (!competencies.length) return null;
  const sumScore = competencies.reduce(
    (sum, c) => sum + (typeof c.score === "number" ? c.score : 0),
    0,
  );
  const maxScore = competencies.length * 10;
  const percent = Math.round((sumScore / maxScore) * 100);
  return {
    sumScore,
    maxScore,
    percent,
    score: Math.min(10, Math.max(0, Math.round(percent / 10))),
  };
}

function mockJordanCompetencies(): Exp7CompetencyScore[] {
  return JORDAN_COMPETENCY_META.map((meta) => ({
    id: meta.id,
    name: meta.name,
    score: 6,
    level: "adequate" as const,
    note: `Practice more of ${meta.name.toLowerCase()} in your next 1:1.`,
    learnerQuote: "",
  }));
}

/** PRE Claire / POST Sam / Jordan practice — four-competency 1:1s, not Alex single-ask. */
function isMultiAnchorScene(scene: Exp7SceneConfig): boolean {
  const id = String(scene.characterId ?? "").toLowerCase();
  return id === "jordan" || id === "sam";
}

function mockDebrief(scene: Exp7SceneConfig, transcript: TranscriptEntry[]): Exp7DebriefPayload {
  const isJordan = isMultiAnchorScene(scene);
  const characterName =
    String(scene.characterId ?? "").toLowerCase() === "sam"
      ? "Sam"
      : isJordan
        ? "Claire"
        : "Alex";
  const score = 7;
  const headline = scoreToHeadline(score);
  const replacements = padDebriefSections(
    { strengths: [], improvements: [] },
    transcript,
    score,
    {
      multiAnchor: isJordan,
      characterName,
    },
  );

  return {
    score,
    headline,
    headlineLabel: headlineLabel(scene, headline),
    summary: buildDebriefSummary({}, score, isJordan ? mockJordanCompetencies() : undefined),
    strengths: replacements.strengths,
    improvements: replacements.improvements,
    didWell: replacements.strengths.map((s) => s.note).filter(Boolean).slice(0, 4),
    keyTakeaways: replacements.improvements.map((i) => i.note).filter(Boolean).slice(0, 4),
    transcriptImprovements: replacements.improvements
      .filter((i) => i.learnerQuote.trim() || Boolean(i.suggestedLine?.trim()))
      .slice(0, 4),
    lessonRef: scene.lessonRef,
    lessonTitle: scene.lessonTitle,
    lessonSlug: scene.lessonSlug,
    ...(isJordan ? { competencies: mockJordanCompetencies() } : {}),
  };
}

function buildAnalyzerDebug(
  transcript: TranscriptEntry[],
  user: string,
  extra?: Partial<Exp7AnalyzerDebug>,
): Exp7AnalyzerDebug {
  const formattedTranscript = formatExp7Transcript(transcript);
  return {
    formattedTranscript,
    analyzerUserMessage: user,
    ...extra,
  };
}

/** Real eval failed — do not invent scores. UI shows retry, not a fake 0%. */
function evaluationFailedDebrief(
  scene: Exp7SceneConfig,
  reason: string,
): Exp7DebriefPayload {
  return {
    score: 0,
    headline: "try_again",
    headlineLabel: headlineLabel(scene, "try_again"),
    summary: reason,
    strengths: [],
    improvements: [],
    didWell: [],
    keyTakeaways: [],
    transcriptImprovements: [],
    lessonRef: scene.lessonRef,
    lessonTitle: scene.lessonTitle,
    lessonSlug: scene.lessonSlug,
    evaluationFailed: true,
  };
}

function hasUsableAnalyzerPayload(parsed: AnalyzerPayload, isJordan: boolean): boolean {
  if (!parsed || typeof parsed !== "object") return false;
  if (isJordan) {
    const comps = parsed.competencies;
    if (!comps || typeof comps !== "object") return false;
    if (Array.isArray(comps)) return comps.length > 0;
    return Object.keys(comps as object).length > 0;
  }
  return typeof parsed.score === "number" || Boolean(parsed.headline);
}

type AnalyzerApiResult = {
  raw: string;
  parsed: AnalyzerPayload;
  ok: boolean;
  status?: number;
  finishReason?: string;
};

async function callAnalyzerOnce(args: {
  apiKey: string;
  system: string;
  user: string;
  model: string;
  reasoningEffort: "low" | "medium" | "high";
  maxCompletionTokens: number;
}): Promise<AnalyzerApiResult> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${args.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: args.model,
      messages: [
        { role: "system", content: args.system },
        { role: "user", content: args.user },
      ],
      reasoning_effort: args.reasoningEffort,
      max_completion_tokens: args.maxCompletionTokens,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("[exp7] analyzer failed", response.status, errText);
    return { raw: "", parsed: {}, ok: false, status: response.status };
  }

  const data = (await response.json()) as {
    choices?: Array<{
      finish_reason?: string;
      message?: { content?: string | null };
    }>;
  };
  const choice = data.choices?.[0];
  const raw = String(choice?.message?.content ?? "").trim();
  const parsed = parseJsonObject<AnalyzerPayload>(raw);
  return {
    raw,
    parsed,
    ok: Boolean(raw),
    finishReason: choice?.finish_reason,
  };
}

export async function analyzeExp7Debrief(
  transcript: TranscriptEntry[],
  sceneId?: string,
): Promise<Exp7AnalyzerResult> {
  const scene = loadExp7Scene(sceneId);
  const isJordan = isMultiAnchorScene(scene);
  const characterName =
    String(scene.characterId ?? "").toLowerCase() === "sam"
      ? "Sam"
      : isJordan
        ? "Claire"
        : "Alex";
  const apiKey = loadOpenAiKey();
  const user = buildAnalyzerUserMessage(transcript);

  if (!apiKey) {
    const debrief = evaluationFailedDebrief(
      scene,
      "Scoring could not run — OPENAI_API_KEY is missing. Add the key and retake.",
    );
    return {
      debrief,
      debug: buildAnalyzerDebug(transcript, user, { parsed: {} }),
    };
  }

  const system = loadAnalyzerPrompt(sceneId);
  const model = process.env.ARENA_LLM_MODEL || "gpt-5.6-terra";

  if (process.env.NODE_ENV !== "production") {
    console.info("[exp7] analyzer debrief", {
      sceneId: scene.id,
      characterId: scene.characterId,
      transcriptEntries: transcript.length,
      learnerLines: transcript.filter((t) => t.role === "learner").length,
      transcriptChars: user.length,
      model,
    });
  }

  // o3 with high reasoning often spends the whole token budget on reasoning and
  // returns empty content — that previously collapsed into a fake 0% report.
  let attempt = await callAnalyzerOnce({
    apiKey,
    system,
    user,
    model,
    reasoningEffort: "medium",
    maxCompletionTokens: 12_000,
  });

  if (!attempt.ok || !hasUsableAnalyzerPayload(attempt.parsed, isJordan)) {
    console.warn("[exp7] analyzer empty/unusable — retrying once", {
      finishReason: attempt.finishReason,
      rawLen: attempt.raw.length,
      status: attempt.status,
    });
    attempt = await callAnalyzerOnce({
      apiKey,
      system,
      user,
      model,
      reasoningEffort: "low",
      maxCompletionTokens: 16_000,
    });
  }

  if (!attempt.ok || !hasUsableAnalyzerPayload(attempt.parsed, isJordan)) {
    console.error("[exp7] analyzer returned no usable JSON after retry", {
      finishReason: attempt.finishReason,
      rawLen: attempt.raw.length,
      rawPreview: attempt.raw.slice(0, 200),
    });
    return {
      debrief: evaluationFailedDebrief(
        scene,
        "Scoring did not return a usable result for this conversation. Please retake — your practice was recorded, but the report could not be graded.",
      ),
      debug: buildAnalyzerDebug(transcript, user, {
        rawResponse: attempt.raw,
        parsed: attempt.parsed,
      }),
    };
  }

  const raw = attempt.raw;
  const parsed = attempt.parsed;

  let rawScore = clampScore(
    Number.isFinite(Number(parsed.score)) ? Number(parsed.score) : 5,
  );

  // Alex single-ask floors; skip for multi-anchor Jordan (different success patterns).
  if (!isJordan) {
    if (
      rawScore <= 4 &&
      !hasExplicitLearnerCave(transcript) &&
      (hasLearnerExploration(transcript) ||
        hasLearnerPartialPushback(transcript) ||
        hasLearnerRefusalOnMain(transcript) ||
        hasLearnerOwnership(transcript)) &&
      characterClosedWithResolution(transcript)
    ) {
      rawScore = Math.max(rawScore, 5);
    }
  }

  const floor = isJordan
    ? { score: rawScore, adjusted: false }
    : applyRefusalScoreFloor(transcript, rawScore);
  const score = floor.score;

  const normalized = normalizeDebriefSections(parsed, transcript);
  const { sections, sanitized } = sanitizeDebriefSections(
    normalized,
    transcript,
    score,
    { multiAnchor: isJordan, characterName },
  );

  const competencies = isJordan ? normalizeCompetencies(parsed, transcript) : undefined;
  const rollup = competencies ? rollupCompetencies(competencies) : null;

  // Prefer model percent/sum when present and consistent; otherwise rollup from competencies.
  const modelPercent =
    typeof parsed.percent === "number" && Number.isFinite(parsed.percent)
      ? Math.min(100, Math.max(0, Math.round(parsed.percent)))
      : null;
  const modelSum =
    typeof parsed.sumScore === "number" && Number.isFinite(parsed.sumScore)
      ? Math.min(40, Math.max(0, Math.round(parsed.sumScore)))
      : null;

  const finalPercent = rollup?.percent ?? modelPercent ?? null;
  const finalSum = rollup?.sumScore ?? modelSum ?? null;
  const finalScore =
    rollup?.score ??
    (finalPercent != null
      ? Math.min(10, Math.max(0, Math.round(finalPercent / 10)))
      : score);
  const finalHeadline = rollup
    ? percentToHeadline(rollup.percent)
    : finalPercent != null
      ? percentToHeadline(finalPercent)
      : scoreToHeadline(finalScore);

  const debug = buildAnalyzerDebug(transcript, user, {
    rawResponse: raw,
    parsed,
    scoreBeforeFloor:
      floor.adjusted || rawScore !== clampScore(Number(parsed.score) || 5)
        ? clampScore(Number(parsed.score) || 5)
        : undefined,
    scoreAdjusted: floor.adjusted || (rollup != null && rollup.score !== score),
    bulletsSanitized: sanitized,
  });

  // Never replace a real multi-anchor grade with mockDebrief (that invented Alex copy / fake scores).
  if (
    !isJordan &&
    !sections.improvements.length &&
    (finalScore <= 3 || !sections.strengths.length)
  ) {
    return {
      debrief: mockDebrief(scene, transcript),
      debug,
    };
  }

  const uiSections = buildUiDebriefSections(parsed, sections, transcript);

  return {
    debrief: {
      score: finalScore,
      headline: finalHeadline as Exp7DebriefPayload["headline"],
      headlineLabel: headlineLabel(scene, finalHeadline),
      summary: buildDebriefSummary(parsed, finalScore, competencies),
      strengths: sections.strengths,
      improvements: sections.improvements,
      ...uiSections,
      lessonRef: scene.lessonRef,
      lessonTitle: scene.lessonTitle,
      lessonSlug: scene.lessonSlug,
      ...(competencies ? { competencies } : {}),
      ...(finalPercent != null
        ? {
            sumScore: finalSum ?? rollup?.sumScore,
            maxScore: rollup?.maxScore ?? 40,
            percent: finalPercent,
          }
        : {}),
    },
    debug,
  };
}
