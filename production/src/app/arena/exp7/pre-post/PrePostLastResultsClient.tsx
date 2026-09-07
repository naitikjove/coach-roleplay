"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Logo from "@/Assets/CoachExplore/Logo/ColorLogo.svg";
import {
  applyPreMicrocourseHref,
  readLastRoleplayDebriefFromStorage,
  type Exp7LastDebriefPayload,
  type Exp7RoleplayPhase,
} from "@/lib/arena/exp7/lastDebrief";
import Exp7Debrief from "../Exp7Debrief";
import type { Exp7DebriefResult } from "../exp7Types";
import {
  EXP7_MICROCOURSE_TITLE,
  EXP7_POST,
  EXP7_PRE,
  EXP7_PRE_POST_HREF,
  EXP7_PRE_POST_SESSION_HREF,
  EXP7_PRE_POST_SESSION_POST_HREF,
} from "./constants";
import styles from "./prePost.module.css";

type LoadState = "boot" | "loading" | "ready" | "missing";

/**
 * Client-only last-results viewer for Claire PRE or Sam POST.
 * Same continuous-white shell as live feedback (Figma).
 */
export default function PrePostLastResultsClient({
  phase = "pre",
}: {
  phase?: Exp7RoleplayPhase;
}) {
  const router = useRouter();
  const [loadState, setLoadState] = useState<LoadState>("boot");
  const [debrief, setDebrief] = useState<Exp7DebriefResult | null>(null);
  const copy = phase === "post" ? EXP7_POST : EXP7_PRE;
  const retakeHref =
    phase === "post" ? EXP7_PRE_POST_SESSION_POST_HREF : EXP7_PRE_POST_SESSION_HREF;

  const closeSession = useCallback(
    () => router.push(EXP7_PRE_POST_HREF),
    [router],
  );

  useEffect(() => {
    let cancelled = false;
    setLoadState("loading");

    const applyPayload = (payload: Exp7LastDebriefPayload) => {
      if (cancelled) return;
      setDebrief(applyPreMicrocourseHref(payload.debrief));
      setLoadState("ready");
    };

    void (async () => {
      try {
        const res = await fetch(`/api/arena/exp7/last-debrief?phase=${phase}`, {
          cache: "no-store",
        });
        const data = (await res.json()) as
          | Exp7LastDebriefPayload
          | { available: false };
        if (cancelled) return;
        if (data && "available" in data && data.available && data.debrief) {
          applyPayload(data);
          return;
        }
      } catch {
        /* fall through */
      }

      const stored = readLastRoleplayDebriefFromStorage(phase);
      if (stored) {
        applyPayload(stored);
        return;
      }
      if (!cancelled) setLoadState("missing");
    })();

    return () => {
      cancelled = true;
    };
  }, [phase]);

  const who = phase === "post" ? "Sam" : "Claire";
  const statusCopy =
    loadState === "missing"
      ? `No saved evaluation yet. Complete a ${who} 1:1 to generate results.`
      : "Loading last results…";

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

      <div className={`${styles.sessionPage} ${styles.sessionPageReport}`}>
        {loadState === "ready" && debrief ? (
          <div className={`${styles.sessionFrame} ${styles.sessionFrameReport}`}>
            <div className={`${styles.shell} ${styles.shellLive} ${styles.shellReport}`}>
              <div className={`${styles.shellCol} ${styles.shellColEnd} ${styles.shellColFull}`}>
                <div className={`${styles.stageInner} ${styles.stageInnerFull}`}>
                  <Exp7Debrief
                    result={debrief}
                    scene={copy.scene}
                    onRetake={() => {
                      window.location.assign(retakeHref);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className={styles.lastResultsStatus} suppressHydrationWarning>
            {statusCopy}
          </p>
        )}
      </div>
    </div>
  );
}
