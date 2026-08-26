"use client";

import React from "react";
import Exp4SpeakerAvatar from "../exp4/Exp4SpeakerAvatar";
import Exp4Waveform from "../exp4/Exp4Waveform";
import { EXP7_SCENE, type Exp7SceneCopy } from "./constants";
import type { Exp7SpeakerState } from "./exp7Types";
import styles from "./exp7PracticeCard.module.css";

/** Single UI mode — one source of truth for what the learner sees. */
export type Exp7UiMode =
  | "connecting"
  | "starting"
  | "character_speaking"
  | "character_thinking"
  | "you"
  | "your_turn";

type Exp7PracticeLiveCardProps = {
  scene?: Exp7SceneCopy;
  connecting?: boolean;
  speakerState: Exp7SpeakerState;
  ending?: boolean;
  onEndScene: () => void;
  voiceLevelsRef?: React.MutableRefObject<number[]>;
  analyserReadyRef?: React.MutableRefObject<boolean>;
  /** Continuous conversation progress (0–100). No labels / segments. */
  showProgress?: boolean;
  progressPercent?: number;
  /** Soft hint near End scene when conversation is ready to close. */
  readyToEndCopy?: string | null;
};

function toUiMode(speakerState: Exp7SpeakerState, connecting: boolean): Exp7UiMode {
  if (connecting) return "connecting";
  switch (speakerState) {
    case "user_speaking":
      return "you";
    case "awaiting_user":
      return "your_turn";
    case "thinking":
      return "character_thinking";
    case "character_speaking":
    case "wrapping_up":
      return "character_speaking";
    case "idle":
      return "starting";
    default:
      return "starting";
  }
}

const UI_COPY: Record<Exp7UiMode, { label: string; hint?: string }> = {
  connecting: { label: "Connecting", hint: "Setting up microphone and voice" },
  starting: { label: "Starting", hint: "The conversation will begin in a moment" },
  character_speaking: { label: "Speaking" },
  character_thinking: { label: "Thinking", hint: "One moment" },
  you: { label: "You're speaking" },
  your_turn: { label: "Your turn", hint: "Speak when ready" },
};

function StatusDots() {
  return (
    <span className={styles.liveStatusDots} aria-hidden>
      <span />
      <span />
      <span />
    </span>
  );
}

export default function Exp7PracticeLiveCard({
  scene = EXP7_SCENE,
  connecting = false,
  speakerState,
  ending = false,
  onEndScene,
  voiceLevelsRef,
  analyserReadyRef,
  showProgress = false,
  progressPercent = 0,
  readyToEndCopy = null,
}: Exp7PracticeLiveCardProps) {
  const mode = toUiMode(speakerState, connecting);
  const copy = UI_COPY[mode];
  const isSetup = mode === "connecting" || mode === "starting";
  const isThinking = mode === "character_thinking";
  const isYourTurn = mode === "your_turn";
  const isSpeakingMode = mode === "character_speaking" || mode === "you";
  const showWaveform = isSpeakingMode;
  const showStatusDots = isSetup || isThinking || isYourTurn;
  const avatarSpeaking = mode === "character_speaking";
  const showSpinner = isSetup;
  const clampedProgress = Math.max(0, Math.min(100, Math.round(progressPercent)));

  // CSS still uses alex_* class names for stage variants.
  const stageClass =
    mode === "character_speaking"
      ? "alex_speaking"
      : mode === "character_thinking"
        ? "alex_thinking"
        : mode;

  return (
    <div className={styles.liveStage}>
      <div className={styles.liveToolbar}>
        <span
          className={`${styles.liveBadge} ${
            isSetup ? styles.liveBadgeSetup : styles.liveBadgeActive
          }`}
        >
          {isSetup ? "Setting up" : "Live conversation"}
        </span>
        <button
          type="button"
          className={`ds-btn ds-btn--primary ${styles.primaryCta} ${styles.endSceneCta}`}
          onClick={onEndScene}
          disabled={ending}
        >
          {ending ? "Ending…" : "End scene"}
        </button>
      </div>

      {readyToEndCopy ? (
        <p className={styles.liveReadyHint}>{readyToEndCopy}</p>
      ) : null}

      {showProgress ? (
        <div
          className={styles.liveProgress}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={clampedProgress}
          aria-label="Conversation progress"
        >
          <div className={styles.liveProgressTrack}>
            <div
              className={styles.liveProgressFill}
              style={{ width: `${clampedProgress}%` }}
            />
          </div>
        </div>
      ) : null}

      <div
        className={`${styles.liveStageBody} ${styles[`liveStage_${stageClass}`]}`}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        aria-label={[copy.label, copy.hint].filter(Boolean).join(". ")}
      >
        <div className={styles.liveAvatarWrap}>
          {showSpinner ? <span className={styles.liveSpinner} aria-hidden /> : null}
          <Exp4SpeakerAvatar
            src={scene.characterAvatar}
            label={scene.characterName}
            variant="character"
            speaking={avatarSpeaking}
            className={styles.liveAvatar}
          />
        </div>

        <div className={styles.liveIdentity}>
          <p className={styles.liveName}>{scene.characterName}</p>
          <p className={styles.liveRole}>{scene.characterRole}</p>
        </div>

        <div className={styles.liveStatusRow}>
          {showWaveform ? (
            <span className={styles.liveWaveformSlot}>
              <Exp4Waveform
                active
                fallbackPulse={false}
                levelsRef={voiceLevelsRef}
                analyserReadyRef={analyserReadyRef}
              />
            </span>
          ) : showStatusDots ? (
            <span className={styles.liveIndicatorSlot}>
              <StatusDots />
            </span>
          ) : (
            <span className={styles.liveIndicatorSlot} aria-hidden />
          )}
          <p className={styles.liveStatusLabel}>{copy.label}</p>
        </div>

        {copy.hint ? <p className={styles.liveStatusHint}>{copy.hint}</p> : null}

        {mode === "you" ? (
          <span className={styles.micLive}>
            <span className={styles.micDot} aria-hidden />
            Mic on
          </span>
        ) : null}
      </div>
    </div>
  );
}
