/**
 * Detect when remote WebRTC audio has gone quiet — used to hand off the mic
 * only after Alex actually finishes speaking (not when transcript completes).
 */

import {
  readBarLevelsFromAnalyser,
  resetBarLevels,
} from "./voiceBarLevels";

export type RemoteAudioMonitor = {
  /** Current remote (Alex) audio level 0–1. */
  readLevel: () => number;
  /** True when Alex audio is playing above threshold right now. */
  isPlaying: (threshold?: number) => boolean;
  /** Exp4-style 5-bar waveform levels from live remote audio. */
  readBarLevels: (out: number[]) => void;
  waitForSpeechStart: (opts?: {
    maxWaitMs?: number;
    pollMs?: number;
    threshold?: number;
  }) => Promise<boolean>;
  waitForSilence: (opts?: {
    minSilentMs?: number;
    maxWaitMs?: number;
    pollMs?: number;
    threshold?: number;
  }) => Promise<void>;
  dispose: () => void;
};

function rmsFromTimeData(timeData: Uint8Array): number {
  let sum = 0;
  for (let i = 0; i < timeData.length; i += 1) {
    const v = ((timeData[i] ?? 128) - 128) / 128;
    sum += v * v;
  }
  return Math.sqrt(sum / Math.max(1, timeData.length));
}

export function attachRemoteAudioMonitor(audio: HTMLAudioElement): RemoteAudioMonitor | null {
  const stream = audio.srcObject;
  if (!(stream instanceof MediaStream) || stream.getAudioTracks().length === 0) {
    return null;
  }

  let disposed = false;
  const ctx = new AudioContext();
  const barAnalyser = ctx.createAnalyser();
  barAnalyser.fftSize = 256;
  barAnalyser.smoothingTimeConstant = 0.65;
  const levelAnalyser = ctx.createAnalyser();
  levelAnalyser.fftSize = 512;
  levelAnalyser.smoothingTimeConstant = 0.5;

  // Parallel tap on the WebRTC stream — <audio> keeps playing; we analyse the live track.
  // (MediaElementSource often yields flat/weak bins for WebRTC playback.)
  const streamSource = ctx.createMediaStreamSource(stream);
  streamSource.connect(barAnalyser);
  streamSource.connect(levelAnalyser);

  const levelScratch = new Uint8Array(levelAnalyser.fftSize);
  const freqScratch = new Uint8Array(barAnalyser.frequencyBinCount);
  const timeScratch = new Uint8Array(barAnalyser.fftSize);

  void ctx.resume().catch(() => undefined);

  return {
    readLevel: () => {
      if (disposed) return 0;
      levelAnalyser.getByteTimeDomainData(levelScratch);
      return rmsFromTimeData(levelScratch);
    },
    isPlaying: (threshold = 0.018) => {
      if (disposed) return false;
      levelAnalyser.getByteTimeDomainData(levelScratch);
      return rmsFromTimeData(levelScratch) >= threshold;
    },
    readBarLevels: (out) => {
      if (disposed) {
        resetBarLevels(out);
        return;
      }
      readBarLevelsFromAnalyser(barAnalyser, freqScratch, timeScratch, out, {
        timeDomainGain: 10,
        freqPeakThreshold: 4,
      });
    },
    waitForSpeechStart: (opts = {}) => {
      const maxWaitMs = opts.maxWaitMs ?? 4500;
      const pollMs = opts.pollMs ?? 80;
      const threshold = opts.threshold ?? 0.018;

      return new Promise<boolean>((resolve) => {
        const started = Date.now();

        const tick = () => {
          if (disposed) {
            resolve(false);
            return;
          }

          levelAnalyser.getByteTimeDomainData(levelScratch);
          if (rmsFromTimeData(levelScratch) >= threshold) {
            resolve(true);
            return;
          }

          if (Date.now() - started >= maxWaitMs) {
            resolve(false);
            return;
          }

          window.setTimeout(tick, pollMs);
        };

        tick();
      });
    },
    waitForSilence: (opts = {}) => {
      const minSilentMs = opts.minSilentMs ?? 400;
      const maxWaitMs = opts.maxWaitMs ?? 9000;
      const pollMs = opts.pollMs ?? 80;
      const threshold = opts.threshold ?? 0.018;

      return new Promise<void>((resolve) => {
        const started = Date.now();
        let silentSince: number | null = null;

        const tick = () => {
          if (disposed) {
            resolve();
            return;
          }

          levelAnalyser.getByteTimeDomainData(levelScratch);
          const level = rmsFromTimeData(levelScratch);
          const now = Date.now();

          if (level < threshold) {
            if (silentSince === null) silentSince = now;
            if (now - silentSince >= minSilentMs) {
              resolve();
              return;
            }
          } else {
            silentSince = null;
          }

          if (now - started >= maxWaitMs) {
            resolve();
            return;
          }

          window.setTimeout(tick, pollMs);
        };

        tick();
      });
    },
    dispose: () => {
      disposed = true;
      try {
        streamSource.disconnect();
        barAnalyser.disconnect();
        levelAnalyser.disconnect();
      } catch {
        /* ignore */
      }
      void ctx.close().catch(() => undefined);
    },
  };
}
