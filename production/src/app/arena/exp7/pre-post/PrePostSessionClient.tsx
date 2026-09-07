"use client";

import React, { useCallback, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Logo from "@/Assets/CoachExplore/Logo/ColorLogo.svg";
import type { Exp7TopicCoverage } from "@/lib/arena/exp7/beatProgress";
import Exp7PracticePanel from "../Exp7PracticePanel";
import type { Exp7PanelPhase } from "../exp7Types";
import {
  EXP7_MICROCOURSE_TITLE,
  EXP7_POST,
  EXP7_PRE,
  EXP7_PRE_POST_HREF,
  type Exp7ConversationCopy,
} from "./constants";
import ObjectivesCoverage from "./ObjectivesCoverage";
import PrePostLastResultsClient from "./PrePostLastResultsClient";
import styles from "./prePost.module.css";

/**
 * Session brief + live + full-shell debrief.
 * Report fills the whole box (no About/Objectives side column).
 * Default PRE (Claire). POST (Sam): /arena/exp7/pre-post/session?phase=post
 * Last results: /arena/exp7/pre-post/session?view=last
 */
export default function PrePostSessionClient({
  phase = "pre",
  viewLast = false,
}: {
  phase?: "pre" | "post";
  viewLast?: boolean;
}) {
  const router = useRouter();
  const copy: Exp7ConversationCopy = phase === "post" ? EXP7_POST : EXP7_PRE;
  const [mode, setMode] = useState<"brief" | "live">("brief");
  const [panelPhase, setPanelPhase] = useState<Exp7PanelPhase>("idle");
  const [imgFailed, setImgFailed] = useState(false);
  const [topicCoverage, setTopicCoverage] = useState<Exp7TopicCoverage | null>(
    null,
  );

  const startLive = useCallback(() => setMode("live"), []);
  const closeSession = useCallback(
    () => router.push(EXP7_PRE_POST_HREF),
    [router],
  );

  if (viewLast) {
    return <PrePostLastResultsClient phase={phase === "post" ? "post" : "pre"} />;
  }

  const isLiveActive =
    mode === "live" &&
    (panelPhase === "connecting" || panelPhase === "live");

  /** Top-right pill only while the call is actually live — never during analyzing/debrief. */
  const showLiveConversationLabel = mode === "live" && panelPhase === "live";

  /** Feedback (and analyzing) use the full shell — no briefing side column. */
  const reportFullShell =
    mode === "live" &&
    (panelPhase === "debrief" || panelPhase === "analyzing");

  return (
    <div className={styles.sessionRoot}>
      <header className={styles.briefTopBar}>
        <span className={styles.briefTopLogo}>
          <Image src={Logo} alt="JoVE Coach" width={112} height={24} priority />
        </span>
        <h1 className={styles.briefTopTitle}>{EXP7_MICROCOURSE_TITLE}</h1>
        <button
          type="button"
          className={styles.briefClose}
          aria-label="Close conversation"
          onClick={closeSession}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
            <path
              d="M5 5l10 10M15 5L5 15"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </header>

      <div
        className={`${styles.sessionPage} ${
          reportFullShell ? styles.sessionPageReport : ""
        }`}
      >
        <div
          className={`${styles.sessionFrame} ${
            mode === "brief" ? styles.sessionFrameBrief : ""
          } ${reportFullShell ? styles.sessionFrameReport : ""}`}
        >
          {mode === "brief" ? (
            <div className={styles.briefGrid}>
              <section className={styles.briefCard}>
                <div className={styles.briefHead}>
                  <p className={styles.briefEyebrow}>{copy.phaseLabel}</p>
                  <h2 className={styles.briefTitle}>{copy.title}</h2>
                  <p className={styles.briefSummary}>{copy.summary}</p>
                </div>
                <div className={styles.briefBody}>
                  <ObjectivesCoverage objectives={copy.objectives} />
                </div>
              </section>

              <aside className={styles.briefSideCard}>
                <p className={styles.briefSideHead}>
                  Who is in the Conversation
                </p>

                <div className={styles.briefSideBody}>
                  {!imgFailed ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      className={styles.briefPersonAvatar}
                      src={copy.characterAvatar}
                      alt=""
                      onError={() => setImgFailed(true)}
                    />
                  ) : (
                    <span className={styles.briefPersonInitial} aria-hidden>
                      {copy.whoThem.name.slice(0, 1)}
                    </span>
                  )}
                  <p className={styles.briefPersonName}>{copy.whoThem.name}</p>
                  <p className={styles.briefPersonRole}>{copy.whoThem.role}</p>

                  <span className={styles.briefConnector} aria-hidden>
                    <span className={styles.briefConnectorLine} />
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6.6 10.8c1.2 2.3 3.1 4.2 5.4 5.4l1.8-1.8c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.5.6.6 0 1 .4 1 1V19c0 .6-.4 1-1 1C10.6 20 4 13.4 4 5c0-.6.4-1 1-1h3.2c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.5.1.4 0 .8-.2 1l-1.8 1.8z" />
                    </svg>
                    <span className={styles.briefConnectorLine} />
                  </span>

                  <span className={styles.briefPersonInitial} aria-hidden>
                    {copy.whoYou.name.slice(0, 1)}
                  </span>
                  <p className={styles.briefPersonName}>
                    {copy.whoYou.name === "You"
                      ? "You"
                      : `${copy.whoYou.name} (You)`}
                  </p>
                  <p className={styles.briefPersonRole}>{copy.whoYou.role}</p>
                </div>

                <div className={styles.briefSideFoot}>
                  <button
                    type="button"
                    className={`ds-btn ds-btn--primary ${styles.briefSideCta}`}
                    onClick={startLive}
                  >
                    Start roleplay
                  </button>
                  <p className={styles.briefSideNote}>
                    {copy.scene.formatNote}
                  </p>
                </div>
              </aside>
            </div>
          ) : null}

          {mode === "brief" ? null : (
            <>
          {showLiveConversationLabel ? (
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
                      <p className={styles.briefSummary}>{copy.summary}</p>
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
            </div>
          </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
