import type { TranscriptEntry } from "@/lib/arena/exp7/sessionStore";

/** Conversation beats for Claire/Jordan PRE and Sam POST multi-anchor 1:1s. */
export type Exp7ProgressBeat = "a" | "b" | "c" | "d";

export type Exp7BeatProgressState = {
  /** Beat the conversation is currently on (null = warm open / pre-agenda). */
  currentBeat: Exp7ProgressBeat | null;
  /** Claire has opened this beat (sequential). */
  claireOpened: Record<Exp7ProgressBeat, boolean>;
  /** Learner gave at least one non-weak reply while this beat was current. */
  learnerResponded: Record<Exp7ProgressBeat, boolean>;
  /** Beat fully done (Claire continued after learner engage, or advanced). */
  beatComplete: Record<Exp7ProgressBeat, boolean>;
  /** Claire gave a real farewell after D was engaged. */
  conversationClosed: boolean;
  /** 0–1 continuous progress for the live bar. */
  progress01: number;
  /** 0–100 integer for display math / a11y. */
  progressPercent: number;
};

const BEATS: Exp7ProgressBeat[] = ["a", "b", "c", "d"];

/** Each beat is worth 20%. Farewell after D is the final 20% → 100%. */
const BEAT_SHARE = 0.2;
const CLOSE_SHARE = 0.2;

function emptyFlags(): Record<Exp7ProgressBeat, boolean> {
  return { a: false, b: false, c: false, d: false };
}

export function defaultBeatProgressState(): Exp7BeatProgressState {
  return {
    currentBeat: null,
    claireOpened: emptyFlags(),
    learnerResponded: emptyFlags(),
    beatComplete: emptyFlags(),
    conversationClosed: false,
    progress01: 0,
    progressPercent: 0,
  };
}

function beatIndex(b: Exp7ProgressBeat): number {
  return BEATS.indexOf(b);
}

function prevBeat(b: Exp7ProgressBeat): Exp7ProgressBeat | null {
  const i = beatIndex(b);
  return i <= 0 ? null : BEATS[i - 1];
}

function isPreviousComplete(
  beat: Exp7ProgressBeat,
  beatComplete: Record<Exp7ProgressBeat, boolean>,
): boolean {
  const prev = prevBeat(beat);
  return prev === null || beatComplete[prev];
}

function nextExpectedBeat(
  beatComplete: Record<Exp7ProgressBeat, boolean>,
): Exp7ProgressBeat | null {
  return (
    BEATS.find((b) => !beatComplete[b] && isPreviousComplete(b, beatComplete)) ?? null
  );
}

/**
 * Evidence that Claire (or the learner) is opening or holding a specific beat.
 * Only evaluated against the current open beat, next expected, or soft-skip +1 —
 * never against the full A–D set at once (avoids cold cross-beat false positives).
 */
