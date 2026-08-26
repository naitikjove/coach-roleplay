"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Exp7Debrief from "./Exp7Debrief";
import Exp7PracticeAnalyzingCard from "./Exp7PracticeAnalyzingCard";
import Exp7PracticeCardShell from "./Exp7PracticeCardShell";
import Exp7PracticeIdleCard from "./Exp7PracticeIdleCard";
import Exp7PracticeLiveCard from "./Exp7PracticeLiveCard";
import Exp7RealtimeBridge from "./Exp7RealtimeBridge";
import { EXP7_LESSON_HREF, EXP7_LESSON_TITLE, EXP7_SCENE, type Exp7SceneCopy } from "./constants";
import {
  exp7CommitTurnWithRetry,
  exp7CompleteScene,
  exp7Health,
  exp7StartSession,
  mapCompleteToDebrief,
  type Exp7CommitResponse,
  type Exp7SessionSnapshot,
} from "./exp7Api";
import { unlockBrowserAudio } from "./exp7Realtime";
import type { Exp7DebriefResult, Exp7PanelPhase, Exp7SpeakerState } from "./exp7Types";
import { humanizeExp7Error, parseExp7Error } from "./exp7Errors";
import type { Exp7HealthStatus } from "./Exp7PracticeIdleCard";
import {
  assessReportContentSufficiency,
  EXP7_INSUFFICIENT_CONTENT_MESSAGE,
} from "@/lib/arena/exp7/contentSufficiency";
import {
  computeBeatProgress,
  emptyTopicCoverage,
  mergeTopicCoverage,
  progressReadyToEndCopy,
  sceneUsesBeatProgress,
  type Exp7TopicCoverage,
} from "@/lib/arena/exp7/beatProgress";
import { coverageJudgeInstructions as buildCoverageJudgeInstructions } from "@/lib/arena/exp7/coverageJudge";
import styles from "./exp7PracticeCard.module.css";

const LEARNER_STT_WAIT_MS = 500;

type BufferedCommit = {
  sid: string;
  learner: string;
  character: string;
  attempts: number;
};

function wordIndexFromCaption(caption: string) {
  const words = caption.trim().match(/\S+/g);
  if (!words?.length) return -1;
  return words.length - 1;
}

type Exp7PracticePanelProps = {
  scene?: Exp7SceneCopy;
  /** When true, Join is disabled (other scenario is using the mic). */
  disabled?: boolean;
  /** Notify parent when this card leaves pure idle (connecting/live/analyzing/debrief). */
  onBusyChange?: (busy: boolean) => void;
  /** Fired when the learner reaches the debrief (session complete). */
  onDebriefReached?: () => void;
  /** Hide default idle practice card (session views provide their own brief). */
  omitIdle?: boolean;
  /** Start the voice session automatically when health is ready. */
  autoStart?: boolean;
  /** Notify parent of panel phase (for full-view live chrome). */
  onPhaseChange?: (phase: Exp7PanelPhase) => void;
  /** Hide the live progress bar (parent shows topic coverage instead). */
  hideLiveProgress?: boolean;
  /** Live topic coverage A→D — covered means it came up, not scored. */
  onTopicCoverageChange?: (coverage: Exp7TopicCoverage) => void;
};

