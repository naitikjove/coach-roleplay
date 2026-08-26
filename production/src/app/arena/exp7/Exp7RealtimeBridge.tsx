"use client";

/**
 * WebRTC voice bridge — conversation handling ported from
 * arena/roleplay/packages/web/src/components/RealtimeSession.tsx
 */
import { useEffect, useRef, type MutableRefObject } from "react";
import { appendDirectorInstructions } from "@/lib/arena/exp7/actorSteering";
import { characterPlaybackTailMs } from "@/lib/arena/exp7/closingLine";
import {
  attachRemoteAudioMonitor,
  type RemoteAudioMonitor,
} from "@/lib/arena/exp7/remoteAudioMonitor";
import { attachMicBarMonitor, resetBarLevels, type VoiceBarMonitor } from "@/lib/arena/exp7/voiceBarLevels";
import { parseCoverageVerdict } from "@/lib/arena/exp7/coverageJudge";
import { exp7MintRealtimeToken } from "./exp7Api";
import {
  ensureAudioPlaying,
  extractCharacterTranscriptFromEvent,
  getMicrophoneStream,
  openRealtimeSession,
  type ActiveRealtimeSession,
} from "./exp7Realtime";
import type { Exp7SpeakerState } from "./exp7Types";

function setAnalyserReady(
  ref: MutableRefObject<boolean> | undefined,
  ready: boolean,
): void {
  if (ref) ref.current = ready;
}

type AlexTurnLifecycle = {
  responseDone: boolean;
  transcriptDone: boolean;
  line: string;
};

type Exp7RealtimeBridgeProps = {
  sessionId: string;
  active: boolean;
  sceneClosing?: boolean;
  handoffGate?: boolean;
  actorSteering?: string | null;
  steeringRev?: number;
  onConnecting?: () => void;
  onLive?: () => void;
  onUserUtterance: (text: string) => void;
  onCharacterUtterance: (text: string) => void;
  onCharacterTranscriptDelta?: (delta: string) => void;
  onUserTranscriptDelta?: (delta: string) => void;
  onSpeakerStateChange?: (state: Exp7SpeakerState) => void;
  onError?: (message: string) => void;
  onAudioBlocked?: () => void;
  /**
   * When set, a hidden out-of-band judge request fires after each character
   * turn (skipping the opener). Set to null to stop judging.
   */
  coverageJudgeInstructions?: string | null;
  /** Judge verdict per objective (stateless; caller merges monotonically). elapsedMs = request→verdict latency. */
  onCoverageVerdict?: (covered: boolean[], elapsedMs?: number) => void;
  /** Exp4-style reactive waveform bars (Alex + learner). */
  voiceLevelsRef?: MutableRefObject<number[]>;
  analyserReadyRef?: MutableRefObject<boolean>;
};

