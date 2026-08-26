import { EXP7_SCENE } from "./constants";
import type { Exp7DebriefEvidenceItem } from "./exp7Types";

export const EXP7_SCENE_TITLE = EXP7_SCENE.headline;

export const EXP7_MOCK_ALEX_LINES = [
  "Hey — got a sec? Tomorrow's product review is still rough — a few of my slides in the deck aren't ready.",
  "Can you polish those tonight? I'll still present — just need it to look like launch did when you cleaned up my deck last time.",
];

const MOCK_QUOTE =
  "I can't take this on tonight — the demo and feature slide are yours to own and send.";

export const EXP7_MOCK_DEBRIEF = {
  score: 7,
  headline: "solid" as const,
  headlineLabel: "Solid",
  didWell: [
    "You pushed back on owning Alex's slides without sounding cold.",
    "You kept the review delivery with him and offered review instead of a rewrite.",
  ],
  keyTakeaways: [
    "Say explicitly how he should ask and send work before you offer support.",
    "Lock a check-in so the ask does not come back as a last-minute rescue.",
  ],
  strengths: [
    {
      note: "You pushed back on owning Alex's slides without sounding cold — that kept trust intact.",
      learnerQuote: "",
    },
    {
      note: "You named that the review is his to deliver and offered a review instead of redoing the narrative.",
      learnerQuote: "",
    },
  ] satisfies Exp7DebriefEvidenceItem[],
  improvements: [
    {
      note: "Next time, say explicitly how he should ask and send work before you offer support.",
      learnerQuote: MOCK_QUOTE,
      suggestedLine:
        "Send me a draft first — I'll give feedback, but the deck and demo are yours to deliver.",
    },
  ] satisfies Exp7DebriefEvidenceItem[],
  transcriptImprovements: [
    {
      note: "Next time, say explicitly how he should ask and send work before you offer support.",
      learnerQuote: MOCK_QUOTE,
      suggestedLine:
        "Send me a draft first — I'll give feedback, but the deck and demo are yours to deliver.",
    },
  ] satisfies Exp7DebriefEvidenceItem[],
};
