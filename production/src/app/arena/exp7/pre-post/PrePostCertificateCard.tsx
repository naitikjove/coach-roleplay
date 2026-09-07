"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  EXP7_CERTIFICATE_LABEL,
  EXP7_POST,
  EXP7_POST_ENTRY_PURPOSE,
  EXP7_POST_TRANSITION,
  EXP7_PRE_POST_COMPETENCIES,
  EXP7_PRE_POST_LAST_RESULTS_POST_HREF,
  EXP7_PRE_POST_SESSION_POST_HREF,
  PRE_POST_TRANSITION_MS,
} from "./constants";
import styles from "./prePost.module.css";

type PrePostCertificateCardProps = {
  onNavigateStart?: () => void;
};

type LastSummary = {
  score: number;
};

/**
 * Certificate meta card — same shell as the practice entry card, shown after
 * the chapter videos so the journey reads practice → videos → certificate.
 */
export default function PrePostCertificateCard({
  onNavigateStart,
}: PrePostCertificateCardProps) {
  const router = useRouter();
  const [transitioning, setTransitioning] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);
  const [lastSummary, setLastSummary] = useState<LastSummary | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/arena/exp7/last-debrief?phase=post", {
          cache: "no-store",
        });
        const data = (await res.json()) as {
          available?: boolean;
          score?: number;
        };
        if (cancelled) return;
        if (data?.available && typeof data.score === "number") {
          setLastSummary({ score: data.score });
          return;
        }
      } catch {
        /* ignore */
      }
      if (!cancelled) setLastSummary(null);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const go = useCallback(() => {
    if (transitioning) return;
    setTransitioning(true);
    onNavigateStart?.();
    window.setTimeout(() => {
      router.push(EXP7_PRE_POST_SESSION_POST_HREF);
    }, PRE_POST_TRANSITION_MS);
  }, [onNavigateStart, router, transitioning]);

  return (
    <>
      <div className={styles.certSection}>
        <div className={styles.metaCard} data-prepost-entry="certificate">
          <div className={styles.metaMain}>
            <div className={styles.metaIdentity}>
              {!imgFailed ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className={styles.metaAvatarImg}
                  src={EXP7_POST.characterAvatar}
                  alt=""
                  onError={() => setImgFailed(true)}
                />
              ) : (
                <span className={styles.metaAvatarFallback} aria-hidden>
                  S
                </span>
              )}
              <div className={styles.metaText}>
                <p className={styles.metaEyebrow}>{EXP7_CERTIFICATE_LABEL}</p>
                <h3 className={styles.metaTitle}>{EXP7_POST.title}</h3>
                <p className={styles.metaCharacter}>
                  <span className={styles.metaCharName}>{EXP7_POST.characterName}</span>
                  <span className={styles.metaCharDot} aria-hidden>
                    ·
                  </span>
                  <span className={styles.metaCharRole}>{EXP7_POST.characterRole}</span>
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

          <p className={styles.metaPurpose}>{EXP7_POST_ENTRY_PURPOSE}</p>

          <div className={styles.assessBlock}>
            <p className={styles.assessLabel}>What you will be assessed on</p>
            <ul className={styles.compRow}>
              {EXP7_PRE_POST_COMPETENCIES.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>

          {lastSummary ? (
            <p className={styles.lastResultsSubtle}>
              <a
                href={EXP7_PRE_POST_LAST_RESULTS_POST_HREF}
                className={styles.lastResultsLink}
              >
                Last results · {lastSummary.score}/10
              </a>
            </p>
          ) : null}
        </div>
      </div>

      {transitioning ? (
        <div className={styles.transitionRoot} role="status" aria-live="polite">
          <div className={styles.transitionCard}>
            <p className={styles.transitionTitle}>{EXP7_POST_TRANSITION.title}</p>
            <p className={styles.transitionSub}>{EXP7_POST_TRANSITION.subtitle}</p>
            <div className={styles.progressTrack}>
              <div className={styles.progressFill} />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
