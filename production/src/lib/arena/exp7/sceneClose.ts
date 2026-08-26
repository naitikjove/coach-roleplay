import type { Exp7SceneConfig } from "./content";

export type SceneCloseResult = {
  shouldClose: boolean;
  closeStyle: string;
  reason: string;
};

function limits(scene: Exp7SceneConfig) {
  const tl = scene.turnLimits;
  return [
    tl.minLearnerTurns ?? 4,
    tl.softMaxLearnerTurns ?? 7,
    tl.hardMaxLearnerTurns ?? 8,
    tl.absoluteMaxLearnerTurns ?? 10,
  ] as const;
}

/** Port of arena/roleplay/services/arena-api/app/exp7_scene_close.py */
export function evaluateSceneClose(
  scene: Exp7SceneConfig,
  learnerTurnCount: number,
  options: { manualEnd?: boolean; actorShouldClose?: boolean } = {},
): SceneCloseResult {
  const [minTurns, softMax, hardMax, absoluteMax] = limits(scene);
  const manualEnd = options.manualEnd ?? false;
  const actorShouldClose = options.actorShouldClose ?? false;

  if (manualEnd) {
    return { shouldClose: true, closeStyle: "manual", reason: "learner ended scene" };
  }

  if (learnerTurnCount >= absoluteMax) {
    return {
      shouldClose: true,
      closeStyle: "flat",
      reason: `absolute max ${absoluteMax} learner turns`,
    };
  }

  if (learnerTurnCount >= hardMax) {
    return {
      shouldClose: true,
      closeStyle: "flat",
      reason: `hard max ${hardMax} learner turns`,
    };
  }

  if (actorShouldClose && learnerTurnCount < minTurns) {
    return {
      shouldClose: false,
      closeStyle: "none",
      reason: `blocked until min ${minTurns} learner turns`,
    };
  }

  if (actorShouldClose && learnerTurnCount >= minTurns && learnerTurnCount <= softMax) {
    return {
      shouldClose: true,
      closeStyle: "warm",
      reason: "exchange resolved within soft window",
    };
  }

  return { shouldClose: false, closeStyle: "none", reason: "continue" };
}
