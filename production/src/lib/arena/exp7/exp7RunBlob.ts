import { get, list, put } from "@vercel/blob";
import type { Exp7DebriefRecord } from "@/lib/arena/exp7/runPersistence";

export type Exp7RoleplayPhase = "pre" | "post";

export type Exp7StoredRun = Exp7DebriefRecord & {
  phase: Exp7RoleplayPhase;
  sceneId?: string;
  lessonRef?: string;
};

function blobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
}

export function exp7BlobEnabled(): boolean {
  return blobConfigured();
}

function phaseFromRecord(record: Pick<Exp7StoredRun, "phase" | "lessonRef" | "sceneId" | "debrief">): Exp7RoleplayPhase {
  if (record.phase === "pre" || record.phase === "post") return record.phase;
  const lesson =
    record.lessonRef ||
    record.debrief?.lessonRef ||
    "";
  if (String(lesson).includes("post")) return "post";
  const scene = String(record.sceneId || "").toLowerCase();
  if (scene.includes("sam")) return "post";
  return "pre";
}

function sessionDebriefPath(sessionId: string): string {
  return `exp7-runs/${sessionId}/debrief.json`;
}

function latestPath(phase: Exp7RoleplayPhase): string {
  return `exp7-runs/latest/${phase}.json`;
}

/** Durable write — full transcript + debrief. No-op when Blob token missing. */
export async function writeExp7RunToBlob(record: Exp7StoredRun): Promise<boolean> {
  if (!blobConfigured()) return false;
  const phase = phaseFromRecord(record);
  const payload: Exp7StoredRun = {
    ...record,
    phase,
    lessonRef: record.lessonRef || record.debrief?.lessonRef,
  };
  const body = JSON.stringify(payload, null, 2);
  const opts = {
    access: "private" as const,
    contentType: "application/json",
    allowOverwrite: true,
    addRandomSuffix: false,
  };
  await put(sessionDebriefPath(payload.sessionId), body, opts);
  await put(latestPath(phase), body, opts);
  return true;
}

async function readBlobJson(pathname: string): Promise<Exp7StoredRun | null> {
  if (!blobConfigured()) return null;
  try {
    const result = await get(pathname, { access: "private", useCache: false });
    if (!result?.stream) return null;
    const text = await new Response(result.stream).text();
    if (!text.trim()) return null;
    return JSON.parse(text) as Exp7StoredRun;
  } catch {
    return null;
  }
}

export async function readLatestExp7RunFromBlob(
  phase: Exp7RoleplayPhase,
): Promise<Exp7StoredRun | null> {
  const latest = await readBlobJson(latestPath(phase));
  if (latest?.debrief && typeof latest.debrief.score === "number") return latest;

  // Fallback: scan session files (slower).
  if (!blobConfigured()) return null;
  try {
    const { blobs } = await list({ prefix: "exp7-runs/", limit: 100 });
    const candidates = blobs
      .filter((b) => b.pathname.endsWith("/debrief.json") && !b.pathname.includes("/latest/"))
      .sort((a, b) => (b.uploadedAt > a.uploadedAt ? 1 : -1));
    for (const blob of candidates) {
      const rec = await readBlobJson(blob.pathname);
      if (!rec?.debrief || typeof rec.debrief.score !== "number") continue;
      if (phaseFromRecord(rec) !== phase) continue;
      return rec;
    }
  } catch (err) {
    console.error("[exp7] blob list failed", err);
  }
  return null;
}

export async function readExp7RunFromBlob(
  sessionId: string,
): Promise<Exp7StoredRun | null> {
  return readBlobJson(sessionDebriefPath(sessionId));
}
