import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import type { Exp7DebriefResult } from "@/app/arena/exp7/exp7Types";
import {
  EXP7_LESSON_DURATION,
  EXP7_LESSON_THUMBNAIL,
  EXP7_LESSON_TITLE,
} from "@/app/arena/exp7/constants";
import { EXP7_PRE_MICROCOURSE_HREF } from "@/app/arena/exp7/pre-post/constants";
import {
  exp7BlobEnabled,
  readLatestExp7RunFromBlob,
  type Exp7RoleplayPhase,
} from "@/lib/arena/exp7/exp7RunBlob";
import type { Exp7DebriefRecord } from "@/lib/arena/exp7/runPersistence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RunDebriefFile = Exp7DebriefRecord & {
  debrief?: Exp7DebriefResult & { evaluationFailed?: boolean };
};

function runsRoot(): string {
  return path.join(process.cwd(), ".exp7-runs");
}

function parsePhase(url: string): Exp7RoleplayPhase {
  try {
    const phase = new URL(url).searchParams.get("phase");
    return phase === "post" ? "post" : "pre";
  } catch {
    return "pre";
  }
}

function matchesPhase(record: RunDebriefFile, phase: Exp7RoleplayPhase): boolean {
  if (record.phase === "pre" || record.phase === "post") {
    return record.phase === phase;
  }
  const lesson = String(record.lessonRef || record.debrief?.lessonRef || "").toLowerCase();
  const isPost = lesson.includes("post");
  return phase === "post" ? isPost : !isPost;
}

async function listCandidateDirs(): Promise<Array<{ dir: string; mtimeMs: number }>> {
  const root = runsRoot();
  let names: string[] = [];
  try {
    names = await fs.readdir(root);
  } catch {
    return [];
  }

  const out: Array<{ dir: string; mtimeMs: number }> = [];
  for (const name of names) {
    if (name.startsWith("_") || name.startsWith(".")) continue;
    const dir = path.join(root, name);
    try {
      const st = await fs.stat(dir);
      if (!st.isDirectory()) continue;
      out.push({ dir, mtimeMs: st.mtimeMs });
    } catch {
      /* skip */
    }
  }
  out.sort((a, b) => b.mtimeMs - a.mtimeMs);
  return out;
}

function normalizeDebrief(raw: Exp7DebriefResult): Exp7DebriefResult | null {
  if (!raw || typeof raw.score !== "number") return null;
  if (raw.evaluationFailed) return null;
  return {
    ...raw,
    strengths: Array.isArray(raw.strengths) ? raw.strengths : [],
    improvements: Array.isArray(raw.improvements) ? raw.improvements : [],
    lessonHref: EXP7_PRE_MICROCOURSE_HREF,
    lessonTitle: raw.lessonTitle || EXP7_LESSON_TITLE,
    lessonThumbnail: raw.lessonThumbnail || EXP7_LESSON_THUMBNAIL,
    lessonDuration: raw.lessonDuration || EXP7_LESSON_DURATION,
  };
}

function toResponse(
  sessionId: string,
  debrief: Exp7DebriefResult,
  savedAt: string | undefined,
  phase: Exp7RoleplayPhase,
  transcriptLength?: number,
) {
  return NextResponse.json({
    available: true,
    sessionId,
    phase,
    score: debrief.score,
    headlineLabel: debrief.headlineLabel || debrief.headline,
    ...(typeof debrief.percent === "number" ? { percent: debrief.percent } : {}),
    ...(typeof transcriptLength === "number" ? { transcriptLength } : {}),
    savedAt,
    debrief,
  });
}

/**
 * Latest saved Claire PRE or Sam POST evaluation.
 * Query: ?phase=pre|post (default pre).
 * Sources: Vercel Blob (prod) then local `.exp7-runs`.
 */
export async function GET(request: Request) {
  const phase = parsePhase(request.url);

  if (exp7BlobEnabled()) {
    try {
      const fromBlob = await readLatestExp7RunFromBlob(phase);
      const debrief = fromBlob?.debrief ? normalizeDebrief(fromBlob.debrief) : null;
      if (fromBlob && debrief) {
        return toResponse(
          fromBlob.sessionId,
          debrief,
          fromBlob.ts,
          phase,
          fromBlob.transcript?.length,
        );
      }
    } catch (err) {
      console.error("[exp7] last-debrief blob read failed", err);
    }
  }

  const dirs = await listCandidateDirs();
  for (const { dir, mtimeMs } of dirs) {
    const debriefPath = path.join(dir, "debrief.json");
    try {
      const raw = await fs.readFile(debriefPath, "utf8");
      const parsed = JSON.parse(raw) as RunDebriefFile;
      if (!matchesPhase(parsed, phase)) continue;
      const debrief = parsed.debrief ? normalizeDebrief(parsed.debrief) : null;
      if (!debrief) continue;

      const sessionId = parsed.sessionId || path.basename(dir);
      return toResponse(
        sessionId,
        debrief,
        parsed.ts || new Date(mtimeMs).toISOString(),
        phase,
        parsed.transcript?.length,
      );
    } catch {
      continue;
    }
  }

  return NextResponse.json({ available: false, phase });
}