export function matchesBeatSignal(beat: Exp7ProgressBeat, text: string): boolean {
  const t = text.toLowerCase();

  if (beat === "a") {
    return (
      /\brejected\b/.test(t) ||
      /\bcoming\s+back\s+rejected\b/.test(t) ||
      /\bdeck\s+review\b/.test(t) ||
      /\bsent\s+(the\s+)?(deck|presentation|it)\s+back\b/.test(t) ||
      /\bincomplete\s+story\b/.test(t) ||
      /\bthin\s+claims\b/.test(t) ||
      /\bnumbers?\s+(didn'?t|that\s+didn'?t|could\s+not|didn'?t\s+stand)\s+hold\b/.test(
        t,
      ) ||
      (/\bstory\b/.test(t) && /\bclaims?\b/.test(t) && /\bnumbers?\b/.test(t)) ||
      (/\bemail\b/.test(t) && /\b(leadership|deck|rejected|review)\b/.test(t)) ||
      (/\bclient\s+(presentation|deck)\b/.test(t) &&
        /\b(rejected|sent\s+back|bounced|sign-?off)\b/.test(t))
    );
  }

  if (beat === "b") {
    return (
      /\bsend\s+(it\s+)?straight\b/.test(t) ||
      /\bstraight\s+to\s+leadership\b/.test(t) ||
      /\bsend\s+it\s+(up|to\s+leadership)\b/.test(t) ||
      /\bfastest\s+(shot|way)\b/.test(t) ||
      /\bsend\s+(it\s+)?to\s+(you|me)\s+first\b/.test(t) ||
      /\bbring\s+it\s+to\s+(you|me)\s+first\b/.test(t) ||
      /\bto\s+(you|me)\s+first\b/.test(t) ||
      /\bby\s+tomorrow\b/.test(t) ||
      /\bfix\b.{0,40}\b(tomorrow|tonight|this\s+week|end[\s-]?of[\s-]?week)\b/.test(
        t,
      ) ||
      /\b(send|bring|get)\b.{0,30}\b(tomorrow|tonight)\b/.test(t) ||
      /\breview\b.{0,40}\bbefore\b/.test(t) ||
      /\bbefore\b.{0,20}\b(leadership|sign-?off|clearance)\b/.test(t) ||
      (/\b(tonight|end[\s-]?of[\s-]?week|this\s+week|tomorrow)\b/.test(t) &&
        /\b(send|leadership|sign-?off|clear|fix|rewrite|review|draft)\b/.test(t) &&
        !isLeadershipRoomInvite(t))
    );
  }

  if (beat === "c") {
    return (
      /\bwhen\s+we\s+were\s+peers\b/.test(t) ||
      /\byour\s+eye\b/.test(t) ||
      /\bsave\s+us\s+a\s+round\b/.test(t) ||
      /\bold\s+habit\b/.test(t) ||
      /\bhop(?:e|ing)\b.{0,50}\b(eye|help|rewrite|jump\s+in|assist)\b/.test(t) ||
      /\btogether\s+on\s+(the\s+)?(deck|narrative|story|rewrite|claims)\b/.test(t) ||
      /\btighten(?:\s+it)?\s+up\s+together\b/.test(t) ||
      /\bassist\b.{0,40}\b(rewrite|story|claims|deck)\b/.test(t) ||
      /\bi'?ll\s+take\s+the\s+rewrite\b/.test(t) ||
      /\bi'?ll\s+own\s+the\s+rewrite\b/.test(t) ||
      /\byou\s+own\s+(it|the\s+(rewrite|deck|work))\b/.test(t) ||
      /\byou'?re\s+the\s+owner\b/.test(t) ||
      /\bi\s+won'?t\s+help\b/.test(t) ||
      /\bcannot\s+help\s+you\s+like\s+i\s+used\s+to\b/.test(t) ||
      (/\brewrite\b/.test(t) &&
        /\b(peers?|habit|eye|jump\s+in|save\s+us|hoping|assist|own|owner)\b/.test(t))
    );
  }

  // D — co-defense / shared leadership room (not "looping the narrative")
  return isLeadershipRoomInvite(t);
}

/** True when Claire is asking the learner into the leadership room / co-defense. */
function isLeadershipRoomInvite(t: string): boolean {
  return (
    /\bloop(?:ed)?\s+you\s+in\b/.test(t) ||
    /\bloop(?:ed)?\s+me\s+in\b/.test(t) ||
    /\bloop(?:ed)?\s+in\b/.test(t) ||
    /\blooped\s+into\b/.test(t) ||
    /\byou'?re\s+looped\s+into\b/.test(t) ||
    /\banswer\s+together\b/.test(t) ||
    /\bhandle\s+together\b/.test(t) ||
    /\bsolo\s+in\s+(?:that\s+)?room\b/.test(t) ||
    /\bsitting\s+there\s+solo\b/.test(t) ||
    /\bin\s+that\s+room\b/.test(t) ||
    /\bin\s+the\s+room\b/.test(t) ||
    /\bwithout\s+you\s+there\b/.test(t) ||
    /\bwith\s+you\s+in\s+the\s+room\b/.test(t) ||
    /\bbe\s+with\s+you\s+in\s+the\s+room\b/.test(t) ||
    /\byou\s+in\s+the\s+(?:leadership\s+)?(?:sign-?off\s+)?meeting\b/.test(t) ||
    /\bwant\s+you\s+in\b.{0,40}\b(meeting|sign-?off|room|review)\b/.test(t) ||
    (/\bleadership\s+(review|sign-?off|call|meeting)\b/.test(t) &&
      /\b(with\s+you|you\s+there|answer\s+together|handle\s+together|easier\s+together|solo|loop|in\s+the\s+room)\b/.test(t))
  );
}

/**
 * Next-beat classifier: current vs next expected, with soft-skip of at most one beat
 * when the following beat clearly opens (e.g. expected B but C peer-habit lands).
 */
export function classifyClaireBeatTurn(
  text: string,
  opts: {
    currentBeat: Exp7ProgressBeat | null;
    beatComplete: Record<Exp7ProgressBeat, boolean>;
  },
): Exp7ProgressBeat | null {
  const expected = nextExpectedBeat(opts.beatComplete);
  const current =
    opts.currentBeat && !opts.beatComplete[opts.currentBeat]
      ? opts.currentBeat
      : null;

  if (expected && matchesBeatSignal(expected, text)) {
    return expected;
  }

  // Soft-skip at most one beat when the next-next clearly opens.
  if (expected) {
    const ei = beatIndex(expected);
    const skipTo = ei >= 0 && ei + 1 < BEATS.length ? BEATS[ei + 1] : null;
    if (skipTo && matchesBeatSignal(skipTo, text)) {
      return skipTo;
    }
  }

  if (current && matchesBeatSignal(current, text)) {
    return current;
  }

  // Still inside an open beat with no strong new signal — stay put.
  if (current) return current;

  return null;
}

