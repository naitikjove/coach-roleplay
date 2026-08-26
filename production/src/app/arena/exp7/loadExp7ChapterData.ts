import { buildExp7FallbackPayload } from "./exp7FallbackData";
import type { Exp7ChapterPayload } from "./constants";

/** Offline-first chapter payload for Exp 7 practice shell. */
export async function loadExp7ChapterDataOrFallback(): Promise<Exp7ChapterPayload> {
  if (process.env.EXP7_USE_LIVE_API === "true") {
    const { loadExp4ChapterDataOrFallback } = await import("../exp4/loadExp4ChapterData");
    return loadExp4ChapterDataOrFallback();
  }
  return buildExp7FallbackPayload();
}
