import { NextResponse } from "next/server";
import {
  getExp7RunDirRelative,
  readExp7DebriefRecord,
  readLastExp7TurnRecord,
} from "@/lib/arena/exp7/runPersistence";
import { getExp7Session } from "@/lib/arena/exp7/sessionStore";
import { formatExp7Transcript } from "@/lib/arena/exp7/transcript";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ sessionId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  const { sessionId } = await context.params;
  const session = getExp7Session(sessionId);
  const savedDebrief = await readExp7DebriefRecord(sessionId);
  const lastTurn = await readLastExp7TurnRecord(sessionId);

  if (!session?.exp7 && !savedDebrief) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const transcript = session?.transcript ?? savedDebrief?.transcript ?? [];
  const arc = session?.exp7Arc ?? savedDebrief?.arc;
  const movesLedger = session?.movesLedger ?? savedDebrief?.movesLedger ?? [];

  return NextResponse.json({
    sessionId,
    active: Boolean(session?.exp7),
    runDir: getExp7RunDirRelative(sessionId),
    transcript,
    movesLedger,
    arc,
    formattedTranscript: formatExp7Transcript(transcript),
    lastCloseEval: lastTurn?.closeEval ?? null,
    savedDebrief: savedDebrief
      ? {
          ts: savedDebrief.ts,
          debrief: savedDebrief.debrief,
          scoreBeforeFloor: savedDebrief.scoreBeforeFloor,
          scoreAdjusted: savedDebrief.scoreAdjusted,
          analyzerUserMessage: savedDebrief.analyzerUserMessage,
          analyzerRawResponse: savedDebrief.analyzerRawResponse,
          analyzerParsed: savedDebrief.analyzerParsed,
        }
      : null,
  });
}
