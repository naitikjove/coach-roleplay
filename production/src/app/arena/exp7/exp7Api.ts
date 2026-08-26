import type { Exp7DebriefResult } from "./exp7Types";
import { humanizeExp7Error } from "./exp7Errors";
import {
  EXP7_CHAPTER_SLUG,
  EXP7_LESSON_DURATION,
  EXP7_LESSON_HREF,
  EXP7_LESSON_THUMBNAIL,
  EXP7_LESSON_TITLE,
  EXP7_SUBJECT_SLUG,
} from "./constants";

const API_BASE =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_ARENA_API_URL
    ? process.env.NEXT_PUBLIC_ARENA_API_URL.replace(/\/$/, "")
    : "/api/arena/exp7";

export type Exp7Health = {
  ok: boolean;
  realtime_ready?: boolean;
  llm_ready?: boolean;
};

export type Exp7Session = {
  id: string;
  sceneId: string;
  sceneTitle?: string;
  turnLimits?: Record<string, number>;
};

export type Exp7RealtimeToken = {
  clientSecret: string;
  model: string;
  voice: string;
  characterId: string;
  instructions?: string;
};

export type Exp7ArcSnapshot = {
  alexPushCount: number;
  followUpPushCount: number;
  learnerRefusedMain: boolean;
  learnerCavedOnMain: boolean;
  followUpRefused: boolean;
  steeringAppliedAtPush: number;
};

export type Exp7SessionSnapshot = {
  transcript: Array<{ role: "learner" | "character"; text: string; speakerId?: string }>;
  movesLedger: Array<{ turn: number; learner_quote: string }>;
  exp7Arc?: Exp7ArcSnapshot;
  sceneId?: string;
  createdAt?: number;
};

export type Exp7ProgressSnapshot = {
  progress01: number;
  progressPercent: number;
  currentBeat: "a" | "b" | "c" | "d" | null;
  conversationClosed?: boolean;
  readyToEndCopy?: string | null;
};

export type Exp7CommitResponse = {
  shouldClose: boolean;
  closeStyle: string;
  reason?: string;
  naturalEnd?: boolean;
  evaluatedBy?: "code" | "llm" | "code+llm";
  actorSteering?: string | null;
  learnerCavedOnMain?: boolean;
  followUpRefused?: boolean;
  alexPushCount?: number;
  arc?: Exp7ArcSnapshot;
  turnCount: number;
  minLearnerTurns: number;
  progress?: Exp7ProgressSnapshot;
};

export type Exp7CompleteResponse = Exp7DebriefResult & {
  lessonRef?: string;
  lessonTitle?: string;
  lessonSlug?: string;
  _meta?: {
    transcriptEntries: number;
    characterLines: number;
    learnerLines: number;
    learnerTurns: number;
    transcriptChars: number;
    hasOpeningLine: boolean;
    runDir?: string;
  };
  _debug?: {
    formattedTranscript: string;
    transcript: Array<{ role: string; text: string; speakerId?: string }>;
    scoreBeforeFloor?: number;
    scoreAdjusted?: boolean;
    analyzerRawResponse?: string;
    analyzerParsed?: Record<string, unknown>;
  };
};

