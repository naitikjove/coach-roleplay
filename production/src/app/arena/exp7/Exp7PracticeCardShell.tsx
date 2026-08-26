"use client";

import React from "react";
import styles from "./exp7PracticeCard.module.css";

type Exp7PracticeCardShellProps = {
  children: React.ReactNode;
  /** `chapter` = static border in microcourse scroll (no animated glow bleed). */
  variant?: "default" | "muted" | "feedback" | "chapter" | "analyzing";
};

/** Production-aligned practice card shell (animated border, platform tokens). */
export default function Exp7PracticeCardShell({
  children,
  variant = "default",
}: Exp7PracticeCardShellProps) {
  const wrapperClass =
    variant === "muted"
      ? styles.wrapperMuted
      : variant === "feedback"
        ? styles.wrapperFeedback
        : variant === "chapter"
          ? styles.wrapperChapter
          : variant === "analyzing"
            ? styles.wrapperAnalyzing
            : "";

  const cardClass = variant === "muted" ? styles.cardMuted : "";

  return (
    <div className={`${styles.wrapper} ${wrapperClass}`}>
      <div className={styles.cardInner}>
        <div className={`${styles.card} ${cardClass}`}>{children}</div>
      </div>
    </div>
  );
}
