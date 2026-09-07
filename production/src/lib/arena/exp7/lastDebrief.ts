import type { Exp7DebriefResult } from "@/app/arena/exp7/exp7Types";
import {
  EXP7_LAST_DEBRIEF_STORAGE_KEY,
  EXP7_LAST_DEBRIEF_STORAGE_KEY_POST,
  EXP7_PRE_MICROCOURSE_HREF,
} from "@/app/arena/exp7/pre-post/constants";
import {
  EXP7_LESSON_DURATION,
  EXP7_LESSON_THUMBNAIL,
  EXP7_LESSON_TITLE,
} from "@/app/arena/exp7/constants";

export type Exp7RoleplayPhase = "pre" | "post";

export type Exp7LastDebriefSummary = {
  available: true;
  sessionId: string;
  score: number;
  headlineLabel: string;
  percent?: number;
  savedAt?: string;
  phase?: Exp7RoleplayPhase;
};

export type Exp7LastDebriefPayload = Exp7LastDebriefSummary & {
  debrief: Exp7DebriefResult;
};

function storageKey(phase: Exp7RoleplayPhase): string {
  return phase === "post"
    ? EXP7_LAST_DEBRIEF_STORAGE_KEY_POST
    : EXP7_LAST_DEBRIEF_STORAGE_KEY;
}

/** Infer PRE/POST from debrief lessonRef / scene cues. */
export function phaseFromDebrief(result: Exp7DebriefResult): Exp7RoleplayPhase {
  const lesson = String(result.lessonRef || "").toLowerCase();
  if (lesson.includes("post")) return "post";
  return "pre";
}

/** Persist latest Claire PRE or Sam POST debrief for “Last results”. */
export function saveLastRoleplayDebrief(
  result: Exp7DebriefResult,
  sessionId?: string,
  phase?: Exp7RoleplayPhase,
): void {
  if (typeof window === "undefined") return;
  if (result.evaluationFailed) return;
  const resolved = phase ?? phaseFromDebrief(result);
  try {
    const payload: Exp7LastDebriefPayload = {
      available: true,
      sessionId: sessionId || `local-${Date.now()}`,
      score: result.score,
      headlineLabel: result.headlineLabel,
      phase: resolved,
      ...(typeof result.percent === "number" ? { percent: result.percent } : {}),
      savedAt: new Date().toISOString(),
      debrief: {
        ...result,
        lessonHref: EXP7_PRE_MICROCOURSE_HREF,
      },
    };
    window.localStorage.setItem(storageKey(resolved), JSON.stringify(payload));
  } catch {
    /* ignore quota / private mode */
  }
}

/** @deprecated Prefer saveLastRoleplayDebrief */
export function saveLastPreDebrief(result: Exp7DebriefResult, sessionId?: string): void {
  saveLastRoleplayDebrief(result, sessionId, "pre");
}

export function readLastRoleplayDebriefFromStorage(
  phase: Exp7RoleplayPhase = "pre",
): Exp7LastDebriefPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(storageKey(phase));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Exp7LastDebriefPayload;
    if (!parsed?.available || !parsed.debrief || typeof parsed.score !== "number") {
      return null;
    }
    return {
      ...parsed,
      phase,
      debrief: {
        ...parsed.debrief,
        lessonHref: EXP7_PRE_MICROCOURSE_HREF,
        lessonTitle: parsed.debrief.lessonTitle || EXP7_LESSON_TITLE,
        lessonThumbnail: parsed.debrief.lessonThumbnail || EXP7_LESSON_THUMBNAIL,
        lessonDuration: parsed.debrief.lessonDuration || EXP7_LESSON_DURATION,
      },
    };
  } catch {
    return null;
  }
}

/** @deprecated Prefer readLastRoleplayDebriefFromStorage("pre") */
export function readLastPreDebriefFromStorage(): Exp7LastDebriefPayload | null {
  return readLastRoleplayDebriefFromStorage("pre");
}

export function applyPreMicrocourseHref(result: Exp7DebriefResult): Exp7DebriefResult {
  return {
    ...result,
    lessonHref: EXP7_PRE_MICROCOURSE_HREF,
    lessonTitle: result.lessonTitle || EXP7_LESSON_TITLE,
    lessonThumbnail: result.lessonThumbnail || EXP7_LESSON_THUMBNAIL,
    lessonDuration: result.lessonDuration || EXP7_LESSON_DURATION,
  };
}
