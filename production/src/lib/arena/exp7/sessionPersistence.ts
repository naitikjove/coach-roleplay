import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Exp7SessionState } from "@/lib/arena/exp7/sessionStore";

/** Writable on Vercel serverless (/tmp); local dev uses .exp7-runs under cwd. */
export function getExp7RunsRoot(): string {
  if (process.env.VERCEL === "1" || process.env.VERCEL === "true") {
    return path.join("/tmp", "exp7-runs");
  }
  return path.join(process.cwd(), ".exp7-runs");
}

export function getExp7RunDir(sessionId: string): string {
  return path.join(getExp7RunsRoot(), sessionId);
}

export function getExp7RunDirRelative(sessionId: string): string {
  const root = getExp7RunsRoot();
  if (root.startsWith("/tmp/")) {
    return path.join("tmp/exp7-runs", sessionId);
  }
  return path.join(".exp7-runs", sessionId);
}

export async function ensureExp7RunDir(sessionId: string): Promise<string> {
  const dir = getExp7RunDir(sessionId);
  await mkdir(dir, { recursive: true });
  return dir;
}

export async function persistExp7SessionState(
  sessionId: string,
  state: Exp7SessionState,
): Promise<void> {
  try {
    await ensureExp7RunDir(sessionId);
    await writeFile(
      path.join(getExp7RunDir(sessionId), "session.json"),
      JSON.stringify(state),
      "utf8",
    );
  } catch (err) {
    console.error("[exp7] persist session state failed", sessionId, err);
  }
}

export async function loadExp7SessionState(
  sessionId: string,
): Promise<Exp7SessionState | null> {
  try {
    const raw = await readFile(path.join(getExp7RunDir(sessionId), "session.json"), "utf8");
    const parsed = JSON.parse(raw) as Exp7SessionState;
    if (!parsed?.exp7) return null;
    return parsed;
  } catch {
    return null;
  }
}
