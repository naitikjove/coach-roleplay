import { NextResponse } from "next/server";
import { analyzeExp7Debrief } from "@/lib/arena/exp7/analyzer";
import { assessReportContentSufficiency } from "@/lib/arena/exp7/contentSufficiency";
import { parseExp7SessionSnapshot } from "@/lib/arena/exp7/parseSnapshot";
import {
  getExp7RunDirRelative,
  persistExp7Debrief,
} from "@/lib/arena/exp7/runPersistence";
import { ensureExp7Session, resetExp7Session } from "@/lib/arena/exp7/sessionStore";
import { formatExp7Transcript } from "@/lib/arena/exp7/transcript";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ sessionId: string }> };

export async function POST(request: Request, context: RouteContext) {
  try {
    const { sessionId } = await context.params;
    const body = (await request.json().catch(() => ({}))) as { snapshot?: unknown };
    const session = await ensureExp7Session(sessionId, parseExp7SessionSnapshot(body));

    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 404 });
    }

    const transcript = session.transcript;
    if (transcript.length === 0) {
      return NextResponse.json(
        {
          error:
            "No conversation turns were recorded for this session. Your lines may not have been saved — please retake.",
          code: "empty_transcript",
        },
        { status: 409 },
      );
    }

    const content = assessReportContentSufficiency(transcript);
    if (!content.ok) {
      return NextResponse.json(
        {
          error: content.message,
          code: "insufficient_content",
          learnerTurns: content.learnerTurns,
          learnerWords: content.learnerWords,
          minTurns: content.minTurns,
          minWords: content.minWords,
        },
        { status: 409 },
      );
    }

    const arc = session.exp7Arc;
    const movesLedger = session.movesLedger;
    const { debrief, debug } = await analyzeExp7Debrief(transcript, session.sceneId);

    void persistExp7Debrief(sessionId, {
      ts: new Date().toISOString(),
      sessionId,
      transcript,
      movesLedger,
      arc,
      formattedTranscript: debug.formattedTranscript,
      analyzerUserMessage: debug.analyzerUserMessage,
      analyzerRawResponse: debug.rawResponse,
      analyzerParsed: debug.parsed,
      scoreBeforeFloor: debug.scoreBeforeFloor,
      scoreAdjusted: debug.scoreAdjusted,
      debrief,
    }).catch((err) => console.error("[exp7] persist debrief failed", err));

    resetExp7Session(sessionId);

    const isDev = process.env.NODE_ENV !== "production";
    const learnerLines = transcript.filter((t) => t.role === "learner").length;
    const debugMeta = isDev
      ? {
          transcriptEntries: transcript.length,
          characterLines: transcript.filter((t) => t.role === "character").length,
          learnerLines,
          learnerTurns: movesLedger.length,
          transcriptChars: formatExp7Transcript(transcript).length,
          hasOpeningLine: transcript.some((t) => t.role === "character"),
          runDir: getExp7RunDirRelative(sessionId),
          ...(learnerLines === 0
            ? {
                warning:
                  "No learner lines in transcript — debrief may score too low. Check STT / commit-turn pairing.",
              }
            : {}),
        }
      : undefined;

    const debugPayload = isDev
      ? {
          formattedTranscript: debug.formattedTranscript,
          transcript,
          arc,
          scoreBeforeFloor: debug.scoreBeforeFloor,
          scoreAdjusted: debug.scoreAdjusted,
          analyzerRawResponse: debug.rawResponse,
          analyzerParsed: debug.parsed,
        }
      : undefined;

    return NextResponse.json({ ...debrief, _meta: debugMeta, _debug: debugPayload });
  } catch (err) {
    console.error("[exp7] complete failed", err);
    const message = err instanceof Error ? err.message : "Debrief failed";
    return NextResponse.json({ error: message, code: "debrief_failed" }, { status: 500 });
  }
}