export default function Exp7PracticePanel({
  scene = EXP7_SCENE,
  disabled = false,
  onBusyChange,
  onDebriefReached,
  omitIdle = false,
  autoStart = false,
  onPhaseChange,
  hideLiveProgress = false,
  onTopicCoverageChange,
}: Exp7PracticePanelProps) {
  const [phase, setPhase] = useState<Exp7PanelPhase>("idle");
  const [caption, setCaption] = useState("");
  const [fullLine, setFullLine] = useState("");
  const [speakerState, setSpeakerState] = useState<Exp7SpeakerState>("idle");
  const [debrief, setDebrief] = useState<Exp7DebriefResult | null>(null);
  const [healthStatus, setHealthStatus] = useState<Exp7HealthStatus>("checking");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [voiceActive, setVoiceActive] = useState(false);
  const [voiceConnected, setVoiceConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [ending, setEnding] = useState(false);
  const [conversationProgress, setConversationProgress] = useState(0);
  const [readyToEndCopy, setReadyToEndCopy] = useState<string | null>(null);
  const [topicCoverage, setTopicCoverage] = useState<Exp7TopicCoverage>(() =>
    emptyTopicCoverage(4),
  );
  /** Mirror of topicCoverage for event callbacks (judge verdicts arrive outside render). */
  const topicCoverageRef = useRef<Exp7TopicCoverage>(topicCoverage);
  const showBeatProgress = sceneUsesBeatProgress(scene.sceneId);
  const showLiveProgressBar = showBeatProgress && !hideLiveProgress;

  // Live coverage judge: hidden LLM verdicts on the existing Realtime session.
  // Stops once every objective is covered (nothing left to judge).
  const judgeInstructions = useMemo(
    () => (showBeatProgress ? buildCoverageJudgeInstructions(scene.sceneId) : null),
    [showBeatProgress, scene.sceneId],
  );
  const activeJudgeInstructions =
    judgeInstructions && topicCoverage.coveredCount < topicCoverage.total
      ? judgeInstructions
      : null;
  const handleCoverageVerdict = useCallback(
    (covered: boolean[]) => {
      const prev = topicCoverageRef.current;
      const next = mergeTopicCoverage(prev, {
        covered,
        coveredCount: covered.filter(Boolean).length,
        total: covered.length,
      });
      const newlyCovered = next.covered
        .map((v, i) => (v && !prev.covered[i] ? i + 1 : 0))
        .filter(Boolean);
      if (newlyCovered.length) {
        topicCoverageRef.current = next;
        setTopicCoverage(next);
        onTopicCoverageChange?.(next);
      }

      // Dev marker log — every verdict, flipped or not, lands in coverage.jsonl.
      const sid = sessionIdRef.current;
      if (sid) {
        const transcript = sessionSnapshotRef.current.transcript;
        const lastCharacterLine =
          [...transcript].reverse().find((t) => t.role === "character")?.text ?? "";
        void fetch(`/api/arena/exp7/sessions/${sid}/coverage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            verdict: covered,
            merged: next.covered,
            newlyCovered,
            transcriptLength: transcript.length,
            lastCharacterLine,
          }),
        }).catch(() => {});
      }
    },
    [onTopicCoverageChange],
  );
  const sessionIdRef = useRef<string | null>(null);
  const finishingRef = useRef(false);
  const pendingLearnerRef = useRef<string | null>(null);
  const learnerTurnCountRef = useRef(0);
  const openingCommittedRef = useRef(false);
  const commitChainRef = useRef<Promise<void>>(Promise.resolve());
  const deferredAlexRef = useRef<string | null>(null);
  const deferredAlexTimerRef = useRef<number | null>(null);
  const speakerStateRef = useRef<Exp7SpeakerState>("idle");
  const committedTurnsRef = useRef(0);
  const learnerCommittedThisTurnRef = useRef(false);
  const alexCaptionBufferRef = useRef("");
  const fullLineRef = useRef("");
  const commitBufferRef = useRef<BufferedCommit[]>([]);
  const commitFailuresRef = useRef<Error | null>(null);
  const voiceLevelsRef = useRef<number[]>([0, 0, 0, 0, 0]);
  const analyserReadyRef = useRef(false);
  const sessionSnapshotRef = useRef<Exp7SessionSnapshot>({
    transcript: [],
    movesLedger: [],
  });
  const alexPracticeRef = useRef<HTMLDivElement>(null);

  const scrollToAlexPractice = useCallback(() => {
    const target = alexPracticeRef.current;
    if (!target || typeof window === "undefined") return;

    const insetTop = 88;
    let scrollParent: HTMLElement | null = target.parentElement;
    while (scrollParent) {
      const { overflowY } = window.getComputedStyle(scrollParent);
      if (
        (overflowY === "auto" || overflowY === "scroll") &&
        scrollParent.scrollHeight > scrollParent.clientHeight
      ) {
        break;
      }
      scrollParent = scrollParent.parentElement;
    }

    if (scrollParent) {
      const top =
        target.getBoundingClientRect().top -
        scrollParent.getBoundingClientRect().top +
        scrollParent.scrollTop -
        insetTop;
      scrollParent.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
      return;
    }

    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const syncConversationProgress = useCallback(
    (progressPercent?: number, readyCopy?: string | null) => {
      if (!showBeatProgress) {
        setConversationProgress(0);
        setReadyToEndCopy(null);
        const empty = emptyTopicCoverage(4);
        topicCoverageRef.current = empty;
        setTopicCoverage(empty);
        onTopicCoverageChange?.(empty);
        return;
      }
      const local = computeBeatProgress(sessionSnapshotRef.current.transcript);
      if (typeof progressPercent === "number" && Number.isFinite(progressPercent)) {
        setConversationProgress((prev) => Math.max(prev, Math.min(100, Math.round(progressPercent))));
      } else {
        setConversationProgress((prev) => Math.max(prev, local.progressPercent));
      }
      setReadyToEndCopy(
        typeof readyCopy === "string" || readyCopy === null
          ? readyCopy
          : progressReadyToEndCopy(local),
      );
    },
    [showBeatProgress, onTopicCoverageChange],
  );

  const getSessionSnapshot = useCallback((): Exp7SessionSnapshot => {
    const snap = sessionSnapshotRef.current;
    return {
      transcript: [...snap.transcript],
      movesLedger: [...snap.movesLedger],
      sceneId: scene.sceneId,
      ...(snap.exp7Arc ? { exp7Arc: { ...snap.exp7Arc } } : {}),
    };
  }, [scene.sceneId]);

  const recordCommitSnapshot = useCallback(
    (learner: string, character: string, result?: Exp7CommitResponse) => {
      const snap = sessionSnapshotRef.current;
      const acceptedLearner = learner.trim();
      const acceptedCharacter = character.trim();
      if (acceptedLearner) {
        snap.transcript.push({ role: "learner", text: acceptedLearner });
        snap.movesLedger.push({
          turn: snap.movesLedger.length + 1,
          learner_quote: acceptedLearner,
        });
      }
      if (acceptedCharacter) {
        snap.transcript.push({
          role: "character",
          text: acceptedCharacter,
          speakerId: scene.characterId,
        });
      }
      if (result?.arc) {
        snap.exp7Arc = result.arc;
      }
      if (showBeatProgress) {
        const local = computeBeatProgress(snap.transcript);
        if (typeof result?.progress?.progressPercent === "number") {
          setConversationProgress((prev) =>
            Math.max(prev, Math.min(100, Math.round(result.progress!.progressPercent))),
          );
          setReadyToEndCopy(
            result.progress?.readyToEndCopy ?? progressReadyToEndCopy(local),
          );
        } else {
          setConversationProgress((prev) => Math.max(prev, local.progressPercent));
          setReadyToEndCopy(progressReadyToEndCopy(local));
        }
      }
    },
    [scene.characterId, showBeatProgress],
  );

  const rollbackSnapshot = useCallback((before: Exp7SessionSnapshot) => {
    sessionSnapshotRef.current = before;
  }, []);

  const optimisticBeforeCommit = useCallback(
    (learner: string, character: string) => {
      const before = getSessionSnapshot();
      recordCommitSnapshot(learner, character);
      return before;
    },
    [getSessionSnapshot, recordCommitSnapshot],
  );

  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  useEffect(() => {
    onBusyChange?.(phase !== "idle");
  }, [phase, onBusyChange]);

  useEffect(() => {
    speakerStateRef.current = speakerState;
  }, [speakerState]);

  const clearDeferredAlexTimer = () => {
    if (deferredAlexTimerRef.current) {
      window.clearTimeout(deferredAlexTimerRef.current);
      deferredAlexTimerRef.current = null;
    }
  };

  const clearDeferredAlex = () => {
    clearDeferredAlexTimer();
    deferredAlexRef.current = null;
  };

  const reportCommitError = useCallback((err: unknown, context: string) => {
    const message = parseExp7Error(err);
    console.error(`[exp7] ${context}:`, err);
    setError(`We couldn't save that turn — ${message}`);
  }, []);

  const enqueueCommit = useCallback(
    (task: () => Promise<void>) => {
      commitChainRef.current = commitChainRef.current
        .then(task)
        .catch((err) => {
          commitFailuresRef.current = err instanceof Error ? err : new Error(String(err));
          reportCommitError(err, "commit queue");
          throw commitFailuresRef.current;
        });
      return commitChainRef.current;
    },
    [reportCommitError],
  );

  const bufferFailedCommit = useCallback((sid: string, learner: string, character: string) => {
    commitBufferRef.current.push({ sid, learner, character, attempts: 0 });
  }, []);

  const flushCommitBuffer = useCallback(async (sid: string) => {
    const remaining: BufferedCommit[] = [];
    for (const item of commitBufferRef.current) {
      if (item.sid !== sid) {
        remaining.push(item);
        continue;
      }
      try {
        const before = optimisticBeforeCommit(item.learner, item.character);
        try {
          const result = await exp7CommitTurnWithRetry(
            sid,
            item.learner,
            item.character,
            getSessionSnapshot,
          );
          if (result.arc) {
            sessionSnapshotRef.current.exp7Arc = result.arc;
          }
          syncConversationProgress(
            result.progress?.progressPercent,
            result.progress?.readyToEndCopy,
          );
          committedTurnsRef.current += 1;
          console.info(`[exp7] buffered commit ok — total=${committedTurnsRef.current}`, {
            learner: item.learner.slice(0, 40),
            character: item.character.slice(0, 40),
          });
          if (item.learner) learnerTurnCountRef.current = result.turnCount;
        } catch (err) {
          rollbackSnapshot(before);
          throw err;
        }
      } catch (err) {
        item.attempts += 1;
        if (item.attempts < 3) remaining.push(item);
        else throw err;
      }
    }
    commitBufferRef.current = remaining;
  }, [getSessionSnapshot, optimisticBeforeCommit, rollbackSnapshot, syncConversationProgress]);

  const checkHealth = useCallback(() => {
    setHealthStatus("checking");
    return exp7Health()
      .then((h) => {
        const ready = Boolean(h.realtime_ready);
        setHealthStatus(ready ? "ready" : "unavailable");
      })
      .catch(() => {
        setHealthStatus("unavailable");
      });
  }, []);

  useEffect(() => {
    void checkHealth();
  }, [checkHealth]);

  useEffect(() => {
    onPhaseChange?.(phase);
  }, [phase, onPhaseChange]);

  useEffect(
    () => () => {
      clearDeferredAlex();
    },
    [],
  );

  const finishSceneRef = useRef<(sid: string | null) => Promise<void>>(async () => undefined);
  const autoStartedRef = useRef(false);

  const commitAlexLine = useCallback(
    async (sid: string, alexText: string, learner: string | null) => {
      const acceptedLearner = learner?.trim() || null;
      const learnerArg = acceptedLearner ?? "";
      const before = optimisticBeforeCommit(learnerArg, alexText);

      try {
        if (acceptedLearner) {
          const result = await exp7CommitTurnWithRetry(
            sid,
            acceptedLearner,
            alexText,
            getSessionSnapshot,
          );
          if (result.arc) {
            sessionSnapshotRef.current.exp7Arc = result.arc;
          }
          syncConversationProgress(
            result.progress?.progressPercent,
            result.progress?.readyToEndCopy,
          );
          openingCommittedRef.current = true;
          committedTurnsRef.current += 1;
          learnerTurnCountRef.current = result.turnCount;
          console.info(`[exp7] commit ok — total=${committedTurnsRef.current}`, {
            learner: acceptedLearner.slice(0, 40),
            character: alexText.slice(0, 40),
          });
          return;
        }

        const result = await exp7CommitTurnWithRetry(sid, "", alexText, getSessionSnapshot);
        if (result.arc) {
          sessionSnapshotRef.current.exp7Arc = result.arc;
        }
        syncConversationProgress(
          result.progress?.progressPercent,
          result.progress?.readyToEndCopy,
        );
        openingCommittedRef.current = true;
        committedTurnsRef.current += 1;
        learnerTurnCountRef.current = result.turnCount;
        console.info(
          `[exp7] ${openingCommittedRef.current ? "opening " : ""}commit ok — total=${committedTurnsRef.current}`,
          { character: alexText.slice(0, 80) },
        );
      } catch (err) {
        rollbackSnapshot(before);
        bufferFailedCommit(sid, learner ?? "", alexText);
        throw err;
      }
    },
    [
      bufferFailedCommit,
      getSessionSnapshot,
      optimisticBeforeCommit,
      rollbackSnapshot,
      syncConversationProgress,
    ],
  );

  const commitLearnerOnly = useCallback(
    async (sid: string, learner: string) => {
      const accepted = learner.trim();
      if (!accepted) return;

      const before = optimisticBeforeCommit(accepted, "");

      try {
        const result = await exp7CommitTurnWithRetry(sid, accepted, "", getSessionSnapshot);
        if (result.arc) {
          sessionSnapshotRef.current.exp7Arc = result.arc;
        }
        syncConversationProgress(
          result.progress?.progressPercent,
          result.progress?.readyToEndCopy,
        );
        committedTurnsRef.current += 1;
        learnerTurnCountRef.current = result.turnCount;
        console.info(`[exp7] learner commit ok — total=${committedTurnsRef.current}`, {
          learner: accepted.slice(0, 60),
        });
      } catch (err) {
        rollbackSnapshot(before);
        bufferFailedCommit(sid, accepted, "");
        throw err;
      }
    },
    [
      bufferFailedCommit,
      getSessionSnapshot,
      optimisticBeforeCommit,
      rollbackSnapshot,
      syncConversationProgress,
    ],
  );

  // finishScene — flush pending turns, then complete.
  const finishScene = useCallback(
    async (sid: string | null) => {
      if (finishingRef.current) return;
      if (!sid) {
        setError("Session lost — refresh and try again.");
        setPhase("idle");
        return;
      }
      clearDeferredAlex();
      pendingLearnerRef.current = null;
      finishingRef.current = true;
      setEnding(true);
      setSpeakerState("idle");
      setError(null);
      commitFailuresRef.current = null;

      try {
        const deferredAlex = deferredAlexRef.current;
        const pendingLearner = pendingLearnerRef.current;
        const alexFallback =
          deferredAlex ||
          alexCaptionBufferRef.current.trim() ||
          fullLineRef.current.trim();

        await enqueueCommit(async () => {
          if (deferredAlex) {
            const learner = pendingLearnerRef.current;
            pendingLearnerRef.current = null;
            await commitAlexLine(sid, deferredAlex, learner);
          } else if (pendingLearner) {
            await commitLearnerOnly(sid, pendingLearner);
          } else if (alexFallback && !openingCommittedRef.current) {
            await commitAlexLine(sid, alexFallback, null);
          }
        });

        await commitChainRef.current.catch(() => undefined);
        await flushCommitBuffer(sid);

        if (committedTurnsRef.current === 0) {
          throw new Error(
            "No conversation turns were saved. Wait for Alex to finish speaking, then try again — or refresh the page.",
          );
        }

        // Gate: need ≥4 learner turns AND ≥25 learner words before generating a report.
        // Check before disconnecting voice so the learner can keep talking.
        const content = assessReportContentSufficiency(getSessionSnapshot().transcript);
        if (!content.ok) {
          setError(EXP7_INSUFFICIENT_CONTENT_MESSAGE);
          setPhase("live");
          setSpeakerState("awaiting_user");
          return;
        }

        setPhase("analyzing");
        setVoiceActive(false);
        setVoiceConnected(false);

        const result = await exp7CompleteScene(sid, getSessionSnapshot());
        if (result._meta) {
          console.info("[exp7] debrief transcript meta", result._meta);
          if (result._meta.runDir) {
            console.info(
              `[exp7] run saved under b2c-ui-main/${result._meta.runDir}/ — see debrief.json, turns.jsonl, analyzer-input.txt`,
            );
          }
          if (result._meta.transcriptEntries === 0) {
            throw new Error(
              "Server received an empty transcript. Your conversation may not have been recorded — please retake.",
            );
          }
        }
        if (result._debug) {
          console.info("[exp7] debrief debug", {
            scoreAdjusted: result._debug.scoreAdjusted,
            scoreBeforeFloor: result._debug.scoreBeforeFloor,
            formattedTranscript: result._debug.formattedTranscript,
          });
        }
        setDebrief(mapCompleteToDebrief(result, EXP7_LESSON_HREF, result.lessonTitle || EXP7_LESSON_TITLE));
        setPhase("debrief");
        onDebriefReached?.();
      } catch (err) {
        setError(parseExp7Error(err));
        setPhase("idle");
      } finally {
        finishingRef.current = false;
        setEnding(false);
      }
    },
    [commitAlexLine, commitLearnerOnly, enqueueCommit, flushCommitBuffer, getSessionSnapshot, onDebriefReached],
  );

  finishSceneRef.current = finishScene;

  const resetSessionState = () => {
    clearDeferredAlex();
    pendingLearnerRef.current = null;
    learnerTurnCountRef.current = 0;
    openingCommittedRef.current = false;
    committedTurnsRef.current = 0;
    learnerCommittedThisTurnRef.current = false;
    alexCaptionBufferRef.current = "";
    fullLineRef.current = "";
    commitBufferRef.current = [];
    commitFailuresRef.current = null;
    commitChainRef.current = Promise.resolve();
    finishingRef.current = false;
    sessionSnapshotRef.current = { transcript: [], movesLedger: [] };
    const empty = emptyTopicCoverage(4);
    topicCoverageRef.current = empty;
    setTopicCoverage(empty);
    onTopicCoverageChange?.(empty);
  };

  const handleStart = async () => {
    unlockBrowserAudio();
    setError(null);
    setDebrief(null);
    setCaption("");
    setFullLine("");
    setConversationProgress(0);
    resetSessionState();
    setVoiceConnected(false);
    setSpeakerState("idle");
    setEnding(false);
    setStarting(true);
    setPhase("connecting");

    try {
      const session = await exp7StartSession(scene.sceneId);
      sessionIdRef.current = session.id;
      setSessionId(session.id);
      setVoiceActive(true);
    } catch (err) {
      setError(parseExp7Error(err));
      setVoiceActive(false);
      setSessionId(null);
      sessionIdRef.current = null;
      setPhase("idle");
    } finally {
      setStarting(false);
    }
  };

  useEffect(() => {
    if (!autoStart || autoStartedRef.current || disabled) return;
    if (healthStatus !== "ready" || phase !== "idle" || starting) return;
    autoStartedRef.current = true;
    void handleStart();
    // One-shot auto-start when health is ready; do not re-bind handleStart each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart, disabled, healthStatus, phase, starting]);

  const handleEndScene = () => {
    void finishSceneRef.current(sessionIdRef.current);
  };

  const handleRetake = () => {
    resetSessionState();
    setCaption("");
    setFullLine("");
    setSpeakerState("idle");
    setDebrief(null);
    setSessionId(null);
    sessionIdRef.current = null;
    setVoiceActive(false);
    setVoiceConnected(false);
    setEnding(false);
    setError(null);
    setConversationProgress(0);
    setPhase("idle");
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        scrollToAlexPractice();
      });
    });
  };

  const handleCharacterTranscriptDelta = useCallback((delta: string) => {
    // Buffer for commit fallback only — do not render on screen (voice-only UI).
    alexCaptionBufferRef.current += delta;
  }, []);

  const handleUserTranscriptDelta = useCallback((_delta: string) => {
    // User STT is not shown on Alex's card; commits use onUserUtterance.
  }, []);

  const handleUserUtterance = useCallback(
    (text: string) => {
      const accepted = text.trim();
      if (!accepted) {
        learnerCommittedThisTurnRef.current = false;
        return;
      }

      const sid = sessionIdRef.current;
      if (!sid) return;

      if (deferredAlexRef.current) {
        const alex = deferredAlexRef.current;
        clearDeferredAlex();
        void enqueueCommit(() => commitAlexLine(sid, alex, accepted));
        return;
      }

      pendingLearnerRef.current = accepted;
      if (!learnerCommittedThisTurnRef.current) {
        learnerCommittedThisTurnRef.current = true;
        void enqueueCommit(() => commitLearnerOnly(sid, accepted));
      }
    },
    [commitAlexLine, commitLearnerOnly, enqueueCommit],
  );

  const handleCharacterUtterance = useCallback(
    (text: string) => {
      const sid = sessionIdRef.current;
      if (!sid) {
        setError("Session lost — could not save the character line. Refresh and try again.");
        return;
      }

      alexCaptionBufferRef.current = text;
      fullLineRef.current = text;

      // Opening line must commit immediately — never defer.
      if (!openingCommittedRef.current) {
        pendingLearnerRef.current = null;
        clearDeferredAlex();
        void enqueueCommit(() => commitAlexLine(sid, text, null));
        return;
      }

      const learner = learnerCommittedThisTurnRef.current ? null : pendingLearnerRef.current;
      learnerCommittedThisTurnRef.current = false;
      pendingLearnerRef.current = null;

      if (
        !learner &&
        (speakerStateRef.current === "thinking" || speakerStateRef.current === "user_speaking")
      ) {
        clearDeferredAlexTimer();
        deferredAlexRef.current = text;
        deferredAlexTimerRef.current = window.setTimeout(() => {
          deferredAlexTimerRef.current = null;
          const deferred = deferredAlexRef.current;
          deferredAlexRef.current = null;
          if (!deferred || sessionIdRef.current !== sid) return;
          const lateLearner = pendingLearnerRef.current;
          pendingLearnerRef.current = null;
          void enqueueCommit(() => commitAlexLine(sid, deferred, lateLearner));
        }, LEARNER_STT_WAIT_MS);
        return;
      }

      clearDeferredAlex();
      void enqueueCommit(() => commitAlexLine(sid, text, learner));
    },
    [commitAlexLine, enqueueCommit],
  );

  const handleVoiceConnecting = useCallback(() => {
    setPhase("connecting");
    setVoiceConnected(false);
  }, []);

  const handleVoiceLive = useCallback(() => {
    setPhase("live");
    setVoiceConnected(true);
    setError(null);
  }, []);

  const handleVoiceError = useCallback((message: string) => {
    setVoiceActive(false);
    setVoiceConnected(false);
    setError(
      humanizeExp7Error(message) ||
        "Voice connection failed. Check microphone permission and try again.",
    );
    setPhase("idle");
  }, []);

  const handleAudioBlocked = useCallback(() => {
    setError("Browser blocked audio — click anytime on the page, then Start again.");
  }, []);

  if (phase === "debrief" && debrief) {
    return <Exp7Debrief result={debrief} onRetake={handleRetake} scene={scene} />;
  }

  const isConnecting = (phase === "connecting" || phase === "live") && !voiceConnected;

  const practiceId =
    scene.scenarioKey === "jordan" ? "exp7-jordan-practice" : "exp7-alex-practice";

  return (
    <div
      ref={alexPracticeRef}
      className={styles.practicePrimary}
      id={practiceId}
      data-scene={scene.sceneId}
    >
      <Exp7PracticeCardShell variant={phase === "analyzing" ? "analyzing" : "chapter"}>
        {phase === "analyzing" ? <Exp7PracticeAnalyzingCard /> : null}
        {phase === "live" || phase === "connecting" ? (
          <Exp7PracticeLiveCard
            scene={scene}
            connecting={isConnecting}
            speakerState={isConnecting ? "idle" : speakerState}
            ending={ending}
            onEndScene={handleEndScene}
            voiceLevelsRef={voiceLevelsRef}
            analyserReadyRef={analyserReadyRef}
            showProgress={showLiveProgressBar}
            progressPercent={conversationProgress}
            readyToEndCopy={readyToEndCopy}
          />
        ) : null}
        {phase === "idle" && !omitIdle ? (
          <Exp7PracticeIdleCard
            scene={scene}
            disabled={disabled}
            onStart={handleStart}
            onRetryHealth={() => {
              setError(null);
              void checkHealth();
            }}
            starting={starting}
            error={error}
            healthStatus={healthStatus}
          />
        ) : null}
        {phase === "idle" && omitIdle ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              minHeight: 240,
              color: "#71717a",
              fontSize: 14,
              fontFamily: "var(--main-font, Inter, sans-serif)",
            }}
          >
            {healthStatus === "unavailable" || error ? (
              <>
                <p style={{ margin: 0, textAlign: "center" }}>
                  {error || "Conversation isn’t available right now. Try again."}
                </p>
                <button
                  type="button"
                  className="ds-btn ds-btn--secondary ds-btn--sm"
                  onClick={() => {
                    autoStartedRef.current = false;
                    setError(null);
                    void checkHealth();
                  }}
                >
                  Try again
                </button>
              </>
            ) : (
              <>
                <span
                  style={{
                    width: 28,
                    height: 28,
                    border: "2.5px solid #e4e4e7",
                    borderTopColor: "#2183ed",
                    borderRadius: "50%",
                    animation: "exp7spin 0.7s linear infinite",
                  }}
                  aria-hidden
                />
                <p style={{ margin: 0 }}>
                  {starting || healthStatus === "checking"
                    ? "Connecting…"
                    : "Preparing conversation…"}
                </p>
                <style>{`@keyframes exp7spin { to { transform: rotate(360deg); } }`}</style>
              </>
            )}
          </div>
        ) : null}
        {error && phase !== "idle" ? (
          <p className={styles.voiceError} role="alert">
            {error}
          </p>
        ) : null}
        {voiceActive && sessionId ? (
          <Exp7RealtimeBridge
            sessionId={sessionId}
            active={voiceActive}
            sceneClosing={ending}
            onConnecting={handleVoiceConnecting}
            onLive={handleVoiceLive}
            onUserUtterance={handleUserUtterance}
            onCharacterUtterance={handleCharacterUtterance}
            onCharacterTranscriptDelta={handleCharacterTranscriptDelta}
            onUserTranscriptDelta={handleUserTranscriptDelta}
            onSpeakerStateChange={setSpeakerState}
            onError={handleVoiceError}
            onAudioBlocked={handleAudioBlocked}
            coverageJudgeInstructions={activeJudgeInstructions}
            onCoverageVerdict={handleCoverageVerdict}
            voiceLevelsRef={voiceLevelsRef}
            analyserReadyRef={analyserReadyRef}
          />
        ) : null}
      </Exp7PracticeCardShell>
    </div>
  );
}