async function exp7Fetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let message = text;
    try {
      const data = JSON.parse(text) as { error?: string };
      if (data.error) message = data.error;
    } catch {
      /* use raw text */
    }
    if (res.status === 404) {
      message =
        "Session expired (dev server may have restarted) — refresh the page and start a new practice.";
    } else if (!message) {
      message = "Practice isn't available right now. Try again in a moment.";
    } else {
      message = humanizeExp7Error(message);
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export async function exp7Health(): Promise<Exp7Health> {
  return exp7Fetch<Exp7Health>("/health");
}

export async function exp7StartSession(sceneId?: string): Promise<Exp7Session> {
  return exp7Fetch<Exp7Session>("/sessions", {
    method: "POST",
    body: JSON.stringify(sceneId ? { sceneId } : {}),
  });
}

export async function exp7MintRealtimeToken(sessionId: string): Promise<Exp7RealtimeToken> {
  return exp7Fetch<Exp7RealtimeToken>(`/sessions/${sessionId}/realtime-token`, {
    method: "POST",
  });
}

export async function exp7CommitTurn(
  sessionId: string,
  learnerText: string,
  characterText: string,
  snapshot?: Exp7SessionSnapshot,
): Promise<Exp7CommitResponse> {
  return exp7Fetch<Exp7CommitResponse>(`/sessions/${sessionId}/commit-turn`, {
    method: "POST",
    body: JSON.stringify({ learnerText, characterText, snapshot }),
  });
}

const COMMIT_RETRY_DELAYS_MS = [0, 400, 1200];

export async function exp7CommitTurnWithRetry(
  sessionId: string,
  learnerText: string,
  characterText: string,
  snapshot?: Exp7SessionSnapshot | (() => Exp7SessionSnapshot),
  maxAttempts = 3,
): Promise<Exp7CommitResponse> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    if (COMMIT_RETRY_DELAYS_MS[attempt]) {
      await new Promise((r) => setTimeout(r, COMMIT_RETRY_DELAYS_MS[attempt]));
    }
    try {
      const snap = typeof snapshot === "function" ? snapshot() : snapshot;
      return await exp7CommitTurn(sessionId, learnerText, characterText, snap);
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("Could not save this turn.");
}

export async function exp7CompleteScene(
  sessionId: string,
  snapshot?: Exp7SessionSnapshot,
): Promise<Exp7CompleteResponse> {
  return exp7Fetch<Exp7CompleteResponse>(`/sessions/${sessionId}/complete`, {
    method: "POST",
    body: JSON.stringify({ snapshot }),
  });
}

export function mapCompleteToDebrief(
  payload: Exp7CompleteResponse,
  lessonHref?: string,
  lessonTitle?: string,
): Exp7DebriefResult {
  const slug = payload.lessonSlug;
  const href =
    lessonHref ||
    (slug
      ? `/microcourse/${EXP7_SUBJECT_SLUG}/${EXP7_CHAPTER_SLUG}/${slug}`
      : EXP7_LESSON_HREF);

  const strengths = Array.isArray(payload.strengths) ? payload.strengths : [];
  const improvements = Array.isArray(payload.improvements) ? payload.improvements : [];
  const competencies = Array.isArray(payload.competencies) ? payload.competencies : undefined;

  const didWellRaw = Array.isArray(payload.didWell)
    ? payload.didWell
    : typeof payload.didWell === "string" && String(payload.didWell).trim()
      ? [String(payload.didWell)]
      : [];
  const keyTakeawaysRaw = Array.isArray(payload.keyTakeaways)
    ? payload.keyTakeaways
    : typeof payload.keyTakeaways === "string" && String(payload.keyTakeaways).trim()
      ? [String(payload.keyTakeaways)]
      : [];
  const transcriptRaw = Array.isArray(payload.transcriptImprovements)
    ? payload.transcriptImprovements
    : [];

  const didWell =
    didWellRaw.map((s) => String(s).trim()).filter(Boolean).slice(0, 4).length > 0
      ? didWellRaw.map((s) => String(s).trim()).filter(Boolean).slice(0, 4)
      : strengths.map((s) => s.note.trim()).filter(Boolean).slice(0, 4);
  const keyTakeaways =
    keyTakeawaysRaw.map((s) => String(s).trim()).filter(Boolean).slice(0, 4).length > 0
      ? keyTakeawaysRaw.map((s) => String(s).trim()).filter(Boolean).slice(0, 4)
      : improvements.map((i) => i.note.trim()).filter(Boolean).slice(0, 3);
  const transcriptImprovements =
    transcriptRaw.length > 0
      ? transcriptRaw.slice(0, 4)
      : improvements
          .filter((i) => i.learnerQuote?.trim() || Boolean(i.suggestedLine?.trim()))
          .slice(0, 4);

  return {
    score: payload.score,
    headline: payload.headline,
    headlineLabel: payload.headlineLabel,
    ...(payload.summary ? { summary: payload.summary } : {}),
    strengths,
    improvements,
    didWell,
    keyTakeaways,
    transcriptImprovements,
    lessonHref: href,
    lessonTitle: lessonTitle || payload.lessonTitle || EXP7_LESSON_TITLE,
    lessonThumbnail: EXP7_LESSON_THUMBNAIL,
    lessonDuration: EXP7_LESSON_DURATION,
    ...(competencies?.length ? { competencies } : {}),
    ...(typeof payload.sumScore === "number" ? { sumScore: payload.sumScore } : {}),
    ...(typeof payload.maxScore === "number" ? { maxScore: payload.maxScore } : {}),
    ...(typeof payload.percent === "number" ? { percent: payload.percent } : {}),
    ...(payload.evaluationFailed ? { evaluationFailed: true } : {}),
  };
}
