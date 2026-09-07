"use client";

import React, { useId, useMemo, useState } from "react";
import Image from "next/image";
import Exp4SpeakerAvatar from "../exp4/Exp4SpeakerAvatar";
import {
  EXP7_DEBRIEF,
  EXP7_SCENE,
  isJordanScene,
  isRoleplayScene,
  type Exp7SceneCopy,
} from "./constants";
import {
  EXP7_POST_FEEDBACK_PHASE_LINE,
  EXP7_PRE_FEEDBACK_PHASE_LINE,
} from "./pre-post/constants";
import type {
  Exp7CompetencyScore,
  Exp7DebriefEvidenceItem,
  Exp7DebriefResult,
} from "./exp7Types";
import Exp7CompetencyRadar from "./Exp7CompetencyRadar";
import Exp7PracticeCardShell from "./Exp7PracticeCardShell";
import styles from "./exp7PracticeCard.module.css";
import { truncateQuote } from "@/lib/arena/exp7/debriefEvidence";

function roleplayFeedbackPhaseLine(scene: Exp7SceneCopy): string {
  const id = String(scene.characterId ?? "").toLowerCase();
  const key = String(scene.scenarioKey ?? "").toLowerCase();
  if (id === "sam" || key.includes("sam") || key.includes("post")) {
    return EXP7_POST_FEEDBACK_PHASE_LINE;
  }
  return EXP7_PRE_FEEDBACK_PHASE_LINE;
}

type Exp7DebriefProps = {
  result: Exp7DebriefResult;
  onRetake: () => void;
  scene?: Exp7SceneCopy;
};

function statusClass(headline: Exp7DebriefResult["headline"]) {
  if (headline === "nailed_it") return styles.statusGood;
  if (headline === "try_again") return styles.statusRetry;
  return styles.statusSolid;
}

function scoreClass(score: number) {
  if (score >= 8) return styles.scoreGood;
  if (score <= 4) return styles.scoreRetry;
  return styles.scoreSolid;
}

function levelLabel(level: Exp7CompetencyScore["level"]): string {
  if (level === "strong") return "Strong";
  if (level === "adequate") return "Adequate";
  if (level === "developing") return "Developing";
  if (level === "needs_work") return "Needs work";
  return "Not observed";
}

/** Prefer authoritative rollup: round((sum ÷ max) × 10). score is already that when present. */
function overallScoreOutOfTen(result: Exp7DebriefResult): number {
  const max =
    typeof result.maxScore === "number" && result.maxScore > 0
      ? result.maxScore
      : 40;
  if (typeof result.sumScore === "number" && Number.isFinite(result.sumScore)) {
    return Math.min(
      10,
      Math.max(0, Math.round((result.sumScore / max) * 10)),
    );
  }
  if (typeof result.score === "number" && Number.isFinite(result.score)) {
    return Math.min(10, Math.max(0, Math.round(result.score)));
  }
  if (typeof result.percent === "number" && Number.isFinite(result.percent)) {
    return Math.min(10, Math.max(0, Math.round((result.percent / 100) * 10)));
  }
  return 0;
}

function PointerList({
  title,
  items,
  variant,
}: {
  title: string;
  items: string[];
  variant: "strengths" | "takeaways";
}) {
  if (!items.length) return null;

  return (
    <section
      className={`${styles.debriefSection} ${
        variant === "strengths" ? styles.debriefSectionStrengths : styles.debriefSectionTakeaways
      }`}
    >
      <h4 className={styles.debriefSectionTitle}>{title}</h4>
      <ul className={styles.debriefPointerList}>
        {items.map((text, index) => (
          <li key={`${variant}-${text.slice(0, 40)}-${index}`} className={styles.debriefPointerItem}>
            {text}
          </li>
        ))}
      </ul>
    </section>
  );
}

