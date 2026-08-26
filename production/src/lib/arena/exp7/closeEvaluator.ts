import { mergeArcState } from "@/lib/arena/exp7/sceneArc";
import type { Exp7ArcState, TranscriptEntry } from "@/lib/arena/exp7/sessionStore";
import { inferArcFieldsFromTranscript } from "@/lib/arena/exp7/transcriptClose";

export type CloseEvaluation = {
  shouldClose: boolean;
  closeStyle: string;
  reason: string;
  naturalEnd: boolean;
  evaluatedBy: "code" | "llm" | "code+llm";
  actorSteering: string | null;
  learnerCavedOnMain: boolean;
  followUpRefused: boolean;
  arc: Exp7ArcState;
};

/**
 * Live Exp7: persist arc signals only — no auto-close, no director steering.
 * Full auto-close implementation: ./_parked/autoCloseEvaluator.ts.tmp
 */
export async function evaluateConversationClose(
  transcript: TranscriptEntry[],
  _learnerTurnCount: number,
  currentArc?: Exp7ArcState,
): Promise<CloseEvaluation> {
  const arc = mergeArcState(currentArc, inferArcFieldsFromTranscript(transcript));

  return {
    shouldClose: false,
    closeStyle: "none",
    reason: "manual end only",
    naturalEnd: false,
    evaluatedBy: "code",
    actorSteering: null,
    learnerCavedOnMain: arc.learnerCavedOnMain,
    followUpRefused: arc.followUpRefused,
    arc,
  };
}
