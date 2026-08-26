import { NextResponse } from "next/server";
import {
  computeBeatProgress,
  progressReadyToEndCopy,
  sceneUsesBeatProgress,
} from "@/lib/arena/exp7/beatProgress";
import { evaluateConversationClose } from "@/lib/arena/exp7/closeEvaluator";
import { loadExp7Scene } from "@/lib/arena/exp7/content";
import { parseExp7SessionSnapshot } from "@/lib/arena/exp7/parseSnapshot";
import { persistExp7Turn } from "@/lib/arena/exp7/runPersistence";
import { defaultExp7ArcState } from "@/lib/arena/exp7/sceneArc";
import { applyTurnIfMissing } from "@/lib/arena/exp7/sessionTurnApply";
import { ensureExp7Session, updateExp7Session } from "@/lib/arena/exp7/sessionStore";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ sessionId: string }> };

export async function POST(request: Request, context: RouteContext) {
  try {
    const { sessionId } = await context.params;
    const body = (await request.json().catch(() => ({}))) as {
      learnerText?: string;
      characterText?: string;
      snapshot?: unknown;
    };

    const session = await ensureExp7Session(sessionId, parseExp7SessionSnapshot(body));

    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 404 });
    }

    const learnerText = typeof body.learnerText === "string" ? body.learnerText.trim() : "";
    const characterText = typeof body.characterText === "string" ? body.characterText.trim() : "";

    const scene = loadExp7Scene(session.sceneId);

    if (!session.exp7Arc) {
      session.exp7Arc = defaultExp7ArcState();
    }

    const state = applyTurnIfMissing(session, learnerText, characterText);
    const transcript = state.transcript;
    const movesLedger = state.movesLedger;
    const acceptedLearner = learnerText;
    const learnerTurnCount = movesLedger.length;
    const beatProgress = sceneUsesBeatProgress(session.sceneId)
      ? computeBeatProgress(transcript)
      : null;
    const progressPayload = beatProgress
      ? {
          progress01: beatProgress.progress01,
          progressPercent: beatProgress.progressPercent,
          currentBeat: beatProgress.currentBeat,
          conversationClosed: beatProgress.conversationClosed,
          readyToEndCopy: progressReadyToEndCopy(beatProgress),
        }
      : null;

    // Opening Alex line — persist transcript only; skip close evaluation (no learner turns yet).
    if (!acceptedLearner && characterText && learnerTurnCount === 0) {
      updateExp7Session(sessionId, state);
      try {
        await persistExp7Turn(sessionId, {
          ts: new Date().toISOString(),
          turn: 0,
          learnerText: "",
          characterText,
        });
      } catch (err) {
        console.error("[exp7] persist opening turn failed", err);
      }
      return NextResponse.json({
        shouldClose: false,
        closeStyle: "none",
        reason: "opening line committed",
        naturalEnd: false,
        evaluatedBy: "code",
        actorSteering: null,
        learnerCavedOnMain: state.exp7Arc.learnerCavedOnMain,
        followUpRefused: state.exp7Arc.followUpRefused,
        alexPushCount: state.exp7Arc.alexPushCount,
        arc: state.exp7Arc,
        turnCount: 0,
        minLearnerTurns: scene.turnLimits.minLearnerTurns,
        ...(progressPayload ? { progress: progressPayload } : {}),
      });
    }

    // Learner-only staging commit (live STT) — persist learner line, evaluate close when Alex replies.
    if (acceptedLearner && !characterText) {
      updateExp7Session(sessionId, state);
      try {
        await persistExp7Turn(sessionId, {
          ts: new Date().toISOString(),
          turn: learnerTurnCount,
          learnerText: acceptedLearner,
          characterText: "",
        });
      } catch (err) {
        console.error("[exp7] persist learner-only turn failed", err);
      }
      return NextResponse.json({
        shouldClose: false,
        closeStyle: "none",
        reason: "learner line committed",
        naturalEnd: false,
        evaluatedBy: "code",
        actorSteering: null,
        learnerCavedOnMain: state.exp7Arc.learnerCavedOnMain,
        followUpRefused: state.exp7Arc.followUpRefused,
        alexPushCount: state.exp7Arc.alexPushCount,
        arc: state.exp7Arc,
        turnCount: learnerTurnCount,
        minLearnerTurns: scene.turnLimits.minLearnerTurns,
        ...(progressPayload ? { progress: progressPayload } : {}),
      });
    }

    const close = await evaluateConversationClose(transcript, learnerTurnCount, state.exp7Arc);

    state.exp7Arc = close.arc;
    updateExp7Session(sessionId, state);

    try {
      await persistExp7Turn(sessionId, {
        ts: new Date().toISOString(),
        turn: learnerTurnCount,
        learnerText: acceptedLearner,
        characterText,
        closeEval: {
          shouldClose: close.shouldClose,
          closeStyle: close.closeStyle,
          reason: close.reason,
          naturalEnd: close.naturalEnd,
          evaluatedBy: close.evaluatedBy,
          learnerCavedOnMain: close.learnerCavedOnMain,
          followUpRefused: close.followUpRefused,
          alexPushCount: close.arc.alexPushCount,
        },
      });
    } catch (err) {
      console.error("[exp7] persist turn failed", err);
    }

    return NextResponse.json({
      shouldClose: close.shouldClose,
      closeStyle: close.closeStyle,
      reason: close.reason,
      naturalEnd: close.naturalEnd,
      evaluatedBy: close.evaluatedBy,
      actorSteering: close.actorSteering,
      learnerCavedOnMain: close.learnerCavedOnMain,
      followUpRefused: close.followUpRefused,
      alexPushCount: close.arc.alexPushCount,
      arc: close.arc,
      turnCount: learnerTurnCount,
      minLearnerTurns: scene.turnLimits.minLearnerTurns,
      ...(progressPayload ? { progress: progressPayload } : {}),
    });
  } catch (err) {
    console.error("[exp7] commit-turn failed", err);
    return NextResponse.json(
      { error: "Could not save this turn. Please try again." },
      { status: 500 },
    );
  }
}
