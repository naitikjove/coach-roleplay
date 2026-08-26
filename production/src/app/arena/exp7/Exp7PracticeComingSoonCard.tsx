"use client";

import React, { useState } from "react";
import Exp4SpeakerAvatar from "../exp4/Exp4SpeakerAvatar";
import { EXP7_UPCOMING_SCENE } from "./constants";
import styles from "./exp7PracticeCard.module.css";

type SceneCopy = typeof EXP7_UPCOMING_SCENE;

type Exp7PracticeComingSoonCardProps = {
  scene?: SceneCopy;
};

export default function Exp7PracticeComingSoonCard({
  scene = EXP7_UPCOMING_SCENE,
}: Exp7PracticeComingSoonCardProps) {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <>
      <div className={styles.overlineRow}>
        <span className={styles.overlineDot} aria-hidden />
        <p className={styles.overline}>Practice simulation</p>
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

      <div className={styles.ctaRow}>
        <button
          type="button"
          className={`ds-btn ds-btn--primary ${styles.primaryCta}`}
          onClick={() => setDemoOpen(true)}
        >
          {scene.ctaLabel}
        </button>
      </div>

      {demoOpen ? (
        <div
          className={styles.demoOverlay}
          role="presentation"
          onClick={() => setDemoOpen(false)}
        >
          <div
            className={styles.demoDialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="exp7-demo-dialog-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h4 id="exp7-demo-dialog-title" className={styles.demoDialogTitle}>
              Demo preview only
            </h4>
            <p className={styles.demoDialogBody}>{scene.demoOnlyMessage}</p>
            <button
              type="button"
              className={`ds-btn ds-btn--primary ${styles.primaryCta}`}
              onClick={() => setDemoOpen(false)}
            >
              Got it
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
