"use client";

import React, { useCallback, useMemo, useState } from "react";
import MicrocourseDesktopBreadcrumbBar from "@/components/MicrocourseDesktopBreadcrumbBar/MicrocourseDesktopBreadcrumbBar";
import type { MicrocourseBreadcrumbItem } from "@/components/MicrocourseBreadcrumb/MicrocourseBreadcrumb";
import type { Exp7TopicCoverage } from "@/lib/arena/exp7/beatProgress";
import Exp7PracticePanel from "../Exp7PracticePanel";
import type { Exp7PanelPhase } from "../exp7Types";
import {
  EXP7_POST,
  EXP7_PRE,
  EXP7_PRE_POST_SESSION_BREADCRUMB,
  type Exp7ConversationCopy,
} from "./constants";
import ObjectivesCoverage from "./ObjectivesCoverage";
import styles from "./prePost.module.css";

/**
 * Session brief + live + full-shell debrief.
 * Report fills the whole box (no About/Objectives side column).
 * Default PRE (Claire). POST (Sam): /arena/exp7/pre-post/session?phase=post
 */
export default function PrePostSessionClient({
  phase = "pre",
}: {
  phase?: "pre" | "post";
}) {
  const copy: Exp7ConversationCopy = phase === "post" ? EXP7_POST : EXP7_PRE;
  const [mode, setMode] = useState<"brief" | "live">("brief");
  const [panelPhase, setPanelPhase] = useState<Exp7PanelPhase>("idle");
  const [imgFailed, setImgFailed] = useState(false);
  const [topicCoverage, setTopicCoverage] = useState<Exp7TopicCoverage | null>(
    null,
  );

  const breadcrumbItems = useMemo(
    () =>
      EXP7_PRE_POST_SESSION_BREADCRUMB.map(
        (item) => ({ ...item }) as MicrocourseBreadcrumbItem,
      ),
    [],
  );

  const startLive = useCallback(() => setMode("live"), []);

  const isLiveActive =
    mode === "live" && panelPhase !== "idle" && panelPhase !== "debrief";

  /** Feedback (and analyzing) use the full shell — no briefing side column. */
  const reportFullShell =
    mode === "live" &&
    (panelPhase === "debrief" || panelPhase === "analyzing");

  return (
    <div className={styles.sessionRoot}>
      <MicrocourseDesktopBreadcrumbBar items={breadcrumbItems} />

      <div className={styles.sessionPage}>
        <div className={styles.sessionFrame}>
          {isLiveActive ? (
            <div className={styles.sessionLiveStatus} role="status">
              <span className={styles.livePill}>Live conversation</span>
            </div>
          ) : null}

          <div
            className={[
              styles.shell,
              mode === "live" ? styles.shellLive : "",
              reportFullShell ? styles.shellReport : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {!reportFullShell ? (
              <>
                <div className={styles.shellCol}>
                  <div className={styles.colBody}>
                    <h2 className={styles.pageTitle}>{copy.title}</h2>

                    <section className={styles.block}>
                      <h3 className={`type-overline ${styles.blockLabel}`}>
                        What this conversation is about
                      </h3>
                      <ol className={styles.aboutList}>
                        {copy.about.map((point, i) => (
                          <li key={i}>{point}</li>
                        ))}
                      </ol>
                    </section>

                    <ObjectivesCoverage
                      objectives={copy.objectives}
                      live={isLiveActive}
                      covered={
                        isLiveActive ? topicCoverage?.covered : undefined
                      }
                    />
                  </div>
                </div>

                <div className={styles.shellDivider} aria-hidden />
              </>
            ) : null}

            <div
              className={`${styles.shellCol} ${styles.shellColEnd} ${
                reportFullShell ? styles.shellColFull : ""
              }`}
            >
              {mode === "brief" ? (
                <>
                  <div className={styles.colBody}>
                    <h3 className={`type-overline ${styles.blockLabel}`}>
                      Who&apos;s in this 1:1
                    </h3>
                    <div className={styles.whoStack}>
                      <div className={styles.whoRow}>
                        <span className={styles.whoMark} aria-hidden>
                          Me
                        </span>
                        <div className={styles.whoText}>
                          <p className={styles.whoName}>
                            {copy.whoYou.name}
                          </p>
                          <p className={`type-body-sm ${styles.whoRole}`}>
                            {copy.whoYou.role}
                          </p>
                          <p className={styles.whoCopy}>
                            {copy.whoYou.body}
                          </p>
                        </div>
                      </div>
                      <div className={styles.whoRow}>
                        {!imgFailed ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            className={styles.whoAvatar}
                            src={copy.characterAvatar}
                            alt=""
                            onError={() => setImgFailed(true)}
                          />
                        ) : (
                          <span className={styles.whoMark} aria-hidden>
                            {copy.whoThem.name.slice(0, 1)}
                          </span>
                        )}
                        <div className={styles.whoText}>
                          <p className={styles.whoName}>
                            {copy.whoThem.name}
                          </p>
                          <p className={`type-body-sm ${styles.whoRole}`}>
                            {copy.whoThem.role}
                          </p>
                          <p className={styles.whoCopy}>
                            {copy.whoThem.body}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={styles.colFooter}>
                    <p className={`type-caption ${styles.railHint}`}>
                      {copy.scene.formatNote}
                    </p>
                    <button
                      type="button"
                      className={`ds-btn ds-btn--primary ${styles.railCta}`}
                      onClick={startLive}
                    >
                      Join Conversation
                    </button>
                  </div>
                </>
              ) : (
                <div
                  className={`${styles.stageInner} ${
                    reportFullShell ? styles.stageInnerFull : ""
                  } ${
                    panelPhase === "analyzing" ? styles.stageInnerAnalyzing : ""
                  }`}
                >
                  <Exp7PracticePanel
                    scene={copy.scene}
                    omitIdle
                    autoStart
                    hideLiveProgress
                    onPhaseChange={setPanelPhase}
                    onTopicCoverageChange={setTopicCoverage}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
