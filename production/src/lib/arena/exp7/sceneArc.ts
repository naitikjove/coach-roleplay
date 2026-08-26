import type { Exp7ArcState } from "@/lib/arena/exp7/sessionStore";

export const MAX_REFUSAL_PUSHES = 3;
export const MAX_FOLLOWUP_PUSHES = 1;

export type ArcEvaluationFields = {
  alex_push_count_since_refusal?: number;
  follow_up_push_count?: number;
  must_stop_pushing?: boolean;
  learner_refused_main?: boolean;
  learner_caved_on_main?: boolean;
  follow_up_refused?: boolean;
  last_alex_move?: string;
};

export function defaultExp7ArcState(): Exp7ArcState {
  return {
    alexPushCount: 0,
    followUpPushCount: 0,
    learnerRefusedMain: false,
    learnerCavedOnMain: false,
    followUpRefused: false,
    steeringAppliedAtPush: 0,
  };
}

/** Monotonic arc update — push counts never decrease. */
export function mergeArcState(
  current: Exp7ArcState | undefined,
  fields: ArcEvaluationFields,
): Exp7ArcState {
  const base = current ?? defaultExp7ArcState();
  const alexPushCount = Math.max(
    base.alexPushCount,
    Number(fields.alex_push_count_since_refusal) || 0,
  );
  const followUpPushCount = Math.max(
    base.followUpPushCount,
    Number(fields.follow_up_push_count) || 0,
  );

  return {
    alexPushCount,
    followUpPushCount,
    learnerRefusedMain: base.learnerRefusedMain || Boolean(fields.learner_refused_main),
    learnerCavedOnMain: base.learnerCavedOnMain || Boolean(fields.learner_caved_on_main),
    followUpRefused: base.followUpRefused || Boolean(fields.follow_up_refused),
    steeringAppliedAtPush: base.steeringAppliedAtPush,
  };
}

export function mustStopPushing(arc: Exp7ArcState, fields: ArcEvaluationFields): boolean {
  if (fields.must_stop_pushing) return true;
  if (arc.learnerCavedOnMain && arc.followUpRefused && arc.followUpPushCount >= MAX_FOLLOWUP_PUSHES) {
    return true;
  }
  if (!arc.learnerCavedOnMain && arc.learnerRefusedMain && arc.alexPushCount >= MAX_REFUSAL_PUSHES) {
    return true;
  }
  return false;
}

/** Alex pushed again after wrap steering was already injected. */
export function alexIgnoredSteering(arc: Exp7ArcState, fields: ArcEvaluationFields): boolean {
  if (arc.steeringAppliedAtPush < 1) return false;
  if (arc.alexPushCount <= arc.steeringAppliedAtPush) return false;
  const move = String(fields.last_alex_move || "").toLowerCase();
  return move === "push" || move === "ask";
}

export function pushLimitReached(arc: Exp7ArcState): boolean {
  if (arc.learnerCavedOnMain && arc.followUpRefused) {
    return arc.followUpPushCount >= MAX_FOLLOWUP_PUSHES;
  }
  if (arc.learnerRefusedMain || arc.alexPushCount > 0) {
    return arc.alexPushCount >= MAX_REFUSAL_PUSHES;
  }
  return false;
}
