/** Rough time for Alex to finish speaking before we run the post-call analyzer. */
export function goodbyeAudioDelayMs(text: string): number {
  const chars = text.trim().length;
  return Math.min(5500, Math.max(1800, chars * 42));
}

/** Minimum wait after transcript before we even check audio silence. */
export function characterPlaybackTailMs(text: string, elapsedSinceTranscriptMs = 0): number {
  const chars = text.trim().length;
  const totalEst = chars > 0 ? Math.min(6000, Math.max(1200, chars * 48)) : 1200;
  const remaining = totalEst - Math.max(0, elapsedSinceTranscriptMs);
  return Math.min(4500, Math.max(700, remaining));
}
