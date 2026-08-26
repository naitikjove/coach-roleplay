import type { ArcEvaluationFields } from "@/lib/arena/exp7/sceneArc";
import type { Exp7ArcState, TranscriptEntry } from "@/lib/arena/exp7/sessionStore";
import { MAX_REFUSAL_PUSHES, pushLimitReached } from "@/lib/arena/exp7/sceneArc";

export type CodeCloseResult = {
  shouldClose: boolean;
  reason: string;
  alexHelpQuestionCount: number;
  lastAlexIsHelpLoop: boolean;
};

function lastCharacterLine(transcript: TranscriptEntry[]): string {
  for (let i = transcript.length - 1; i >= 0; i -= 1) {
    if (transcript[i].role === "character") return transcript[i].text.trim();
  }
  return "";
}

const CLOSING_PATTERNS = [
  /\b(thanks|thank you|appreciate)\b/i,
  /\b(i('ll| will) handle|i got it|i'll figure|i'll draft|i'll send)\b/i,
  /\b(fair enough|sounds good|alright|okay—|okay -)\b/i,
  /\b(goodbye|bye|talk soon|catch you)\b/i,
  /\b(i hear you)\b/i,
];

const HELP_LOOP_PATTERNS = [
  /what (would|can|should).*(help|do).*(bomb|tomorrow|demo|review|interview)/i,
  /how (can|do) i not bomb/i,
  /what would actually help/i,
  /help me not bomb/i,
];

const PUSH_PATTERNS = [
  /\b(like launch|last time|couple hours|same playbook)\b/i,
  /\b(tomorrow|ten am|10 am|demo|unprepared|stakes)\b/i,
  /\b(we never reset|when you were peer|fixed my)\b/i,
  /\b(polish|redo|rewrite|tighten).*(slide|deck|narrative)/i,
];

export function isAlexHelpLoopQuestion(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  return HELP_LOOP_PATTERNS.some((p) => p.test(t));
}

export function isAlexClosingLine(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (isAlexHelpLoopQuestion(t)) return false;
  return CLOSING_PATTERNS.some((p) => p.test(t));
}

export function isAlexPushLine(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  return PUSH_PATTERNS.some((p) => p.test(t));
}

export function countAlexHelpQuestions(transcript: TranscriptEntry[]): number {
  return transcript.filter(
    (e) => e.role === "character" && isAlexHelpLoopQuestion(e.text),
  ).length;
}

const LEARNER_REFUSAL_PATTERNS = [
  /\b(can't|cannot|won't|not going to|I'm not going to)\b/i,
  /\b(no —|no,|nope|not doing|don't have time)\b/i,
  /\b(you (own|handle|draft|send|figure)|your demo|your slide|your walkthrough)\b/i,
  /\b(boundary|not my job|can't take that on)\b/i,
];

const LEARNER_CAVE_PATTERNS = [
  /\b(sure|happy to|I can help|I'll (review|look|help|take a look))\b/i,
  /\b(send (it|me)|look at (it|your)|pair on|dry run)\b/i,
];

const LEARNER_FOLLOWUP_REFUSAL_PATTERNS = [
  /\b(not (redoing|rewriting|polishing)|won't redo|can't redo)\b/i,
  /\b(no to that|not that|draw the line|that's enough)\b/i,
];

export function inferArcFieldsFromTranscript(transcript: TranscriptEntry[]): ArcEvaluationFields {
  let learnerRefusedMain = false;
  let learnerCavedOnMain = false;
  let followUpRefused = false;
  let alexPushCount = 0;
  let followUpPushCount = 0;
  let lastAlexMove: ArcEvaluationFields["last_alex_move"] = "neutral";

  const lastAlex = lastCharacterLine(transcript);
  if (isAlexHelpLoopQuestion(lastAlex)) lastAlexMove = "ask";
  else if (isAlexClosingLine(lastAlex)) lastAlexMove = "close";
  else if (isAlexPushLine(lastAlex)) lastAlexMove = "push";
  else if (/\?/.test(lastAlex)) lastAlexMove = "ask";

  for (const entry of transcript) {
    if (entry.role !== "learner") continue;
    const text = entry.text.trim();
    if (!text) continue;

    if (!learnerRefusedMain && !learnerCavedOnMain) {
      if (LEARNER_REFUSAL_PATTERNS.some((p) => p.test(text))) learnerRefusedMain = true;
      else if (LEARNER_CAVE_PATTERNS.some((p) => p.test(text))) learnerCavedOnMain = true;
    } else if (learnerCavedOnMain && !followUpRefused) {
      if (LEARNER_FOLLOWUP_REFUSAL_PATTERNS.some((p) => p.test(text))) followUpRefused = true;
    }
  }

  let countingPushes = false;
  let countingFollowUpPushes = false;
  for (const entry of transcript) {
    if (entry.role === "learner") {
      const text = entry.text.trim();
      if (!countingPushes && LEARNER_REFUSAL_PATTERNS.some((p) => p.test(text))) {
        countingPushes = true;
      }
      if (learnerCavedOnMain && followUpRefused && LEARNER_FOLLOWUP_REFUSAL_PATTERNS.some((p) => p.test(text))) {
        countingFollowUpPushes = true;
      }
      continue;
    }
    if (entry.role !== "character" || !isAlexPushLine(entry.text)) continue;
    if (countingFollowUpPushes) followUpPushCount += 1;
    else if (countingPushes) alexPushCount += 1;
  }

  const mustStop =
    alexPushCount >= MAX_REFUSAL_PUSHES ||
    (learnerCavedOnMain && followUpRefused && followUpPushCount >= 1);

  return {
    learner_refused_main: learnerRefusedMain,
    learner_caved_on_main: learnerCavedOnMain,
    follow_up_refused: followUpRefused,
    alex_push_count_since_refusal: alexPushCount,
    follow_up_push_count: followUpPushCount,
    must_stop_pushing: mustStop,
    last_alex_move: lastAlexMove,
  };
}

/** LLM close fallback — only when code heuristics are ambiguous. */
export function needsLlmCloseEvaluation(
  transcript: TranscriptEntry[],
  codeClose: CodeCloseResult,
  arc: Exp7ArcState,
  learnerTurnCount: number,
  limits: { min: number; softMax: number; hardMax: number },
): boolean {
  if (process.env.ARENA_EXP7_LLM_CLOSE === "0") return false;
  if (process.env.ARENA_EXP7_LLM_CLOSE === "always") return true;
  if (codeClose.shouldClose || learnerTurnCount < limits.min) return false;

  const lastAlex = lastCharacterLine(transcript);

  if (learnerTurnCount >= limits.softMax) return true;

  if (isAlexClosingLine(lastAlex) && !codeClose.shouldClose) return true;

  if (codeClose.lastAlexIsHelpLoop && codeClose.alexHelpQuestionCount >= 1) return true;

  if (pushLimitReached(arc) && isAlexPushLine(lastAlex)) return true;

  return false;
}

export function learnerOfferedSupport(transcript: TranscriptEntry[]): boolean {
  const learnerLines = transcript.filter((e) => e.role === "learner");
  const supportPatterns = [
    /\b(review|dry run|feedback|look at|pair|walkthrough|structure|slot|time|1-1|one-on-one|one on one)\b/i,
    /\b(happy to|can do|i'll review|send (it|me)|draft first|later)\b/i,
    /\b(you own|your demo|your slide|can't do it (all|every)|not like (old times|launch|before))\b/i,
  ];
  return learnerLines.some((e) => supportPatterns.some((p) => p.test(e.text)));
}

/**
 * Code-first close signals — does not require LLM.
 */
export function codeEvaluateTranscriptClose(
  transcript: TranscriptEntry[],
  learnerTurnCount: number,
  arc: Exp7ArcState,
  limits: { min: number; softMax: number; hardMax: number },
): CodeCloseResult {
  const lastAlex = lastCharacterLine(transcript);
  const helpCount = countAlexHelpQuestions(transcript);
  const lastAlexIsHelpLoop = isAlexHelpLoopQuestion(lastAlex);

  const base = {
    alexHelpQuestionCount: helpCount,
    lastAlexIsHelpLoop,
    shouldClose: false,
    reason: "continue",
  };

  if (learnerTurnCount < limits.min) {
    return base;
  }

  if (learnerTurnCount >= limits.hardMax) {
    return { ...base, shouldClose: true, reason: `hard max ${limits.hardMax} learner turns` };
  }

  if (learnerTurnCount >= limits.softMax) {
    return { ...base, shouldClose: true, reason: `soft max ${limits.softMax} learner turns` };
  }

  if (pushLimitReached(arc) && isAlexClosingLine(lastAlex)) {
    return { ...base, shouldClose: true, reason: "push limit reached and Alex closed" };
  }

  if (pushLimitReached(arc) && !isAlexPushLine(lastAlex) && !lastAlexIsHelpLoop) {
    return { ...base, shouldClose: true, reason: "push limit reached; Alex stopped pushing" };
  }

  // Alex asked a coaching question after learner already helped — close immediately.
  if (lastAlexIsHelpLoop && learnerOfferedSupport(transcript) && learnerTurnCount >= limits.min) {
    return { ...base, shouldClose: true, reason: "learner offered support; Alex must thank and close" };
  }

  if (helpCount >= 1 && pushLimitReached(arc) && learnerTurnCount >= limits.min) {
    return { ...base, shouldClose: true, reason: "push limit reached; Alex must accept and close" };
  }

  if (helpCount >= 2) {
    return { ...base, shouldClose: true, reason: "Alex repeated coaching question" };
  }

  if (arc.alexPushCount >= MAX_REFUSAL_PUSHES && isAlexClosingLine(lastAlex)) {
    return { ...base, shouldClose: true, reason: "refusal arc done with Alex close" };
  }

  if (arc.learnerCavedOnMain && isAlexClosingLine(lastAlex) && learnerTurnCount >= limits.min) {
    return { ...base, shouldClose: true, reason: "cave arc resolved" };
  }

  return base;
}
