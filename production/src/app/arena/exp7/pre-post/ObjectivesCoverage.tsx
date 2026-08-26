"use client";

import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import styles from "./prePost.module.css";

export type ObjectivesCoverageProps = {
  objectives: readonly string[];
  /** Parallel to objectives — true when that topic came up live. */
  covered?: readonly boolean[];
  /** When false, static brief title "Objectives" with no coverage chrome. */
  live?: boolean;
};

export default function ObjectivesCoverage({
  objectives,
  covered,
  live = false,
}: ObjectivesCoverageProps) {
  const total = objectives.length;
  const flags =
    covered && covered.length === total
      ? covered
      : Array.from({ length: total }, () => false);

  const [infoOpen, setInfoOpen] = useState(false);
  const infoWrapRef = useRef<HTMLDivElement>(null);
  const tipId = useId();

  const closeInfo = useCallback(() => setInfoOpen(false), []);

  useEffect(() => {
    if (!infoOpen) return;
    const onPointer = (e: MouseEvent | PointerEvent) => {
      const el = infoWrapRef.current;
      if (el && e.target instanceof Node && !el.contains(e.target)) {
        closeInfo();
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeInfo();
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [infoOpen, closeInfo]);

  return (
    <section className={styles.block} aria-labelledby="exp7-objectives-heading">
      <div className={styles.objectivesHeadingRow}>
        <h3
          id="exp7-objectives-heading"
          className={`type-overline ${styles.objectivesHeading}`}
        >
          Objectives
        </h3>
        {live ? (
          <div className={styles.objectivesInfoWrap} ref={infoWrapRef}>
            <button
              type="button"
              className={styles.objectivesInfoBtn}
              aria-label="About topics covered"
              aria-expanded={infoOpen}
              aria-controls={tipId}
              onClick={() => setInfoOpen((o) => !o)}
            >
              <span aria-hidden>i</span>
            </button>
            {infoOpen ? (
              <div
                id={tipId}
                role="dialog"
                aria-label="About topics covered"
                className={styles.objectivesInfoPopover}
              >
                <p className={styles.objectivesInfoTitle}>What&apos;s this?</p>
                <p className={styles.objectivesInfoBody}>
                  Items light up when that topic comes up in the conversation.
                  How well you handled each one is scored after you finish.
                </p>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <ol className={styles.objectives}>
        {objectives.map((obj, i) => {
          const isCovered = Boolean(live && flags[i]);
          return (
            <li
              key={i}
              className={isCovered ? styles.objectiveCovered : undefined}
              data-covered={isCovered ? "true" : "false"}
            >
              <span
                className={`${styles.objectivesNum} ${
                  isCovered ? styles.objectivesNumCovered : ""
                }`}
                aria-hidden
              >
                {isCovered ? (
                  <svg
                    className={styles.objectivesCheck}
                    viewBox="0 0 16 16"
                    width="12"
                    height="12"
                    fill="none"
                  >
                    <path
                      d="M3.5 8.2 6.4 11l6.1-6.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  i + 1
                )}
              </span>
              <span>{obj}</span>
              {isCovered ? (
                <span className={styles.srOnly}> (covered in conversation)</span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
