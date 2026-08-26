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
  level: "strong" | "adequate" | "needs_work" | "not_observed";
  note: string;
  learnerQuote: string;
};

export type Exp7DebriefResult = {
  score: number;
  headline: "nailed_it" | "solid" | "try_again";
  headlineLabel: string;
  /** 1–2 sentence coach recap of the call. */
  summary?: string;
  /** Legacy evidence cards; UI prefers note-only pointers + transcriptImprovements. */
  strengths: Exp7DebriefEvidenceItem[];
  improvements: Exp7DebriefEvidenceItem[];
  /** 2–4 one-liners for “What you did well” (no transcript quotes). */
  didWell?: string[];
  /** 2–3 one-liners for “Key takeaways” / areas to improve (no transcript quotes). */
  keyTakeaways?: string[];
  /** Quote-backed coaching — only section that shows transcript lines. */
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
  /** round(sumScore / maxScore * 100). */
  percent?: number;
  /** True when scoring failed — do not treat as a real 0% grade. */
  evaluationFailed?: boolean;
};