export default function Exp7RealtimeBridge({
  sessionId,
  active,
  sceneClosing = false,
  handoffGate = true,
  actorSteering = null,
  steeringRev = 0,
  onConnecting,
  onLive,
  onUserUtterance,
  onCharacterUtterance,
  onCharacterTranscriptDelta,
  onUserTranscriptDelta,
  onSpeakerStateChange,
  onError,
  onAudioBlocked,
  coverageJudgeInstructions = null,
  onCoverageVerdict,
  voiceLevelsRef,
  analyserReadyRef,
}: Exp7RealtimeBridgeProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sessionRef = useRef<ActiveRealtimeSession | null>(null);
  const micRef = useRef<MediaStream | null>(null);
  const characterBufferRef = useRef("");
  const userBufferRef = useRef("");
  const speakerStateRef = useRef<Exp7SpeakerState>("idle");
  const characterIsSpeakingRef = useRef(false);
  const openingResponseRef = useRef(false);
  const characterTranscriptDoneAtRef = useRef(0);
  const handoffTimerRef = useRef<number | null>(null);
  const handoffPendingRef = useRef(false);
  const characterTurnActiveRef = useRef(false);
  const alexInstructionsRef = useRef("");
  const sceneClosingRef = useRef(sceneClosing);
  const handoffGateRef = useRef(handoffGate);
  const coverageJudgeRef = useRef<string | null>(coverageJudgeInstructions);
  const characterResponseCountRef = useRef(0);
  const judgeRequestedAtRef = useRef(0);
  const alexTurnRef = useRef<AlexTurnLifecycle>({
    responseDone: false,
    transcriptDone: false,
    line: "",
  });
  const characterUtteranceEmittedRef = useRef(false);
  const audioMonitorRef = useRef<RemoteAudioMonitor | null>(null);
  const micBarMonitorRef = useRef<VoiceBarMonitor | null>(null);
  const waveformRafRef = useRef<number | null>(null);
  const handoffGenerationRef = useRef(0);
  const setSpeakerStateRef = useRef<(next: Exp7SpeakerState) => void>(() => undefined);
  const scheduleHandoffRef = useRef<(line: string) => void>(() => undefined);
  const clearHandoffRef = useRef<() => void>(() => undefined);

  sceneClosingRef.current = sceneClosing;
  handoffGateRef.current = handoffGate;
  coverageJudgeRef.current = coverageJudgeInstructions;

  const handlersRef = useRef({
    onConnecting,
    onLive,
    onUserUtterance,
    onCharacterUtterance,
    onCharacterTranscriptDelta,
    onUserTranscriptDelta,
    onSpeakerStateChange,
    onError,
    onAudioBlocked,
    onCoverageVerdict,
  });
  handlersRef.current = {
    onConnecting,
    onLive,
    onUserUtterance,
    onCharacterUtterance,
    onCharacterTranscriptDelta,
    onUserTranscriptDelta,
    onSpeakerStateChange,
    onError,
    onAudioBlocked,
    onCoverageVerdict,
  };

  useEffect(() => {
    if (sceneClosing) {
      clearHandoffRef.current();
      handoffPendingRef.current = false;
    }
  }, [sceneClosing]);

  useEffect(() => {
    if (!actorSteering || !sessionRef.current || !alexInstructionsRef.current) return;
    sessionRef.current.updateInstructions(
      appendDirectorInstructions(alexInstructionsRef.current, actorSteering),
    );
  }, [actorSteering, steeringRev]);

  useEffect(() => {
    if (!active || !sessionId) return;
    let cancelled = false;
    handlersRef.current.onConnecting?.();

    const stopWaveformLoop = () => {
      if (waveformRafRef.current !== null) {
        cancelAnimationFrame(waveformRafRef.current);
        waveformRafRef.current = null;
      }
      if (voiceLevelsRef?.current) resetBarLevels(voiceLevelsRef.current);
      setAnalyserReady(analyserReadyRef, false);
    };

    const startWaveformLoop = () => {
      stopWaveformLoop();
      const loop = () => {
        if (cancelled) return;
        const levels = voiceLevelsRef?.current;
        const state = speakerStateRef.current;
        if (levels) {
          if (state === "character_speaking" || state === "wrapping_up") {
            const remote = audioMonitorRef.current;
            if (remote) {
              remote.readBarLevels(levels);
              setAnalyserReady(analyserReadyRef, true);
            } else {
              resetBarLevels(levels);
              setAnalyserReady(analyserReadyRef, false);
            }
          } else if (state === "user_speaking") {
            const mic = micBarMonitorRef.current;
            if (mic) {
              mic.readBarLevels(levels);
              setAnalyserReady(analyserReadyRef, true);
            } else {
              resetBarLevels(levels);
              setAnalyserReady(analyserReadyRef, false);
            }
          } else {
            resetBarLevels(levels);
            setAnalyserReady(analyserReadyRef, false);
          }
        }
        waveformRafRef.current = requestAnimationFrame(loop);
      };
      waveformRafRef.current = requestAnimationFrame(loop);
    };

    const setSpeakerState = (next: Exp7SpeakerState) => {
      if (sceneClosingRef.current && next === "awaiting_user") return;
      if (next === "awaiting_user") {
        if (characterIsSpeakingRef.current || handoffPendingRef.current) return;
        if (speakerStateRef.current === "thinking") return;
      }
      if (speakerStateRef.current === next) return;
      speakerStateRef.current = next;
      handlersRef.current.onSpeakerStateChange?.(next);
    };
    setSpeakerStateRef.current = setSpeakerState;

    const clearHandoffTimer = () => {
      handoffGenerationRef.current += 1;
      if (handoffTimerRef.current) {
        window.clearTimeout(handoffTimerRef.current);
        handoffTimerRef.current = null;
      }
      handoffPendingRef.current = false;
    };
    clearHandoffRef.current = clearHandoffTimer;

    const handoffToUser = () => {
      if (sceneClosingRef.current) return;
      if (characterIsSpeakingRef.current || handoffPendingRef.current) return;
      setSpeakerState("awaiting_user");
    };

    const attachRemoteMonitor = () => {
      const audio = audioRef.current;
      if (!audio || audioMonitorRef.current) return;
      const stream = audio.srcObject;
      if (!(stream instanceof MediaStream) || !stream.getAudioTracks().length) return;
      const monitor = attachRemoteAudioMonitor(audio);
      if (monitor) audioMonitorRef.current = monitor;
    };

    const ensureAudioMonitor = attachRemoteMonitor;

    const scheduleHandoffAfterAlex = (line: string) => {
      if (sceneClosingRef.current) return;
      clearHandoffTimer();
      const generation = handoffGenerationRef.current;
      handoffPendingRef.current = true;

      const elapsed = characterTranscriptDoneAtRef.current
        ? Date.now() - characterTranscriptDoneAtRef.current
        : 0;
      const minDelay = characterPlaybackTailMs(line, elapsed);
      const started = Date.now();

      const finishHandoff = () => {
        if (cancelled || sceneClosingRef.current) return;
        if (generation !== handoffGenerationRef.current) return;
        if (characterIsSpeakingRef.current) {
          handoffTimerRef.current = window.setTimeout(finishHandoff, 200);
          return;
        }
        if (!handoffGateRef.current) {
          handoffTimerRef.current = window.setTimeout(finishHandoff, 150);
          return;
        }
        handoffPendingRef.current = false;
        characterIsSpeakingRef.current = false;
        handoffToUser();
      };

      const run = async () => {
        ensureAudioMonitor();
        const waitMs = Math.max(0, minDelay - (Date.now() - started));
        if (waitMs > 0) {
          await new Promise<void>((resolve) => {
            const timerGeneration = generation;
            handoffTimerRef.current = window.setTimeout(() => {
              if (timerGeneration !== handoffGenerationRef.current) {
                resolve();
                return;
              }
              handoffTimerRef.current = null;
              resolve();
            }, waitMs);
          });
        }
        if (cancelled || sceneClosingRef.current || generation !== handoffGenerationRef.current) {
          return;
        }

        const monitor = audioMonitorRef.current;
        if (monitor) {
          const speechStarted = await monitor.waitForSpeechStart({
            maxWaitMs: Math.max(4500, minDelay + 1500),
          });
          if (generation !== handoffGenerationRef.current) return;
          if (speechStarted) {
            await monitor.waitForSilence({
              minSilentMs: 650,
              maxWaitMs: Math.max(8000, minDelay + 4000),
            });
          }
        }
        if (generation !== handoffGenerationRef.current) return;
        finishHandoff();
      };

      void run();
    };
    scheduleHandoffRef.current = scheduleHandoffAfterAlex;

    const resetAlexTurn = () => {
      alexTurnRef.current = { responseDone: false, transcriptDone: false, line: "" };
      characterUtteranceEmittedRef.current = false;
    };

    const emitCharacterUtterance = (raw: string) => {
      const finalText = raw.trim();
      if (!finalText || characterUtteranceEmittedRef.current) return;
      characterUtteranceEmittedRef.current = true;
      alexTurnRef.current.transcriptDone = true;
      alexTurnRef.current.line = finalText;
      if (
        speakerStateRef.current === "thinking" ||
        speakerStateRef.current === "user_speaking" ||
        speakerStateRef.current === "awaiting_user"
      ) {
        setSpeakerState("character_speaking");
        characterIsSpeakingRef.current = true;
      }
      if (process.env.NODE_ENV !== "production") {
        console.info("[exp7] Alex utterance", finalText.slice(0, 80));
      }
      handlersRef.current.onCharacterUtterance(finalText);
    };

    const emitCharacterFromResponseDone = (event: { type: string; [key: string]: unknown }) => {
      if (characterUtteranceEmittedRef.current) return;
      const buffered = characterBufferRef.current.trim();
      const fromEvent = extractCharacterTranscriptFromEvent(event);
      const finalText = buffered || fromEvent || alexTurnRef.current.line.trim();
      characterBufferRef.current = "";
      if (!finalText) return;
      characterTranscriptDoneAtRef.current = Date.now();
      emitCharacterUtterance(finalText);
    };

    const tryScheduleHandoff = () => {
      const turn = alexTurnRef.current;
      if (!turn.responseDone || !turn.transcriptDone) return;
      if (!characterIsSpeakingRef.current) return;
      scheduleHandoffAfterAlex(turn.line);
    };

    let remoteUiSync: ReturnType<typeof setInterval> | undefined;

    (async () => {
      try {
        const token = await exp7MintRealtimeToken(sessionId);
        if (cancelled) return;
        alexInstructionsRef.current = token.instructions || "";
        const mic = await getMicrophoneStream();
        if (cancelled) {
          mic.getTracks().forEach((t) => t.stop());
          return;
        }
        micRef.current = mic;
        micBarMonitorRef.current?.dispose();
        micBarMonitorRef.current = attachMicBarMonitor(mic);
        startWaveformLoop();

        const audio = audioRef.current;
        if (!audio) throw new Error("Audio element not mounted");

        const session = await openRealtimeSession({
          clientSecret: token.clientSecret,
          model: token.model,
          audioElement: audio,
          micStream: mic,
          handlers: {
            onOpen: () => {
              if (cancelled) return;
              handlersRef.current.onLive?.();
              void ensureAudioPlaying(audio).then((ok) => {
                if (!ok) handlersRef.current.onAudioBlocked?.();
              });
              resetAlexTurn();
              characterResponseCountRef.current = 0;
              openingResponseRef.current = true;
              characterTurnActiveRef.current = true;
              setSpeakerState("character_speaking");
              characterIsSpeakingRef.current = true;
              session.triggerResponse();
            },
            onRemoteTrack: () => {
              if (cancelled) return;
              window.setTimeout(() => attachRemoteMonitor(), 50);
            },
            onUserSpeechStart: () => {
              if (sceneClosingRef.current) return;
              if (openingResponseRef.current) return;

              ensureAudioMonitor();
              // Speaker bleed — mic picks up Alex; keep Alex UI, not "You're speaking".
              if (audioMonitorRef.current?.isPlaying()) {
                return;
              }

              setSpeakerState("user_speaking");
              clearHandoffTimer();

              if (characterIsSpeakingRef.current || handoffPendingRef.current) {
                return;
              }

              characterTurnActiveRef.current = false;
              characterIsSpeakingRef.current = false;
              userBufferRef.current = "";
            },
            onUserSpeechStop: () => {
              if (sceneClosingRef.current) return;
              if (speakerStateRef.current === "user_speaking") {
                clearHandoffTimer();
                setSpeakerState("thinking");
              }
            },
            onUserTranscriptDelta: (delta) => {
              userBufferRef.current += delta;
              handlersRef.current.onUserTranscriptDelta?.(delta);
            },
            onUserTranscriptDone: (text) => {
              if (sceneClosingRef.current) return;
              const finalText = (text || userBufferRef.current).trim();
              userBufferRef.current = "";
              if (finalText) handlersRef.current.onUserUtterance(finalText);
            },
            onCharacterTranscriptDelta: (delta) => {
              openingResponseRef.current = false;
              if (!characterTurnActiveRef.current) {
                resetAlexTurn();
              }
              characterTurnActiveRef.current = true;
              clearHandoffTimer();
              characterIsSpeakingRef.current = true;
              handoffPendingRef.current = false;
              setSpeakerState("character_speaking");
              characterBufferRef.current += delta;
              alexTurnRef.current.line = characterBufferRef.current;
              handlersRef.current.onCharacterTranscriptDelta?.(delta);
            },
            onCharacterTranscriptDone: (full) => {
              openingResponseRef.current = false;
              const finalText = (full || characterBufferRef.current).trim();
              characterBufferRef.current = "";
              characterTranscriptDoneAtRef.current = Date.now();
              emitCharacterUtterance(finalText);
              tryScheduleHandoff();
            },
            onResponseDone: (event) => {
              openingResponseRef.current = false;
              alexTurnRef.current.responseDone = true;
              characterTurnActiveRef.current = false;
              // Always attempt emit on response.done — GA API may omit separate transcript.done.
              emitCharacterFromResponseDone(event);

              // Coverage judge: hidden out-of-band request once Claire's turn
              // has fully generated. Skip the opening line — nothing can be
              // covered before the learner has spoken.
              characterResponseCountRef.current += 1;
              const judgeInstructions = coverageJudgeRef.current;
              if (
                judgeInstructions &&
                !sceneClosingRef.current &&
                characterResponseCountRef.current >= 2
              ) {
                sessionRef.current?.requestJudgeResponse(judgeInstructions);
              }

              if (speakerStateRef.current === "user_speaking") return;
              tryScheduleHandoff();
            },
            onJudgeResponseDone: (text) => {
              if (cancelled) return;
              const verdict = parseCoverageVerdict(text);
              if (!verdict) {
                if (process.env.NODE_ENV !== "production") {
                  console.info("[exp7] coverage judge unparsable", text.slice(0, 120));
                }
                return;
              }
              if (process.env.NODE_ENV !== "production") {
                console.info("[exp7] coverage verdict", verdict.join(","));
              }
              handlersRef.current.onCoverageVerdict?.(verdict);
            },
            onError: (err) => {
              if (!cancelled) handlersRef.current.onError?.(err.message);
            },
            onClose: () => {
              if (!cancelled) setSpeakerState("idle");
            },
          },
        });

        if (cancelled) {
          session.close();
          mic.getTracks().forEach((t) => t.stop());
          return;
        }
        sessionRef.current = session;

        remoteUiSync = window.setInterval(() => {
          if (cancelled || sceneClosingRef.current) return;
          ensureAudioMonitor();
          const monitor = audioMonitorRef.current;
          if (!monitor) return;

          const alexAudible = monitor.isPlaying();
          if (alexAudible) {
            if (
              speakerStateRef.current !== "character_speaking" &&
              speakerStateRef.current !== "wrapping_up"
            ) {
              setSpeakerState("character_speaking");
            }
            return;
          }

          // Alex quiet — if UI stuck on user_speaking without recent VAD, allow handoff states.
          if (speakerStateRef.current === "user_speaking" && handoffPendingRef.current) {
            return;
          }
        }, 100);
      } catch (err) {
        if (!cancelled) {
          handlersRef.current.onError?.(err instanceof Error ? err.message : String(err));
        }
      }
    })();

    return () => {
      cancelled = true;
      stopWaveformLoop();
      if (remoteUiSync !== undefined) {
        window.clearInterval(remoteUiSync);
      }
      clearHandoffTimer();
      audioMonitorRef.current?.dispose();
      audioMonitorRef.current = null;
      micBarMonitorRef.current?.dispose();
      micBarMonitorRef.current = null;
      sessionRef.current?.close();
      sessionRef.current = null;
      micRef.current?.getTracks().forEach((t) => t.stop());
      micRef.current = null;
      speakerStateRef.current = "idle";
      characterIsSpeakingRef.current = false;
      openingResponseRef.current = false;
      characterTurnActiveRef.current = false;
      characterTranscriptDoneAtRef.current = 0;
      handoffPendingRef.current = false;
    };
  }, [active, sessionId]);

  return (
    <audio
      ref={audioRef}
      autoPlay
      playsInline
      style={{
        position: "fixed",
        left: 0,
        bottom: 0,
        width: 1,
        height: 1,
        opacity: 0,
        pointerEvents: "none",
      }}
      aria-hidden
    />
  );
}
