import { NextResponse } from "next/server";
import { persistExp7Coverage } from "@/lib/arena/exp7/runPersistence";
import { isExp7SessionId } from "@/lib/arena/exp7/sessionStore";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ sessionId: string }> };

/** Dev-only marker log: append each live coverage-judge verdict to coverage.jsonl. */
export async function POST(request: Request, context: RouteContext) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  const { sessionId } = await context.params;
  if (!isExp7SessionId(sessionId)) {
    return NextResponse.json({ error: "Invalid session id" }, { status: 400 });
  }

  let body: {
    verdict?: unknown;
    merged?: unknown;
    newlyCovered?: unknown;
    transcriptLength?: unknown;
    lastCharacterLine?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const toBools = (v: unknown): boolean[] | null =>
    Array.isArray(v) && v.every((x) => typeof x === "boolean") ? v : null;

  const verdict = toBools(body.verdict);
  const merged = toBools(body.merged);
  if (!verdict || !merged) {
    return NextResponse.json({ error: "verdict/merged must be boolean arrays" }, { status: 400 });
  }

  await persistExp7Coverage(sessionId, {
    ts: new Date().toISOString(),
    verdict,
    merged,
    newlyCovered: Array.isArray(body.newlyCovered)
      ? body.newlyCovered.filter((n): n is number => typeof n === "number")
      : [],
    transcriptLength:
      typeof body.transcriptLength === "number" ? body.transcriptLength : -1,
    lastCharacterLine:
      typeof body.lastCharacterLine === "string"
        ? body.lastCharacterLine.slice(0, 300)
        : "",
  });

  return NextResponse.json({ ok: true });
}
