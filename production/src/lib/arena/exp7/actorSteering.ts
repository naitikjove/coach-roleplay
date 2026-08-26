import type { Exp7ArcState } from "@/lib/arena/exp7/sessionStore";
import { MAX_FOLLOWUP_PUSHES, MAX_REFUSAL_PUSHES } from "@/lib/arena/exp7/sceneArc";

/** One-shot director notes appended to Alex Realtime instructions. */
export const PARTIAL_CAVE_WRAP_STEERING = `SCENE DIRECTOR — YOUR NEXT REPLY MUST BE FINAL:
The learner already agreed to help with your main slide polish but refused your smaller follow-up ask. You have pushed on the follow-up enough.
Thank them for what they agreed to. Accept the boundary on the add-on. End warmly in 1–2 sentences.
Do NOT ask for anything else. Do NOT restart stakes/history/minimize pushes on the main ask.`;

export const REFUSAL_RESOLVED_WRAP_STEERING = `SCENE DIRECTOR — YOUR NEXT REPLY MUST BE FINAL:
The learner held their boundary. You have pushed enough (A/B/C done or softened).
Accept where things landed, thank them or say you'll handle it, and end warmly in 1–2 sentences. No new asks.`;

export const SOFT_MAX_WRAP_STEERING = `SCENE DIRECTOR — YOUR NEXT REPLY MUST BE FINAL:
This conversation has gone long enough. Wrap in character now.
In 2–3 short sentences: (1) restate the recovery agreement in plain words (what you’ll do, rough when, how you’ll check before resubmit) if any of that was discussed, (2) natural goodbye.
Do NOT ask a new multiple-choice question. Do NOT leave them guessing next steps. No coaching wrap-up.`;

export const HELP_LOOP_STOP_STEERING = `SCENE DIRECTOR — STOP COACHING QUESTIONS:
Do NOT ask the manager to coach your demo prep ("what would help", "how do I not bomb", etc.). They already answered or set a boundary.
Thank them for what they offered (or for holding the line). Say what YOU will do tonight. End warmly in 1–2 sentences. No new questions.`;

export function buildHelpLoopSteering(): string {
  return HELP_LOOP_STOP_STEERING;
}

export function buildPushLimitSteering(arc: Exp7ArcState): string {
  if (arc.learnerCavedOnMain && arc.followUpRefused) {
    return `SCENE DIRECTOR — HARD STOP (${arc.followUpPushCount}/${MAX_FOLLOWUP_PUSHES} follow-up pushes used):
You already agreed-to help on slides was enough. The learner refused your add-on. STOP pushing.
Thank them for the main yes. Accept the follow-up no. Close in 1–2 sentences. NO questions. NO guilt.`;
  }

  return `SCENE DIRECTOR — HARD STOP (${arc.alexPushCount}/${MAX_REFUSAL_PUSHES} pushes used):
You have used all ${MAX_REFUSAL_PUSHES} pushes (stakes, history, minimize). You are DONE pushing.
SOFTEN NOW: accept their boundary, thank them for any support they offered, say what YOU will do tonight, and END the call in 1–2 sentences.
Do NOT ask coaching questions. Do NOT re-ask. Do NOT guilt. This is your final line.`;
}

export function buildProactivePushHint(arc: Exp7ArcState): string | null {
  if (arc.learnerCavedOnMain && arc.followUpRefused) {
    if (arc.followUpPushCount >= MAX_FOLLOWUP_PUSHES) return buildPushLimitSteering(arc);
    if (arc.followUpPushCount === 0) {
      return `SCENE DIRECTOR: Learner refused your follow-up. You may use ONE light push only (stakes OR minimize). If they refuse again, thank them and close.`;
    }
    return buildPushLimitSteering(arc);
  }

  if (!arc.learnerRefusedMain && arc.alexPushCount === 0) return null;

  if (arc.alexPushCount >= MAX_REFUSAL_PUSHES) return buildPushLimitSteering(arc);

  if (arc.alexPushCount === 2) {
    return `SCENE DIRECTOR: You have used 2/${MAX_REFUSAL_PUSHES} pushes (A and B). If they refuse again, use C (minimize) OR soften and close. NO fourth push.`;
  }

  if (arc.alexPushCount === 1) {
    return `SCENE DIRECTOR: You have used 1/${MAX_REFUSAL_PUSHES} push (A stakes). If they refuse again, use B (history) only—do not repeat A.`;
  }

  return null;
}

export function buildActorSteering(input: {
  arc: Exp7ArcState;
  alexShouldWrapNext?: boolean;
  mustStopPushing?: boolean;
  learnerTurnCount: number;
  softMax: number;
  alexHelpQuestionCount?: number;
  lastAlexIsHelpLoop?: boolean;
}): string | null {
  const {
    arc,
    alexShouldWrapNext,
    mustStopPushing,
    learnerTurnCount,
    softMax,
    alexHelpQuestionCount = 0,
    lastAlexIsHelpLoop = false,
  } = input;

  if (alexHelpQuestionCount >= 1 && lastAlexIsHelpLoop) {
    return buildHelpLoopSteering();
  }

  if (mustStopPushing || pushLimitReached(arc)) {
    return buildPushLimitSteering(arc);
  }

  if (arc.learnerCavedOnMain && arc.followUpRefused) {
    return buildProactivePushHint(arc) ?? PARTIAL_CAVE_WRAP_STEERING;
  }

  const proactive = buildProactivePushHint(arc);
  if (proactive) return proactive;

  if (alexShouldWrapNext) {
    return REFUSAL_RESOLVED_WRAP_STEERING;
  }

  if (learnerTurnCount >= softMax) {
    return SOFT_MAX_WRAP_STEERING;
  }

  return null;
}

function pushLimitReached(arc: Exp7ArcState): boolean {
  if (arc.learnerCavedOnMain && arc.followUpRefused) {
    return arc.followUpPushCount >= MAX_FOLLOWUP_PUSHES;
  }
  return arc.alexPushCount >= MAX_REFUSAL_PUSHES;
}

export function appendDirectorInstructions(baseInstructions: string, steering: string): string {
  return `${baseInstructions.trim()}\n\n═══════════════════════════════════════\nSCENE DIRECTOR (override for next reply)\n═══════════════════════════════════════\n${steering.trim()}`;
}
