import { EXP7_SCENE_ID } from "./content";
import {
  loadExp7SessionState,
  persistExp7SessionState,
} from "./sessionPersistence";
import { defaultExp7ArcState } from "./sceneArc";

export type TranscriptEntry = {
  role: "learner" | "character";
  text: string;
  speakerId?: string;
};

export type MoveLedgerEntry = {
  turn: number;
  learner_quote: string;
};

export type Exp7ArcState = {
  /** Alex pushes after learner refused main ask (max 3). */
  alexPushCount: number;
  /** Alex pushes on follow-up after partial cave (max 1). */
  followUpPushCount: number;
  learnerRefusedMain: boolean;
  learnerCavedOnMain: boolean;
  followUpRefused: boolean;
  /** Push count when wrap steering was last injected. */
  steeringAppliedAtPush: number;
};

export type Exp7SessionState = {
  transcript: TranscriptEntry[];
  movesLedger: MoveLedgerEntry[];
  exp7Arc: Exp7ArcState;
  exp7: true;
  sceneId: string;
  createdAt: number;
};

export type Exp7SessionSnapshot = Pick<
  Exp7SessionState,
  "transcript" | "movesLedger" | "exp7Arc" | "sceneId" | "createdAt"
>;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const globalStore = globalThis as unknown as {
  __exp7Sessions?: Map<string, Exp7SessionState>;
};

function store(): Map<string, Exp7SessionState> {
  if (!globalStore.__exp7Sessions) {
    globalStore.__exp7Sessions = new Map();
  }
  return globalStore.__exp7Sessions;
}

export function isExp7SessionId(sessionId: string): boolean {
  return UUID_RE.test(sessionId);
}

export function createExp7Session(
  sessionId: string,
  sceneId: string = EXP7_SCENE_ID,
): Exp7SessionState {
  return bootstrapExp7Session(sessionId, sceneId);
}

export function bootstrapExp7Session(
  sessionId: string,
  sceneId: string = EXP7_SCENE_ID,
): Exp7SessionState {
  const existing = store().get(sessionId);
  if (existing?.exp7) return existing;

  const state: Exp7SessionState = {
    transcript: [],
    movesLedger: [],
    exp7Arc: defaultExp7ArcState(),
    exp7: true,
    sceneId: sceneId || EXP7_SCENE_ID,
    createdAt: Date.now(),
  };
  store().set(sessionId, state);
  void persistExp7SessionState(sessionId, state);
  return state;
}

export function getExp7Session(sessionId: string): Exp7SessionState | undefined {
  return store().get(sessionId);
}

function restoreExp7Session(
  sessionId: string,
  snapshot: Exp7SessionSnapshot,
): Exp7SessionState {
  const state: Exp7SessionState = {
    transcript: Array.isArray(snapshot.transcript) ? [...snapshot.transcript] : [],
    movesLedger: Array.isArray(snapshot.movesLedger) ? [...snapshot.movesLedger] : [],
    exp7Arc: snapshot.exp7Arc ?? defaultExp7ArcState(),
    exp7: true,
    sceneId:
      typeof snapshot.sceneId === "string"
        ? snapshot.sceneId
        : snapshot.sceneId != null
          ? String(snapshot.sceneId)
          : EXP7_SCENE_ID,
    createdAt: snapshot.createdAt ?? Date.now(),
  };
  store().set(sessionId, state);
  void persistExp7SessionState(sessionId, state);
  return state;
}

/**
 * Serverless-safe session resolution.
 * Client snapshot is authoritative when it carries transcript data.
 * Any valid session id can bootstrap on a cold lambda (no 404).
 */
export async function ensureExp7Session(
  sessionId: string,
  snapshot?: Exp7SessionSnapshot | null,
): Promise<Exp7SessionState | null> {
  if (!isExp7SessionId(sessionId)) return null;

  const hasSnapshotData =
    Boolean(snapshot?.transcript?.length) || Boolean(snapshot?.movesLedger?.length);

  if (hasSnapshotData && snapshot) {
    return restoreExp7Session(sessionId, snapshot);
  }

  const cached = getExp7Session(sessionId);
  if (cached?.exp7) return cached;

  const fromDisk = await loadExp7SessionState(sessionId);
  if (fromDisk?.exp7) {
    store().set(sessionId, fromDisk);
    return fromDisk;
  }

  return bootstrapExp7Session(sessionId);
}

/** @deprecated Use ensureExp7Session */
export async function resolveExp7Session(
  sessionId: string,
  snapshot?: Exp7SessionSnapshot | null,
): Promise<Exp7SessionState | undefined> {
  const session = await ensureExp7Session(sessionId, snapshot);
  return session ?? undefined;
}

export function updateExp7Session(sessionId: string, state: Exp7SessionState): void {
  store().set(sessionId, state);
  void persistExp7SessionState(sessionId, state);
}

export function resetExp7Session(sessionId: string): void {
  const existing = store().get(sessionId);
  if (!existing) return;
  store().set(sessionId, {
    ...existing,
    transcript: [],
    movesLedger: [],
    exp7Arc: defaultExp7ArcState(),
  });
}