/**
 * Offline / debug helper: classify as if this were the next expected beat
 * from a cold start walk. Prefer classifyClaireBeatTurn during live progress.
 */
export function detectPrimaryBeatInCharacterText(
  text: string,
): Exp7ProgressBeat | null {
  for (const beat of BEATS) {
    if (matchesBeatSignal(beat, text)) return beat;
  }
  return null;
}

/** @deprecated use classifyClaireBeatTurn */
export function detectBeatsInCharacterText(text: string): Exp7ProgressBeat[] {
  const primary = detectPrimaryBeatInCharacterText(text);
  return primary ? [primary] : [];
}

export function isClaireFarewell(text: string): boolean {
  const t = text.toLowerCase();
  return (
    /\bgoodbye\b/.test(t) ||
    /\bbye\s+for\s+now\b/.test(t) ||
    /(?:^|[.!?]\s*)bye(?:\s|[.!?]|$)/.test(t) ||
    /\btake care\b/.test(t) ||
    /\btalk soon\b/.test(t) ||
    /\bcatch you later\b/.test(t) ||
    /\bsee you\b/.test(t) ||
    /\bpick it up\b/.test(t) ||
    /\bwe'?ll\s+pick\s+it\s+up\b/.test(t) ||
    /\bsigning off\b/.test(t)
  );
}

function isWeakLearnerAck(text: string): boolean {
  const t = text.trim().toLowerCase().replace(/[.!?!,]+$/g, "");
  return /^(ok|okay|okej|yeah|yes|yep|sure|fine|cool|thanks|thank you|right|alright|got it|hmm|mhm|uh huh|k|오케이|좋아)$/i.test(
    t,
  );
}

function computeProgress01(
  claireOpened: Record<Exp7ProgressBeat, boolean>,
  learnerResponded: Record<Exp7ProgressBeat, boolean>,
  beatComplete: Record<Exp7ProgressBeat, boolean>,
  conversationClosed: boolean,
): number {
  let n = 0;
  for (const beat of BEATS) {
    if (beatComplete[beat]) {
      n += BEAT_SHARE;
      continue;
    }
    if (claireOpened[beat] && learnerResponded[beat]) {
      n += BEAT_SHARE * 0.75;
    } else if (claireOpened[beat]) {
      n += BEAT_SHARE * 0.5;
    }
  }
  if (conversationClosed) n += CLOSE_SHARE;
  return Math.min(1, n);
}

/**
 * Pure code progress from the transcript.
 *
 * Rules:
 * 1. Beats are sequential A → B → C → D, with soft-skip of at most one beat.
 * 2. Claire turns are classified against current vs next expected (or expected+1).
 * 3. Learner can open the next expected beat when their line clearly matches it.
 * 4. A beat may take multiple turns; it completes after learner engage + Claire again.
 * 5. 100% only when D was engaged and Claire gives a farewell.
 */
