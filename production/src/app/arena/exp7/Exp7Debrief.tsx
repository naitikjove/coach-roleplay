"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import Exp4SpeakerAvatar from "../exp4/Exp4SpeakerAvatar";
import {
  EXP7_DEBRIEF,
  EXP7_SCENE,
  isJordanScene,
  isRoleplayScene,
  type Exp7SceneCopy,
} from "./constants";
import type { Exp7DebriefEvidenceItem, Exp7DebriefResult } from "./exp7Types";
import Exp7CompetencyRadar from "./Exp7CompetencyRadar";
import Exp7PracticeCardShell from "./Exp7PracticeCardShell";
import styles from "./exp7PracticeCard.module.css";
import { truncateQuote } from "@/lib/arena/exp7/debriefEvidence";

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

export default function Exp7Debrief({ result, onRetake, scene = EXP7_SCENE }: Exp7DebriefProps) {
  const isJordan = isRoleplayScene(scene);
  const characterName =
    scene.characterName ||
    (String(scene.characterId ?? "").toLowerCase() === "sam"
      ? "Sam"
      : isJordanScene(scene)
        ? "Jordan"
        : "Alex");
  const overline = isJordan ? "Roleplay" : "Practice simulation";
  const reportTitle = isJordan ? "Your feedback" : EXP7_DEBRIEF.reportTitle;
  const reportIntro = isJordan
    ? `Here's how you handled your conversation with ${characterName} across the 1:1 — and what to work on before your next attempt.`
    : EXP7_DEBRIEF.reportIntro;
  const videoHint = isJordan
    ? "Rewatch concepts from New Manager Essentials (transition into managing) to strengthen how you lead former peers."
    : EXP7_DEBRIEF.videoSectionHint;

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