function TranscriptImprovementCard({ item }: { item: Exp7DebriefEvidenceItem }) {
  const quote = item.learnerQuote.trim();
  const displayQuote = quote ? truncateQuote(quote) : "";
  const suggested = item.suggestedLine?.trim() || "";

  if (!displayQuote && !suggested) return null;

  return (
    <article className={`${styles.debriefEvidenceCard} ${styles.debriefEvidenceCardImprovements}`}>
      {item.note.trim() ? <p className={styles.debriefEvidenceNote}>{item.note.trim()}</p> : null}

      {displayQuote ? (
        <blockquote className={styles.debriefQuoteYouSaid}>
          <span className={styles.debriefQuoteLabel}>You said</span>
          <p
            className={styles.debriefQuoteText}
            title={quote.length > displayQuote.length ? quote : undefined}
          >
            &ldquo;{displayQuote}&rdquo;
          </p>
        </blockquote>
      ) : null}

      {suggested ? (
        <blockquote className={styles.debriefQuoteTryInstead}>
          <span className={styles.debriefQuoteLabel}>Try instead</span>
          <p className={styles.debriefQuoteText}>&ldquo;{suggested}&rdquo;</p>
        </blockquote>
      ) : null}
    </article>
  );
}

function YouSaidTryInstead({
  youSaid,
  tryInstead,
}: {
  youSaid?: string;
  tryInstead?: string;
}) {
  const quote = (youSaid || "").trim();
  const displayQuote = quote ? truncateQuote(quote) : "";
  const suggested = (tryInstead || "").trim();
  if (!displayQuote && !suggested) return null;

  return (
    <div className={styles.skillAccordionQuotes}>
      {displayQuote ? (
        <blockquote className={styles.debriefQuoteYouSaid}>
          <span className={styles.debriefQuoteLabel}>You said</span>
          <p
            className={styles.debriefQuoteText}
            title={quote.length > displayQuote.length ? quote : undefined}
          >
            &ldquo;{displayQuote}&rdquo;
          </p>
        </blockquote>
      ) : null}
      {suggested ? (
        <blockquote className={styles.debriefQuoteTryInstead}>
          <span className={styles.debriefQuoteLabel}>Try instead</span>
          <p className={styles.debriefQuoteText}>&ldquo;{suggested}&rdquo;</p>
        </blockquote>
      ) : null}
    </div>
  );
}

function ScoreRing({ score, toneClass }: { score: number; toneClass: string }) {
  const gradId = useId().replace(/:/g, "");
  const size = 108;
  const stroke = 9;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.min(10, Math.max(0, score));
  const offset = c * (1 - clamped / 10);

  return (
    <div className={`${styles.scoreRing} ${toneClass}`} aria-label={`Overall score ${clamped} out of 10`}>
      <svg className={styles.scoreRingSvg} width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.65" />
          </linearGradient>
        </defs>
        <circle
          className={styles.scoreRingTrack}
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          className={styles.scoreRingValue}
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className={styles.scoreRingLabel}>
        <span className={styles.scoreRingNumRow}>
          <span className={styles.scoreRingNum}>{clamped}</span>
          <span className={styles.scoreRingDenom}>/10</span>
        </span>
      </div>
    </div>
  );
}

function FocusSkillCard({
  skill,
  lessonHref,
  onSeeExamples,
}: {
  skill: Exp7CompetencyScore;
  lessonHref: string;
  onSeeExamples: () => void;
}) {
  const scoreText =
    skill.level === "not_observed" || skill.score == null ? "—" : `${skill.score}/10`;

  return (
    <article className={styles.focusCard} aria-label="Focus for the course">
      <p className={styles.focusEyebrow}>Focus for the course</p>
      <div className={styles.focusHead}>
        <h4 className={styles.focusSkillName}>{skill.name}</h4>
        <span className={styles.focusScore}>{scoreText}</span>
      </div>
      {skill.note?.trim() ? <p className={styles.focusNote}>{skill.note.trim()}</p> : null}
      <div className={styles.focusActions}>
        <MicrocourseLink
          href={lessonHref}
          className={`ds-btn ds-btn--primary ${styles.focusPrimaryCta}`}
        >
          Start micro-course
        </MicrocourseLink>
        <button type="button" className={styles.focusLinkBtn} onClick={onSeeExamples}>
          See examples from the conversation
        </button>
      </div>
    </article>
  );
}

