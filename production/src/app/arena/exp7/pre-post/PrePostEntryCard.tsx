"use client";

import React, { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import {
  EXP7_PRE,
  EXP7_PRE_ENTRY_PURPOSE,
  EXP7_PRE_POST_COMPETENCIES,
  EXP7_PRE_POST_SESSION_HREF,
  EXP7_PRE_TRANSITION,
  PRE_POST_TRANSITION_MS,
} from "./constants";
import styles from "./prePost.module.css";

type PrePostEntryCardProps = {
  onNavigateStart?: () => void;
};

/**
 * Entry meta card — comfortable spacing + short PRE purpose line.
 */
export default function PrePostEntryCard({ onNavigateStart }: PrePostEntryCardProps) {
  const router = useRouter();
  const [transitioning, setTransitioning] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  const go = useCallback(() => {
    if (transitioning) return;
    setTransitioning(true);
    onNavigateStart?.();
    window.setTimeout(() => {
      router.push(EXP7_PRE_POST_SESSION_HREF);
    }, PRE_POST_TRANSITION_MS);
  }, [onNavigateStart, router, transitioning]);

  return (
    <>
      <div className={styles.metaCard} data-prepost-entry="comfortable">
        <div className={styles.metaMain}>
          <div className={styles.metaIdentity}>
            {!imgFailed ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className={styles.metaAvatarImg}
                src={EXP7_PRE.characterAvatar}
                alt=""
                onError={() => setImgFailed(true)}
              />
            ) : (
              <span className={styles.metaAvatarFallback} aria-hidden>
                J
              </span>
            )}
            <div className={styles.metaText}>
              <h3 className={styles.metaTitle}>{EXP7_PRE.title}</h3>
              <p className={styles.metaCharacter}>
                <span className={styles.metaCharName}>{EXP7_PRE.characterName}</span>
                <span className={styles.metaCharDot} aria-hidden>
                  ·
                </span>
                <span className={styles.metaCharRole}>{EXP7_PRE.characterRole}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            className={`ds-btn ds-btn--primary ${styles.metaCta}`}
            onClick={go}
            disabled={transitioning}
          >
            {transitioning ? "Opening…" : "Enter 1:1 Conversation"}
          </button>
        </div>

        <p className={styles.metaPurpose}>{EXP7_PRE_ENTRY_PURPOSE}</p>

        <div className={styles.assessBlock}>
          <p className={styles.assessLabel}>What you will be assessed on</p>
          <ul className={styles.compRow}>
            {EXP7_PRE_POST_COMPETENCIES.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      </div>

      {transitioning ? (
        <div className={styles.transitionRoot} role="status" aria-live="polite">
          <div className={styles.transitionCard}>
            <p className={styles.transitionTitle}>{EXP7_PRE_TRANSITION.title}</p>
            <p className={styles.transitionSub}>{EXP7_PRE_TRANSITION.subtitle}</p>
            <div className={styles.progressTrack}>
              <div className={styles.progressFill} />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
