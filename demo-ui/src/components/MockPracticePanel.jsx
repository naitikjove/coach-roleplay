import { useEffect, useState } from "react";
import { EXP7_PRE, MOCK_DEBRIEF } from "../data/content";

/**
 * Stands in for Exp7PracticePanel — walks idle → live → analyzing → debrief
 * without OpenAI Realtime so developers can study shell layout changes.
 *
 * Production: b2c-ui-main/src/app/arena/exp7/Exp7PracticePanel.tsx
 */
export default function MockPracticePanel({ omitIdle, autoStart, onPhaseChange }) {
  const [phase, setPhase] = useState(omitIdle && autoStart ? "connecting" : "idle");
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    onPhaseChange?.(phase);
  }, [phase, onPhaseChange]);

  useEffect(() => {
    if (phase !== "connecting") return undefined;
    const t = window.setTimeout(() => setPhase("live"), 1200);
    return () => window.clearTimeout(t);
  }, [phase]);

  const endScene = () => {
    setPhase("analyzing");
    window.setTimeout(() => setPhase("debrief"), 1800);
  };

  if (phase === "idle") {
    return (
      <div className="liveMock">
        <p className="liveHint">Ready when you are.</p>
        <button
          type="button"
          className="ds-btn ds-btn--primary"
          onClick={() => setPhase("connecting")}
        >
          Join Conversation
        </button>
      </div>
    );
  }

  if (phase === "connecting" || phase === "live") {
    return (
      <div className="liveMock">
        {!imgFailed ? (
          <img
            className="liveAvatar"
            src={EXP7_PRE.characterAvatar}
            alt=""
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="liveAvatar" aria-hidden />
        )}
        <p className="liveName">{EXP7_PRE.characterName}</p>
        <p className="liveStatus">
          {phase === "connecting" ? "Connecting…" : "Speaking"}
        </p>
        <p className="liveHint">
          Mock voice stage. Production uses Exp7RealtimeBridge + OpenAI Realtime.
        </p>
        {phase === "live" ? (
          <button type="button" className="ds-btn ds-btn--primary" onClick={endScene}>
            End scene
          </button>
        ) : null}
      </div>
    );
  }

  if (phase === "analyzing") {
    return (
      <div className="liveMock">
        <p className="liveStatus">Working the magic…</p>
        <p className="liveHint">Production runs the Claire analyzer prompt here.</p>
      </div>
    );
  }

  return (
    <div className="debriefMock">
      <p className="type-overline">Roleplay</p>
      <h3 className="liveName">Your feedback</h3>
      <p className="debriefScore">
        {MOCK_DEBRIEF.score}
        <span>/10</span>
      </p>
      <span className="debriefPill">{MOCK_DEBRIEF.headlineLabel}</span>
      <p className="liveHint">{MOCK_DEBRIEF.summary}</p>
      <p className="type-overline" style={{ marginTop: 12 }}>
        What you did well
      </p>
      <ul className="debriefList">
        {MOCK_DEBRIEF.didWell.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      <p className="type-overline" style={{ marginTop: 12 }}>
        Key takeaways
      </p>
      <ul className="debriefList">
        {MOCK_DEBRIEF.keyTakeaways.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      <button
        type="button"
        className="ds-btn ds-btn--secondary"
        style={{ marginTop: 16 }}
        onClick={() => setPhase("idle")}
      >
        Retake (mock)
      </button>
    </div>
  );
}