function SkillAccordion({
  competencies,
  focusSkillId,
  openId,
  onToggle,
}: {
  competencies: Exp7CompetencyScore[];
  focusSkillId?: string;
  openId: string | null;
  onToggle: (id: string) => void;
}) {
  return (
    <ul className={styles.skillAccordion} aria-label="Individual ratings">
      {competencies.map((c) => {
        const isOpen = openId === c.id;
        const isFocus = focusSkillId === c.id;
        const scoreText =
          c.level === "not_observed" || c.score == null ? "—" : `${c.score}/10`;
        const youSaid = c.youSaid || c.learnerQuote || "";
        const tryInstead = c.tryInstead || "";
        const levelClass =
          styles[`competency_${c.level}` as keyof typeof styles] || styles.competency_adequate;

        return (
          <li
            key={c.id}
            id={`skill-${c.id}`}
            className={`${styles.skillAccordionItem} ${levelClass} ${
              isFocus ? styles.skillAccordionFocus : ""
            }`}
          >
            <button
              type="button"
              className={styles.skillAccordionHead}
              aria-expanded={isOpen}
              onClick={() => onToggle(c.id)}
            >
              <span
                className={`${styles.skillAccordionScoreBubble} ${styles[`scoreBubble_${c.level}`] || ""}`}
                aria-hidden
              >
                {scoreText}
              </span>
              <span className={styles.skillAccordionMeta}>
                <span className={styles.skillAccordionName}>
                  {c.name}
                  {isFocus ? <span className={styles.focusPill}>Focus</span> : null}
                </span>
                <span className={styles.skillAccordionLevel}>{levelLabel(c.level)}</span>
                {c.note?.trim() ? (
                  <span className={styles.skillAccordionNote}>{c.note.trim()}</span>
                ) : null}
              </span>
              <span className={styles.skillAccordionChevron} aria-hidden>
                {isOpen ? "▴" : "▾"}
              </span>
            </button>
            {isOpen ? (
              <div className={styles.skillAccordionBody}>
                <YouSaidTryInstead youSaid={youSaid} tryInstead={tryInstead} />
                {!youSaid.trim() && !tryInstead.trim() ? (
                  <p className={styles.skillAccordionEmpty}>
                    {c.level === "not_observed"
                      ? "This part of the conversation did not come up."
                      : "No conversation examples for this skill."}
                  </p>
                ) : null}
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

function deriveDebriefCopy(result: Exp7DebriefResult) {
  const didWell = Array.isArray(result.didWell) ? result.didWell : [];
  const keyTakeaways = Array.isArray(result.keyTakeaways) ? result.keyTakeaways : [];
  const strengthsList = Array.isArray(result.strengths) ? result.strengths : [];
  const improvementsList = Array.isArray(result.improvements) ? result.improvements : [];
  const transcriptList = Array.isArray(result.transcriptImprovements)
    ? result.transcriptImprovements
    : [];

  const strengths = (didWell.length
    ? didWell.map((s) => String(s).trim()).filter(Boolean)
    : strengthsList.map((s) => s.note.trim()).filter(Boolean)
  ).slice(0, 4);

  const takeaways = (keyTakeaways.length
    ? keyTakeaways.map((s) => String(s).trim()).filter(Boolean)
    : improvementsList.map((i) => i.note.trim()).filter(Boolean)
  ).slice(0, 4);

  const fromTranscript = (
    transcriptList.length
      ? transcriptList
      : improvementsList.filter(
          (i) => i.learnerQuote?.trim() || Boolean(i.suggestedLine?.trim()),
        )
  ).slice(0, 4);

  return { strengths, takeaways, fromTranscript };
}

function MicrocourseLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const external = /^https?:\/\//i.test(href);
  return (
    <a
      href={href}
      className={className}
      {...(external
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
    >
      {children}
    </a>
  );
}

function LessonFooter({
  result,
  videoHint,
  onRetake,
}: {
  result: Exp7DebriefResult;
  videoHint: string;
  onRetake: () => void;
}) {
  return (
    <>
      <section className={styles.lessonRecommend} aria-label="Up next">
        <h4 className={styles.lessonRecommendTitle}>Up next</h4>
        <p className={styles.lessonRecommendHint}>{videoHint}</p>
        <MicrocourseLink href={result.lessonHref} className={styles.lessonCard}>
          <span className={styles.lessonThumb}>
            <Image
              src={result.lessonThumbnail}
              alt=""
              className={styles.lessonThumbImage}
              fill
              sizes="120px"
            />
            <span className={styles.lessonPlay} aria-hidden="true">
              ▶
            </span>
            <span className={styles.lessonDuration}>{result.lessonDuration}</span>
          </span>
          <span className={styles.lessonMeta}>
            <span className={styles.lessonTitle}>{result.lessonTitle}</span>
            <span className={styles.lessonWatchLabel}>Start micro-course</span>
          </span>
        </MicrocourseLink>
      </section>

      <div className={styles.ctaRow}>
        <MicrocourseLink
          href={result.lessonHref}
          className={`ds-btn ds-btn--secondary ${styles.secondaryCta}`}
        >
          Start micro-course
        </MicrocourseLink>
        <button
          type="button"
          className={`ds-btn ds-btn--primary ${styles.primaryCta}`}
          onClick={onRetake}
        >
          Retake
        </button>
      </div>
    </>
  );
}

/** Figma-aligned debrief for Claire PRE / multi-skill roleplay (v2/v3 analyzer). */
function RoleplayDebrief({
  result,
  onRetake,
  scene,
  characterName,
  videoHint,
}: {
  result: Exp7DebriefResult;
  onRetake: () => void;
  scene: Exp7SceneCopy;
  characterName: string;
  videoHint: string;
}) {
  const competencies = Array.isArray(result.competencies) ? result.competencies : [];
  const focus =
    competencies.find((c) => c.id === result.focusSkill) ||
    competencies.find((c) => c.level !== "not_observed") ||
    competencies[0];
  const [openId, setOpenId] = useState<string | null>(focus?.id ?? null);
  const overall = overallScoreOutOfTen(result);
  const tone = scoreClass(overall);
  const feedbackTitle = scene.headline?.trim() || "Your feedback";
  const phaseLine = roleplayFeedbackPhaseLine(scene);

  const scrollToExamples = () => {
    if (!focus) return;
    setOpenId(focus.id);
    requestAnimationFrame(() => {
      document.getElementById(`skill-${focus.id}`)?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    });
  };

  return (
    <Exp7PracticeCardShell variant="feedback">
      <div className={styles.overlineRow}>
        <span className={styles.overlineDot} aria-hidden />
        <p className={styles.overline}>Practice Roleplay Feedback</p>
      </div>

      <div className={styles.debriefIntroBlock}>
        <h3 className={styles.debriefIntroTitle}>{feedbackTitle}</h3>
        <p className={styles.debriefPhaseLine}>{phaseLine}</p>
      </div>

      <div className={styles.characterRow}>
        <Exp4SpeakerAvatar
          src={scene.characterAvatar}
          label={scene.characterName || characterName}
          variant="character"
        />
        <div className={styles.characterMeta}>
          <span className={styles.characterName}>{scene.characterName || characterName}</span>
          <span className={styles.characterRole}>{scene.characterRole}</span>
        </div>
      </div>

      {result.evaluationFailed ? (
        <div className={styles.debriefEvalFailed} role="alert">
          <span className={`${styles.statusPill} ${styles.statusRetry}`}>Scoring unavailable</span>
          <p className={styles.debriefEvalFailedBody}>
            {result.summary?.trim() ||
              "We could not grade this conversation. Please retake to get your report."}
          </p>
        </div>
      ) : (
        <>
          {result.summary?.trim() ? (
            <section className={styles.summaryBlock} aria-label="Conversation summary">
              <h4 className={styles.debriefSectionTitle}>Conversation summary</h4>
              <p className={styles.debriefSummary}>{result.summary.trim()}</p>
            </section>
          ) : null}

          <div className={styles.focusScoreRow}>
            {focus ? (
              <FocusSkillCard
                skill={focus}
                lessonHref={result.lessonHref}
                onSeeExamples={scrollToExamples}
              />
            ) : null}
            <div className={styles.overallScoreCard}>
              <p className={styles.overallScoreEyebrow}>Overall score</p>
              <ScoreRing score={overall} toneClass={tone} />
            </div>
          </div>

          {competencies.length ? (
            <section className={styles.skillsOverview} aria-label="Skills overview">
              <h4 className={styles.debriefSectionTitle}>Skills overview</h4>
              <div className={styles.skillsOverviewGrid}>
                <Exp7CompetencyRadar competencies={competencies} />
                <div className={styles.ratingsColumn}>
                  <h5 className={styles.ratingsTitle}>Individual ratings</h5>
                  <SkillAccordion
                    competencies={competencies}
                    focusSkillId={focus?.id}
                    openId={openId}
                    onToggle={(id) => setOpenId((cur) => (cur === id ? null : id))}
                  />
                </div>
              </div>
            </section>
          ) : null}
        </>
      )}

      <LessonFooter result={result} videoHint={videoHint} onRetake={onRetake} />
    </Exp7PracticeCardShell>
  );
}

/** Legacy Alex single-skill debrief (didWell / takeaways / transcript improvements). */
function LegacyDebrief({
  result,
  onRetake,
  scene,
  overline,
  reportTitle,
  reportIntro,
  videoHint,
}: {
  result: Exp7DebriefResult;
  onRetake: () => void;
  scene: Exp7SceneCopy;
  overline: string;
  reportTitle: string;
  reportIntro: string;
  videoHint: string;
}) {
  const { strengths, takeaways, fromTranscript } = useMemo(
    () => deriveDebriefCopy(result),
    [result],
  );

  return (
    <Exp7PracticeCardShell variant="feedback">
      <div className={styles.overlineRow}>
        <span className={styles.overlineDot} aria-hidden />
        <p className={styles.overline}>{overline}</p>
      </div>

      <div className={styles.debriefIntroBlock}>
        <h3 className={styles.title}>{reportTitle}</h3>
        <p className={styles.body}>{reportIntro}</p>
      </div>

      <div className={styles.characterRow}>
        <Exp4SpeakerAvatar
          src={scene.characterAvatar}
          label={scene.characterName}
          variant="character"
        />
        <div className={styles.characterMeta}>
          <span className={styles.characterName}>{scene.characterName}</span>
          <span className={styles.characterRole}>{scene.characterRole}</span>
        </div>
      </div>

      <div className={styles.debriefHeader}>
        {result.evaluationFailed ? (
          <div className={styles.debriefEvalFailed} role="alert">
            <span className={`${styles.statusPill} ${styles.statusRetry}`}>
              Scoring unavailable
            </span>
            <p className={styles.debriefEvalFailedBody}>
              {result.summary?.trim() ||
                "We could not grade this conversation. Please retake to get your report."}
            </p>
          </div>
        ) : (
          <>
            <div
              className={`${styles.scoreBadge} ${scoreClass(
                typeof result.percent === "number"
                  ? Math.round(result.percent / 10)
                  : result.score,
              )}`}
            >
              {typeof result.percent === "number" ? (
                <>
                  <span className={styles.scoreValue}>{result.percent}</span>
                  <span className={styles.scoreDenom}>%</span>
                </>
              ) : (
                <>
                  <span className={styles.scoreValue}>{result.score}</span>
                  <span className={styles.scoreDenom}>/10</span>
                </>
              )}
            </div>
            <div className={styles.debriefHeaderMeta}>
              <span className={`${styles.statusPill} ${statusClass(result.headline)}`}>
                {result.headlineLabel}
              </span>
            </div>
          </>
        )}
      </div>

      {!result.evaluationFailed && result.summary?.trim() ? (
        <p className={styles.debriefSummary}>{result.summary.trim()}</p>
      ) : null}

      {!result.evaluationFailed &&
      Array.isArray(result.competencies) &&
      result.competencies.length ? (
        <section className={styles.competencySection} aria-label="Skills snapshot">
          <h4 className={styles.debriefSectionTitle}>Skills snapshot</h4>
          <div className={styles.competencyLayoutCentered}>
            <Exp7CompetencyRadar competencies={result.competencies} />
          </div>
        </section>
      ) : null}

      {!result.evaluationFailed ? (
        <div className={styles.debriefSections}>
          {(typeof result.percent === "number" ? result.percent >= 40 : result.score > 3) ? (
            <PointerList title="What you did well" items={strengths} variant="strengths" />
          ) : null}
          <PointerList title="Key takeaways" items={takeaways} variant="takeaways" />

          {fromTranscript.length ? (
            <section
              className={`${styles.debriefSection} ${styles.debriefSectionImprovements}`}
              aria-label="Improvements from your transcripts"
            >
              <h4 className={styles.debriefSectionTitle}>Improvements from your transcripts</h4>
              <div className={styles.debriefEvidenceList}>
                {fromTranscript.map((item, index) => (
                  <TranscriptImprovementCard
                    key={`transcript-${item.note.slice(0, 40)}-${index}`}
                    item={item}
                  />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      ) : null}

      <section className={styles.lessonRecommend} aria-label={EXP7_DEBRIEF.videoSectionTitle}>
        <h4 className={styles.lessonRecommendTitle}>{EXP7_DEBRIEF.videoSectionTitle}</h4>
        <p className={styles.lessonRecommendHint}>{videoHint}</p>
        <a href={result.lessonHref} className={styles.lessonCard}>
          <span className={styles.lessonThumb}>
            <Image
              src={result.lessonThumbnail}
              alt=""
              className={styles.lessonThumbImage}
              fill
              sizes="120px"
            />
            <span className={styles.lessonPlay} aria-hidden="true">
              ▶
            </span>
            <span className={styles.lessonDuration}>{result.lessonDuration}</span>
          </span>
          <span className={styles.lessonMeta}>
            <span className={styles.lessonTitle}>{result.lessonTitle}</span>
            <span className={styles.lessonWatchLabel}>{EXP7_DEBRIEF.watchCta}</span>
          </span>
        </a>
      </section>

      <div className={styles.ctaRow}>
        <a
          href={result.lessonHref}
          className={`ds-btn ds-btn--secondary ${styles.secondaryCta}`}
        >
          {EXP7_DEBRIEF.watchCta}
        </a>
        <button
          type="button"
          className={`ds-btn ds-btn--primary ${styles.primaryCta}`}
          onClick={onRetake}
        >
          Retake
        </button>
      </div>
    </Exp7PracticeCardShell>
  );
}

export default function Exp7Debrief({ result, onRetake, scene = EXP7_SCENE }: Exp7DebriefProps) {
  const isRoleplay = isRoleplayScene(scene);
  const isJordan = isJordanScene(scene);
  const characterName =
    scene.characterName ||
    (String(scene.characterId ?? "").toLowerCase() === "sam"
      ? "Sam"
      : isJordan
        ? "Claire"
        : "Alex");
  const reportIntro = isRoleplay
    ? `Here's how you handled your conversation with ${characterName} across the 1:1 — and what to work on before your next attempt.`
    : EXP7_DEBRIEF.reportIntro;
  const videoHint = isRoleplay
    ? "Rewatch concepts from New Manager Essentials (transition into managing) to strengthen how you lead former peers."
    : EXP7_DEBRIEF.videoSectionHint;

  // Claire PRE + Sam POST always use the Figma roleplay debrief when competencies exist.
  if (
    isRoleplay &&
    !result.evaluationFailed &&
    Array.isArray(result.competencies) &&
    result.competencies.length > 0
  ) {
    return (
      <RoleplayDebrief
        result={result}
        onRetake={onRetake}
        scene={scene}
        characterName={characterName}
        videoHint={videoHint}
      />
    );
  }

  return (
    <LegacyDebrief
      result={result}
      onRetake={onRetake}
      scene={scene}
      overline={isRoleplay ? "Roleplay" : "Practice simulation"}
      reportTitle={isRoleplay ? "Your feedback" : EXP7_DEBRIEF.reportTitle}
      reportIntro={reportIntro}
      videoHint={videoHint}
    />
  );
}
