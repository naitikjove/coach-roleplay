/** Shape frequency data into 5 waveform bars (matches Exp4 voice playback). */
const BAR_WEIGHTS = [0.25, 0.6, 1, 0.6, 0.25];

export function shapeBarLevels(freqData: Uint8Array, out: number[], barCount = 5): void {
  const used = Math.min(freqData.length, 24);
  let sum = 0;
  for (let i = 0; i < used; i += 1) sum += freqData[i] ?? 0;
  const amp = used > 0 ? sum / used / 255 : 0;
  for (let i = 0; i < barCount; i += 1) {
    out[i] = Math.min(amp * (BAR_WEIGHTS[i] ?? 1) * 2.2, 1);
  }
}

/** WebRTC remote audio often has weak FFT bins — derive bars from waveform segments. */
export function shapeBarLevelsFromTimeDomain(
  timeData: Uint8Array,
  out: number[],
  barCount = 5,
  gain = 3.4,
): void {
  const segment = Math.max(1, Math.floor(timeData.length / barCount));
  for (let b = 0; b < barCount; b += 1) {
    let sum = 0;
    const start = b * segment;
    const end = Math.min(start + segment, timeData.length);
    for (let i = start; i < end; i += 1) {
      const v = ((timeData[i] ?? 128) - 128) / 128;
      sum += v * v;
    }
    const rms = Math.sqrt(sum / Math.max(1, end - start));
    out[b] = Math.min(rms * (BAR_WEIGHTS[b] ?? 1) * gain, 1);
  }
}

export function readBarLevelsFromAnalyser(
  analyser: AnalyserNode,
  freqScratch: Uint8Array,
  timeScratch: Uint8Array,
  out: number[],
  opts?: { timeDomainGain?: number; freqPeakThreshold?: number },
): void {
  const timeGain = opts?.timeDomainGain ?? 3.4;
  const peakThreshold = opts?.freqPeakThreshold ?? 10;

  analyser.getByteFrequencyData(freqScratch);
  let peak = 0;
  for (let i = 0; i < freqScratch.length; i += 1) {
    peak = Math.max(peak, freqScratch[i] ?? 0);
  }
  if (peak >= peakThreshold) {
    shapeBarLevels(freqScratch, out);
    return;
  }

  analyser.getByteTimeDomainData(timeScratch);
  shapeBarLevelsFromTimeDomain(timeScratch, out, out.length, timeGain);
}

export function resetBarLevels(out: number[]): void {
  for (let i = 0; i < out.length; i += 1) out[i] = 0;
}

export type VoiceBarMonitor = {
  readBarLevels: (out: number[]) => void;
  dispose: () => void;
};

export function attachMicBarMonitor(stream: MediaStream): VoiceBarMonitor | null {
  if (!stream.getAudioTracks().length) return null;

  let disposed = false;
  const ctx = new AudioContext();
  const source = ctx.createMediaStreamSource(stream);
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 64;
  analyser.smoothingTimeConstant = 0.75;
  source.connect(analyser);
  const freqScratch = new Uint8Array(analyser.frequencyBinCount);
  const timeScratch = new Uint8Array(analyser.fftSize);

  void ctx.resume().catch(() => undefined);

  return {
    readBarLevels: (out) => {
      if (disposed) {
        resetBarLevels(out);
        return;
      }
      readBarLevelsFromAnalyser(analyser, freqScratch, timeScratch, out);
    },
    dispose: () => {
      disposed = true;
      try {
        source.disconnect();
      } catch {
        /* ignore */
      }
      void ctx.close().catch(() => undefined);
    },
  };
}
