import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  EXP7_PRE,
  EXP7_PRE_ENTRY_PURPOSE,
  EXP7_PRE_POST_COMPETENCIES,
  EXP7_PRE_POST_SESSION_HREF,
  EXP7_PRE_TRANSITION,
  PRE_POST_TRANSITION_MS,
} from "../data/content";

/**
 * Mirrors PrePostEntryCard.tsx — chapter-slot meta card + 2s transition veil.
 */
export default function EntryCard() {
  const navigate = useNavigate();
  const [transitioning, setTransitioning] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  const go = useCallback(() => {
    if (transitioning) return;
    setTransitioning(true);
    window.setTimeout(() => {
      navigate(EXP7_PRE_POST_SESSION_HREF);
    }, PRE_POST_TRANSITION_MS);
  }, [navigate, transitioning]);

  return (
    <>
      <div className="metaCard" data-prepost-entry="comfortable">
        <div className="metaMain">
          <div className="metaIdentity">
            {!imgFailed ? (
              <img
                className="metaAvatarImg"
                src={EXP7_PRE.characterAvatar}
                alt=""
                onError={() => setImgFailed(true)}
              />
            ) : (
              <span className="metaAvatarFallback" aria-hidden>
                J
              </span>
            )}
            <div className="metaText">
              <h3 className="metaTitle">{EXP7_PRE.title}</h3>
              <p className="metaCharacter">
                <span className="metaCharName">{EXP7_PRE.characterName}</span>
                <span className="metaCharDot" aria-hidden>
                  ·
                </span>
                <span className="metaCharRole">{EXP7_PRE.characterRole}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            className={`ds-btn ds-btn--primary metaCta`}
            onClick={go}
            disabled={transitioning}
          >
            {transitioning ? "Opening…" : "Enter 1:1 Conversation"}
          </button>
        </div>

        <p className="metaPurpose">{EXP7_PRE_ENTRY_PURPOSE}</p>

        <div className="assessBlock">
          <p className="assessLabel">What you will be assessed on</p>
          <ul className="compRow">
            {EXP7_PRE_POST_COMPETENCIES.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>

        <p className="voiceSampleEntryLink">
          <Link to="/arena/exp7/pre-post/voices">Hear Claire voice samples</Link>
        </p>
      </div>

      {transitioning ? (
        <div className="transitionRoot" role="status" aria-live="polite">
          <div className="transitionCard">
            <p className="transitionTitle">{EXP7_PRE_TRANSITION.title}</p>
            <p className="transitionSub">{EXP7_PRE_TRANSITION.subtitle}</p>
            <div className="progressTrack">
              <div className="progressFill" />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
