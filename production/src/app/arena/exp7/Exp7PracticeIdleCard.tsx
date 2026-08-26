"use client";

import React from "react";
import Exp4SpeakerAvatar from "../exp4/Exp4SpeakerAvatar";
import { EXP7_SCENE, isJordanScene, type Exp7SceneCopy } from "./constants";
import styles from "./exp7PracticeCard.module.css";

export type Exp7HealthStatus = "checking" | "ready" | "unavailable";

type Exp7PracticeIdleCardProps = {
  scene?: Exp7SceneCopy;
  onStart: () => void;
  onRetryHealth?: () => void;
  starting?: boolean;
  error?: string | null;
  healthStatus?: Exp7HealthStatus;
  disabled?: boolean;
};

export default function Exp7PracticeIdleCard({
  scene = EXP7_SCENE,
  onStart,
  onRetryHealth,
  starting = false,
  error = null,
  healthStatus = "checking",
  disabled = false,
}: Exp7PracticeIdleCardProps) {
  const canStart = healthStatus === "ready" && !starting && !error && !disabled;
  const showStatus = Boolean(error) || healthStatus !== "ready" || disabled;
  const isJordan = isJordanScene(scene);
  const overline = isJordan ? "Roleplay" : "Practice simulation";

  const statusTone = error
    ? "error"
    : healthStatus === "checking"
      ? "neutral"
      : disabled
        ? "neutral"
        : "error";

  const statusText = error
    ? error
    : disabled
      ? "Finish or end the other conversation first."
      : healthStatus === "checking"
        ? isJordan
          ? "Loading roleplay…"
          : "Loading practice session…"
        : isJordan
          ? "Roleplay isn't available right now. Try again in a moment."
          : "Practice isn't available right now. Try again in a moment.";

  return (
    <>
      <div className={styles.overlineRow}>
        <span className={styles.overlineDot} aria-hidden />
        <p className={styles.overline}>{overline}</p>
      </div>

      <div className={styles.idleHeader}>
        <h3 className={styles.title}>{scene.headline}</h3>
        <p className={styles.body}>{scene.intro}</p>
      </div>

      <div className={styles.characterRow}>
        <Exp4SpeakerAvatar
          src={scene.characterAvatar}
          label={scene.characterName}
          variant="character"
        />
        <div className={styles.characterMeta}>
          <span className={styles.characterName}>{scene.characterName}</span>
          <span className={styles.characterRole}>{scene.characterRole}</span>
        </div>
      </div>

      <p className={styles.howItWorks}>{scene.howItWorks}</p>
      <p className={styles.formatNote}>{scene.formatNote}</p>

      {showStatus ? (
        <div
          className={`${styles.statusBanner} ${styles[`statusBanner_${statusTone}`]}`}
          role="status"
        >
          <span>{statusText}</span>
        </div>
      ) : null}

      <div className={styles.ctaRow}>
        {healthStatus === "unavailable" && onRetryHealth ? (
          <button
            type="button"
            className={`ds-btn ds-btn--secondary ${styles.secondaryCta}`}
            onClick={onRetryHealth}
            disabled={starting}
          >
            Try again
          </button>
        ) : null}
        <button
          type="button"
          className={`ds-btn ds-btn--primary ${styles.primaryCta}`}
          onClick={onStart}
          disabled={!canStart}
        >
          {starting ? "Connecting…" : scene.ctaLabel}
        </button>
      </div>
    </>
  );
}
