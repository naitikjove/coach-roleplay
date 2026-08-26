import { useCallback, useState } from "react";
import MockPracticePanel from "../components/MockPracticePanel";
import {
  EXP7_PRE,
  EXP7_PRE_POST_SESSION_BREADCRUMB,
} from "../data/content";
import MockCoachShell from "../shell/MockCoachShell";

/**
 * Mirrors /arena/exp7/pre-post/session — PrePostSessionClient.tsx
 *
 * Layout rules:
 * - brief: About + Objectives | Who + Join
 * - live: same left column + live stage; "Live conversation" pill
 * - analyzing / debrief: full-shell (no left briefing column)
 */
export default function SessionPage() {
  const [mode, setMode] = useState("brief");
  const [panelPhase, setPanelPhase] = useState("idle");
  const [imgFailed, setImgFailed] = useState(false);

  const startLive = useCallback(() => setMode("live"), []);

  const isLiveActive =
    mode === "live" && panelPhase !== "idle" && panelPhase !== "debrief";

  const reportFullShell =
    mode === "live" &&
    (panelPhase === "debrief" || panelPhase === "analyzing");

  return (
    <MockCoachShell
      mode="session"
      breadcrumbItems={[...EXP7_PRE_POST_SESSION_BREADCRUMB]}
    >
      <div className="sessionRoot">
        <div className="sessionPage">
          <div className="sessionFrame">
            {isLiveActive ? (
              <div className="sessionLiveStatus" role="status">
                <span className="livePill">Live conversation</span>
              </div>
            ) : null}

            <div
              className={[
                "shell",
                mode === "live" ? "shellLive" : "",
                reportFullShell ? "shellReport" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {!reportFullShell ? (
                <>
                  <div className="shellCol">
                    <div className="colBody">
                      <h2 className="pageTitle">{EXP7_PRE.title}</h2>

                      <section className="block">
                        <h3 className={`type-overline blockLabel`}>
                          What this conversation is about
                        </h3>
                        <ol className="aboutList">
                          {EXP7_PRE.about.map((point, i) => (
                            <li key={i}>{point}</li>
                          ))}
                        </ol>
                      </section>

                      <section className="block">
                        <h3 className={`type-overline blockLabel`}>Objectives</h3>
                        <ol className="objectives">
                          {EXP7_PRE.objectives.map((obj, i) => (
                            <li key={i}>
                              <span className="objectivesNum" aria-hidden>
                                {i + 1}
                              </span>
                              <span>{obj}</span>
                            </li>
                          ))}
                        </ol>
                      </section>
                    </div>
                  </div>

                  <div className="shellDivider" aria-hidden />
                </>
              ) : null}

              <div
                className={`shellCol shellColEnd ${
                  reportFullShell ? "shellColFull" : ""
                }`}
              >
                {mode === "brief" ? (
                  <>
                    <div className="colBody">
                      <h3 className={`type-overline blockLabel`}>
                        Who&apos;s in this 1:1
                      </h3>
                      <div className="whoStack">
                        <div className="whoRow">
                          <span className="whoMark" aria-hidden>
                            Me
                          </span>
                          <div className="whoText">
                            <p className="whoName">{EXP7_PRE.whoYou.name}</p>
                            <p className={`type-body-sm whoRole`}>
                              {EXP7_PRE.whoYou.role}
                            </p>
                            <p className="whoCopy">{EXP7_PRE.whoYou.body}</p>
                          </div>
                        </div>
                        <div className="whoRow">
                          {!imgFailed ? (
                            <img
                              className="whoAvatar"
                              src={EXP7_PRE.characterAvatar}
                              alt=""
                              onError={() => setImgFailed(true)}
                            />
                          ) : (
                            <span className="whoMark" aria-hidden>
                              {EXP7_PRE.whoThem.name.slice(0, 1)}
                            </span>
                          )}
                          <div className="whoText">
                            <p className="whoName">{EXP7_PRE.whoThem.name}</p>
                            <p className={`type-body-sm whoRole`}>
                              {EXP7_PRE.whoThem.role}
                            </p>
                            <p className="whoCopy">{EXP7_PRE.whoThem.body}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="colFooter">
                      <p className={`type-caption railHint`}>
                        {EXP7_PRE.scene.formatNote}
                      </p>
                      <button
                        type="button"
                        className={`ds-btn ds-btn--primary railCta`}
                        onClick={startLive}
                      >
                        Join Conversation
                      </button>
                    </div>
                  </>
                ) : (
                  <div
                    className={`stageInner ${
                      reportFullShell ? "stageInnerFull" : ""
                    } ${
                      panelPhase === "analyzing" ? "stageInnerAnalyzing" : ""
                    }`}
                  >
                    <MockPracticePanel
                      omitIdle
                      autoStart
                      onPhaseChange={setPanelPhase}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MockCoachShell>
  );
}
