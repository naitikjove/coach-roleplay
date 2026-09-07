import type { Exp7DebriefEvidenceItem } from "@/lib/arena/exp7/debriefEvidence";

export type { Exp7DebriefEvidenceItem };

export type Exp7PanelPhase = "idle" | "connecting" | "live" | "analyzing" | "debrief";

export type Exp7SpeakerState =
  | "thinking"
  | "character_speaking"
  | "awaiting_user"
  | "user_speaking"
  | "wrapping_up"
  | "idle";

export type Exp7CompetencyScore = {
  id: string;
  name: string;
  score: number | null;
  level: "strong" | "adequate" | "developing" | "needs_work" | "not_observed";
  note: string;
  /** Mirrors youSaid for accordion fallback / older clients. */
  learnerQuote: string;
  /** Roleplay accordion “You said” (English verbatim). */
  youSaid?: string;
  /** Roleplay accordion “Try instead”. */
  tryInstead?: string;
};

export type Exp7DebriefResult = {
  score: number;
  headline: "nailed_it" | "solid" | "try_again";
  headlineLabel: string;
  /** 1–2 sentence coach recap of the call. */
  summary?: string;
  /** Roleplay — weakest administered competency id (focus card). */
  focusSkill?: string;
  /** Alex legacy evidence cards. Roleplay leaves these empty. */
  strengths: Exp7DebriefEvidenceItem[];
  improvements: Exp7DebriefEvidenceItem[];
  /** Alex legacy lists. Roleplay leaves these empty. */
  didWell?: string[];
  keyTakeaways?: string[];
  /** Derived from competency youSaid/tryInstead for roleplay; Alex may set directly. */
  transcriptImprovements?: Exp7DebriefEvidenceItem[];
  lessonHref: string;
  lessonTitle: string;
  lessonThumbnail: string;
  lessonDuration: string;
  competencies?: Exp7CompetencyScore[];
  /** Sum of competency scores; untested competencies contribute 0. */
  sumScore?: number;
  /** Denominator for sumScore (four competencies x 10). */
  maxScore?: number;
  /** Display aid: round(sumScore / maxScore * 100). Overall /10 uses sum, not percent. */
  percent?: number;
  /** True when scoring failed — do not treat as a real 0% grade. */
  evaluationFailed?: boolean;
};
