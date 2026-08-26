"use client";

import React, { useCallback, useRef, useState } from "react";
import Link from "next/link";
import MicrocourseDesktopBreadcrumbBar from "@/components/MicrocourseDesktopBreadcrumbBar/MicrocourseDesktopBreadcrumbBar";
import type { MicrocourseBreadcrumbItem } from "@/components/MicrocourseBreadcrumb/MicrocourseBreadcrumb";
import {
  EXP7_PRE,
  EXP7_PRE_POST_HREF,
  EXP7_PRE_POST_SESSION_BREADCRUMB,
} from "./constants";
import {
  JORDAN_SAMPLE_LINE,
  JORDAN_VOICE_SAMPLES,
  type JordanVoiceSampleId,
} from "./jordanVoiceSamples";
import styles from "./prePost.module.css";

const BREADCRUMB: MicrocourseBreadcrumbItem[] = [
  ...EXP7_PRE_POST_SESSION_BREADCRUMB.slice(0, -1).map(
    (item) => ({ ...item }) as MicrocourseBreadcrumbItem,
  ),
  { label: "Voice samples" },
];

export default function JordanVoiceSamplesClient() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [playingId, setPlayingId] = useState<JordanVoiceSampleId | null>(null);
  const [loadingId, setLoadingId] = useState<JordanVoiceSampleId | null>(null);
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
    async (voiceId: JordanVoiceSampleId) => {
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
          body: JSON.stringify({ text: JORDAN_SAMPLE_LINE, voice: voiceId }),
        });
        const audio = audioRef.current;
        if (!audio) throw new Error("no-audio");
        if (res.ok) {
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          objectUrlRef.current = url;
          audio.src = url;
        } else {
          audio.src = `/arena/exp7/voices/${voiceId}.mp3`;
        }
        setLoadingId(null);
        setPlayingId(voiceId);
        await audio.play();
      } catch {
        stop();
        setError("Couldn’t play that sample. Try again in a moment.");
      }
    },
    [loadingId, playingId, stop],
  );

  return (
    <div className={styles.sessionRoot}>
      <MicrocourseDesktopBreadcrumbBar items={BREADCRUMB} />
      <div className={styles.sessionPage}>
        <div className={styles.sessionFrame}>
          <div className={styles.voiceSampleIntro}>
            <p className={`type-overline ${styles.blockLabel}`}>Sample variant</p>
            <h1 className={styles.pageTitle}>Claire voice samples</h1>
            <p className={styles.voiceSampleLead}>
              Same opening line, four Realtime voices. Pick the one that sounds like a senior IC
              in a tense first 1:1 — not a narrator. Current live 1:1 uses{" "}
              <strong>Marin</strong>.
            </p>
            <p className={styles.voiceSampleLine}>&ldquo;{JORDAN_SAMPLE_LINE}&rdquo;</p>
          </div>

          {error ? (
            <p className={styles.voiceSampleError} role="alert">
              {error}
            </p>
          ) : null}

          <ul className={styles.voiceSampleGrid}>
            {JORDAN_VOICE_SAMPLES.map((sample) => {
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
            Character: {EXP7_PRE.characterName} · {EXP7_PRE.characterRole}.{" "}
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