export function computeBeatProgress(
  transcript: TranscriptEntry[],
): Exp7BeatProgressState {
  const claireOpened = emptyFlags();
  const learnerResponded = emptyFlags();
  const beatComplete = emptyFlags();
  let currentBeat: Exp7ProgressBeat | null = null;
  let pendingCompleteAfterClaire: Exp7ProgressBeat | null = null;
  let conversationClosed = false;

  const markComplete = (beat: Exp7ProgressBeat) => {
    beatComplete[beat] = true;
    if (pendingCompleteAfterClaire === beat) pendingCompleteAfterClaire = null;
  };

  const softCompleteIfSkippingTo = (classified: Exp7ProgressBeat) => {
    const expected = nextExpectedBeat(beatComplete);
    if (
      expected &&
      expected !== classified &&
      beatIndex(classified) === beatIndex(expected) + 1
    ) {
      claireOpened[expected] = true;
      markComplete(expected);
    }
  };

  for (const entry of transcript) {
    const text = String(entry.text ?? "").trim();
    if (!text) continue;

    if (entry.role === "character") {
      if (
        pendingCompleteAfterClaire &&
        currentBeat === pendingCompleteAfterClaire &&
        !beatComplete[pendingCompleteAfterClaire]
      ) {
        markComplete(pendingCompleteAfterClaire);
      }

      const classified = classifyClaireBeatTurn(text, {
        currentBeat,
        beatComplete,
      });
      const farewell = isClaireFarewell(text);

      if (classified && !beatComplete[classified]) {
        softCompleteIfSkippingTo(classified);
      }

      if (
        classified &&
        isPreviousComplete(classified, beatComplete) &&
        !beatComplete[classified]
      ) {
        if (
          currentBeat &&
          currentBeat !== classified &&
          beatIndex(classified) === beatIndex(currentBeat) + 1 &&
          learnerResponded[currentBeat] &&
          !beatComplete[currentBeat]
        ) {
          markComplete(currentBeat);
        }

        claireOpened[classified] = true;
        currentBeat = classified;
      }

      if (
        farewell &&
        claireOpened.d &&
        learnerResponded.d &&
        (beatComplete.d || pendingCompleteAfterClaire === "d" || currentBeat === "d")
      ) {
        if (!beatComplete.d) markComplete("d");
        conversationClosed = true;
      }

      continue;
    }

    if (entry.role === "learner") {
      if (isWeakLearnerAck(text)) continue;

      const expected = nextExpectedBeat(beatComplete);
      if (
        expected &&
        matchesBeatSignal(expected, text) &&
        isPreviousComplete(expected, beatComplete) &&
        !beatComplete[expected]
      ) {
        claireOpened[expected] = true;
        currentBeat = expected;
        learnerResponded[expected] = true;
        pendingCompleteAfterClaire = expected;
        continue;
      }

      if (!currentBeat || beatComplete[currentBeat]) continue;
      if (!claireOpened[currentBeat]) continue;

      learnerResponded[currentBeat] = true;
      pendingCompleteAfterClaire = currentBeat;
    }
  }

  const progress01 = computeProgress01(
    claireOpened,
    learnerResponded,
    beatComplete,
    conversationClosed,
  );

  return {
    currentBeat,
    claireOpened,
    learnerResponded,
    beatComplete,
    conversationClosed,
    progress01,
    progressPercent: Math.round(progress01 * 100),
  };
}

/** Scenes that use A→B→C→D beat progress (Claire/Jordan PRE, Sam POST). */
export function sceneUsesBeatProgress(sceneId: string | undefined | null): boolean {
  const id = String(sceneId ?? "").toLowerCase();
  return (
    id.includes("jordan") ||
    id.includes("claire") ||
    id.includes("sam") ||
    id.includes("presentation") ||
    id.includes("client-report") ||
    id.includes("client_report")
  );
}

/** Soft CTA near End scene — once beat D is done (through farewell / 100%). */
export function progressReadyToEndCopy(state: Exp7BeatProgressState): string | null {
  if (state.beatComplete.d) {
    return "Conversation is almost complete. You can end when you're ready.";
  }
  return null;
}

/** Live topic coverage (came up in conversation) — not skill achievement. */
export type Exp7TopicCoverage = {
  /** Per objective A→D: topic has entered the conversation. */
  covered: boolean[];
  coveredCount: number;
  total: number;
};

/**
 * Mark a topic covered when that beat opened/completed, or when the transcript
 * clearly hits that beat’s signals after A has started (UI coverage).
 */
export function topicCoverageFromBeatProgress(
  state: Exp7BeatProgressState,
  transcript?: TranscriptEntry[],
): Exp7TopicCoverage {
  const covered = BEATS.map(
    (beat) => Boolean(state.claireOpened[beat] || state.beatComplete[beat]),
  );

  if (transcript?.length) {
    let aSeen = covered[0];
    for (const entry of transcript) {
      const text = String(entry.text ?? "").trim();
      if (!text) continue;
      if (!aSeen && matchesBeatSignal("a", text)) {
        covered[0] = true;
        aSeen = true;
      }
      if (!aSeen) continue;
      for (let i = 1; i < BEATS.length; i++) {
        if (!covered[i] && matchesBeatSignal(BEATS[i], text)) {
          covered[i] = true;
        }
      }
    }
  }

  const coveredCount = covered.filter(Boolean).length;
  return { covered, coveredCount, total: BEATS.length };
}

export function mergeTopicCoverage(
  prev: Exp7TopicCoverage | null | undefined,
  next: Exp7TopicCoverage,
): Exp7TopicCoverage {
  if (!prev || prev.covered.length !== next.covered.length) return next;
  const covered = next.covered.map((v, i) => Boolean(v || prev.covered[i]));
  return {
    covered,
    coveredCount: covered.filter(Boolean).length,
    total: next.total,
  };
}

export function emptyTopicCoverage(total = 4): Exp7TopicCoverage {
  return {
    covered: Array.from({ length: total }, () => false),
    coveredCount: 0,
    total,
  };
}
