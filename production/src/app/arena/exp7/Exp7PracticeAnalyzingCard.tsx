"use client";

import React, { useEffect, useState } from "react";
import styles from "./exp7PracticeCard.module.css";

const ANALYZING_TITLES = [
  "Reviewing your conversation",
  "Evaluating your responses",
  "Working the magic",
  "Suggesting improvements",
] as const;

const TITLE_INTERVAL_MS = 2400;
const TITLE_FADE_MS = 320;

export default function Exp7PracticeAnalyzingCard() {
  const [titleIndex, setTitleIndex] = useState(0);
  const [titleVisible, setTitleVisible] = useState(true);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    let fadeTimer: number | undefined;
    const interval = window.setInterval(() => {
      setTitleVisible(false);
      fadeTimer = window.setTimeout(() => {
        setTitleIndex((current) => (current + 1) % ANALYZING_TITLES.length);
        setTitleVisible(true);
      }, TITLE_FADE_MS);
    }, TITLE_INTERVAL_MS);

    return () => {
      window.clearInterval(interval);
      if (fadeTimer) window.clearTimeout(fadeTimer);
    };
  }, []);

  const title = ANALYZING_TITLES[titleIndex];

  return (
    <div className={styles.analyzingStage} role="status" aria-live="polite" aria-busy="true">
      <div className={styles.analyzingCopy}>
        <p
          className={`${styles.analyzingTitle} ${titleVisible ? styles.analyzingTitleVisible : styles.analyzingTitleHidden}`}
        >
          {title}
        </p>
      </div>

      <div className={styles.analyzingProgressTrack} aria-hidden>
        <span className={styles.analyzingProgressBar} />
      </div>
    </div>
  );
}
