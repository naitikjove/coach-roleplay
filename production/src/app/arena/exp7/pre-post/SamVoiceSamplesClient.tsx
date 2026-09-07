"use client";

import React, { useCallback, useRef, useState } from "react";
import Link from "next/link";
import {
  EXP7_POST,
  EXP7_PRE_POST_HREF,
} from "./constants";
import {
  SAM_SAMPLE_LINE,
  SAM_TTS_INSTRUCTIONS,
  SAM_VOICE_SAMPLES,
  type SamVoiceSampleId,
} from "./samVoiceSamples";
import styles from "./prePost.module.css";

/** Temp page — compare Sam Realtime voice IDs before changing the live default. */
export default function SamVoiceSamplesClient() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [playingId, setPlayingId] = useState<SamVoiceSampleId | null>(null);
  const [loadingId, setLoadingId] = useState<SamVoiceSampleId | null>(null);
  const [error, setError] = useState<string | null>(null);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setPlayingId(null);
    setLoadingId(null);
  }, []);

  const play = useCallback(
    async (voiceId: SamVoiceSampleId) => {
      if (playingId === voiceId || loadingId === voiceId) {
        stop();
        return;
      }
      stop();
      setError(null);
      setLoadingId(voiceId);
      try {
        const res = await fetch("/api/arena/exp7/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: SAM_SAMPLE_LINE,
            voice: voiceId,
            instructions: SAM_TTS_INSTRUCTIONS,
          }),
        });
        if (!res.ok) {
          const detail = await res.text().catch(() => "");
          throw new Error(detail || `tts-${res.status}`);
        }
        const audio = audioRef.current;
        if (!audio) throw new Error("no-audio");
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        objectUrlRef.current = url;
        audio.src = url;
        setLoadingId(null);
        setPlayingId(voiceId);
        await audio.play();
      } catch (err) {
        stop();
        setError(
          err instanceof Error && err.message
            ? `Couldn’t play that sample (${err.message}).`
            : "Couldn’t play that sample. Try again in a moment.",
        );
      }
    },
    [loadingId, playingId, stop],
  );

  return (
    <div className={styles.sessionRoot} style={{ minHeight: "100vh", background: "#fff" }}>
      <div className={styles.sessionPage}>
        <div className={styles.sessionFrame}>
          <div className={styles.voiceSampleIntro}>
            <p className={`type-overline ${styles.blockLabel}`}>Temp · Sam A/B</p>
            <h1 className={styles.pageTitle}>Sam voice samples</h1>
            <p className={styles.voiceSampleLead}>
              Same opening line across the Realtime voice IDs we can set for live Sam (
              <code>gpt-realtime-2.1</code>). Claire stays on <strong>Marin</strong>. Current live
              Sam is <strong>Cedar</strong>. Pick a favorite, then we’ll swap the default.
            </p>
            <p className={styles.voiceSampleLine}>&ldquo;{SAM_SAMPLE_LINE}&rdquo;</p>
          </div>

          {error ? (
            <p className={styles.voiceSampleError} role="alert">
              {error}
            </p>
          ) : null}

          <ul className={styles.voiceSampleGrid}>
            {SAM_VOICE_SAMPLES.map((sample) => {
              const isPlaying = playingId === sample.id;
              const isLoading = loadingId === sample.id;
              return (
                <li key={sample.id} className={styles.voiceSampleCard}>
                  <div className={styles.voiceSampleHead}>
                    <span className={styles.voiceSampleName}>{sample.name}</span>
                    <span className={styles.voiceSampleTag}>{sample.tag}</span>
                  </div>
                  <p className={styles.voiceSampleFeel}>{sample.feel}</p>
                  <button
                    type="button"
                    className={`ds-btn ${isPlaying ? "ds-btn--secondary" : "ds-btn--primary"} ${styles.voiceSampleCta}`}
                    onClick={() => void play(sample.id)}
                    disabled={Boolean(loadingId) && !isLoading}
                  >
                    {isLoading ? "Loading…" : isPlaying ? "Stop" : "Play sample"}
                  </button>
                </li>
              );
            })}
          </ul>

          <p className={styles.voiceSampleFoot}>
            Character: {EXP7_POST.characterName} · {EXP7_POST.characterRole}. Temp page — does not
            change live Sam.{" "}
            <Link href={EXP7_PRE_POST_HREF}>Back to entry</Link>
          </p>
        </div>
      </div>
      <audio
        ref={audioRef}
        onEnded={stop}
        onError={() => {
          stop();
          setError("Playback failed. Try another sample.");
        }}
      />
    </div>
  );
}
