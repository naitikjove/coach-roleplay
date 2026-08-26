import { appendFile, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { CloseEvaluation } from "@/lib/arena/exp7/closeEvaluator";
import type { Exp7DebriefPayload } from "@/lib/arena/exp7/analyzer";
import type { Exp7ArcState, MoveLedgerEntry, TranscriptEntry } from "@/lib/arena/exp7/sessionStore";
import {
  ensureExp7RunDir,
  getExp7RunDir,
  getExp7RunDirRelative,
} from "@/lib/arena/exp7/sessionPersistence";

export { getExp7RunDir, getExp7RunDirRelative, ensureExp7RunDir };

/** Debug artifacts (turns.jsonl, debrief.json) — dev/local only. Session state persists in all envs. */
export function exp7RunsEnabled(): boolean {
  return process.env.NODE_ENV !== "production";
}

export type Exp7TurnRecord = {
  ts: string;
  turn: number;
  learnerText: string;
  characterText: string;
  closeEval?: {
    shouldClose: boolean;
    closeStyle: string;
    reason: string;
    naturalEnd: boolean;
    evaluatedBy: CloseEvaluation["evaluatedBy"];
    learnerCavedOnMain: boolean;
    followUpRefused: boolean;
    alexPushCount: number;
  };
};

export type Exp7DebriefRecord = {
  ts: string;
  sessionId: string;
  transcript: TranscriptEntry[];
  movesLedger: MoveLedgerEntry[];
  arc: Exp7ArcState;
  formattedTranscript: string;
  analyzerUserMessage: string;
  analyzerRawResponse?: string;
  analyzerParsed?: Record<string, unknown>;
  scoreBeforeFloor?: number;
  scoreAdjusted?: boolean;
  debrief: Exp7DebriefPayload;
};

export async function initExp7RunSession(sessionId: string, sceneId: string): Promise<void> {
  if (!exp7RunsEnabled()) return;
  const dir = await ensureExp7RunDir(sessionId);
  const metaPath = path.join(dir, "meta.json");
  await writeFile(
    metaPath,
    JSON.stringify({ sessionId, sceneId, createdAt: new Date().toISOString() }, null, 2),
    "utf8",
  );
}

export type Exp7CoverageRecord = {
  ts: string;
  /** Raw judge verdict for this call (stateless, per objective 1–4). */
  verdict: boolean[];
  /** Monotonically merged UI state after this verdict. */
  merged: boolean[];
  /** Objectives newly flipped to covered by this verdict. */
  newlyCovered: number[];
  /** Transcript length when the verdict landed (learner+character lines). */
  transcriptLength: number;
  /** Last character line spoken before the judge fired (context anchor). */
  lastCharacterLine: string;
};

export async function persistExp7Coverage(
  sessionId: string,
  record: Exp7CoverageRecord,
): Promise<void> {
  if (!exp7RunsEnabled()) return;
  await ensureExp7RunDir(sessionId);
  const line = `${JSON.stringify(record)}\n`;
  await appendFile(path.join(getExp7RunDir(sessionId), "coverage.jsonl"), line, "utf8");
}

export async function persistExp7Turn(sessionId: string, record: Exp7TurnRecord): Promise<void> {
  if (!exp7RunsEnabled()) return;
  await ensureExp7RunDir(sessionId);
  const line = `${JSON.stringify(record)}\n`;
  await appendFile(path.join(getExp7RunDir(sessionId), "turns.jsonl"), line, "utf8");
}

export async function persistExp7Debrief(sessionId: string, record: Exp7DebriefRecord): Promise<void> {
  if (!exp7RunsEnabled()) return;
  await ensureExp7RunDir(sessionId);
  await writeFile(
    path.join(getExp7RunDir(sessionId), "debrief.json"),
    JSON.stringify(record, null, 2),
    "utf8",
  );
  await writeFile(
    path.join(getExp7RunDir(sessionId), "analyzer-input.txt"),
    record.analyzerUserMessage,
    "utf8",
  );
  if (record.analyzerRawResponse) {
    await writeFile(
      path.join(getExp7RunDir(sessionId), "analyzer-raw.json"),
      record.analyzerRawResponse,
      "utf8",
    );
  }
}

export async function readExp7DebriefRecord(sessionId: string): Promise<Exp7DebriefRecord | null> {
  if (!exp7RunsEnabled()) return null;
  try {
    const raw = await readFile(path.join(getExp7RunDir(sessionId), "debrief.json"), "utf8");
    return JSON.parse(raw) as Exp7DebriefRecord;
  } catch {
    return null;
  }
}

export async function readLastExp7TurnRecord(sessionId: string): Promise<Exp7TurnRecord | null> {
  if (!exp7RunsEnabled()) return null;
  try {
    const raw = await readFile(path.join(getExp7RunDir(sessionId), "turns.jsonl"), "utf8");
    const lines = raw.trim().split("\n").filter(Boolean);
    if (!lines.length) return null;
    return JSON.parse(lines[lines.length - 1]!) as Exp7TurnRecord;
  } catch {
    return null;
  }
}
