import type { Exp7SceneCopy } from "../constants";

/** MC01 title — product chrome (chapter), not conversation headline. */
export const EXP7_MICROCOURSE_TITLE =
  "Transitioning from Individual Contributor to Manager" as const;

/** Shared competencies — user-facing (CONTENT_FINAL.md). */
export const EXP7_PRE_POST_COMPETENCIES = [
  "Building Trust",
  "Setting Goals",
  "Directing Work",
  "Ensuring Accountability",
] as const;

/**
 * Entry framing (product chrome, not storyline body).
 * Explains PRE purpose: baseline now → videos → return to measure growth.
 */
export const EXP7_PRE_ENTRY_PURPOSE =
  "Check your current skills before the videos, then come back after to see the difference." as const;

export const EXP7_PRE_POST_HREF = "/arena/exp7/pre-post" as const;
export const EXP7_PRE_POST_SESSION_HREF = "/arena/exp7/pre-post/session" as const;
export const EXP7_PRE_POST_CHAPTER_HREF = EXP7_PRE_POST_HREF;

/** Subject name in platform breadcrumb (matches chapter shell). */
export const EXP7_PRE_POST_SUBJECT_TITLE = "New Manager Essentials" as const;

/**
 * Session trail (platform MicrocourseBreadcrumb shape):
 * Home > New Manager Essentials > Transitioning… > Roleplay
 */
export const EXP7_PRE_POST_SESSION_BREADCRUMB = [
  { label: "Home", href: "/", icon: "inbox" as const },
  { label: EXP7_PRE_POST_SUBJECT_TITLE, href: EXP7_PRE_POST_HREF },
  {
    label: EXP7_MICROCOURSE_TITLE,
    href: EXP7_PRE_POST_HREF,
  },
  { label: "Roleplay" },
] as const;

export type Exp7PrePostPhase = "pre" | "post";

export type Exp7WhoCopy = {
  name: string;
  role: string;
  body: string;
};

export type Exp7ConversationCopy = {
  title: string;
  characterName: string;
  characterRole: string;
  characterAvatar: string;
  characterId: string;
  /** “What this conversation is about” — one pointer per line. */
  about: readonly string[];
  whoYou: Exp7WhoCopy;
  whoThem: Exp7WhoCopy;
  objectives: readonly string[];
  scene: Exp7SceneCopy;
};

/** PRE — Storyline A · Claire · Your First 1:1 as a New Manager (final copy). */
export const EXP7_PRE: Exp7ConversationCopy = {
  title: "Your First 1:1 as a New Manager",
  characterName: "Claire",
  characterRole: "Former peer",
  characterAvatar: "/arena/exp4/characters/team-member.png",
  characterId: "jordan",
  about: [
    "You are a newly promoted manager. Claire was your peer. Today Claire reports to you.",
    "Leadership emailed that Claire’s client presentation came back. They flagged an incomplete story, thin claims, and numbers that did not hold.",
    "You have a 1:1 with Claire. This is the first since you became manager, and since the deck came back.",
    "Leadership wants a recovery plan and the deck cleared this week. Next steps are still open.",
  ],
  whoYou: {
    name: "You",
    role: "New manager",
    body: "New to the role. Running this first 1:1 after the presentation came back.",
  },
  whoThem: {
    name: "Claire",
    role: "Your report · Former peer",
    body: "Owned the presentation that came back from leadership. Still getting used to reporting to you.",
  },
  objectives: [
    "Get Claire talking openly about what happened with the presentation.",
    "Establish what needs to happen with the deck between now and end of week.",
    "Agree with Claire how the rewrite gets done before end of week.",
    "Decide on who represents the work in the leadership conversation.",
  ],
  scene: {
    scenarioKey: "jordan-pre",
    sceneId: "scene-mc1-jordan-pre",
    headline: "Your First 1:1 as a New Manager",
    intro:
      "You are a newly promoted manager. Weeks ago Claire worked beside you as a peer. Today Claire reports to you.",
    howItWorks:
      "Claire opens and brings up what’s on their plate. Respond out loud. End the scene when you’re done for feedback across the conversation.",
    formatNote: "Microphone access required.",
    ctaLabel: "Join Conversation",
    characterName: "Claire",
    characterRole: "Former peer",
    characterAvatar: "/arena/exp4/characters/team-member.png",
    characterId: "jordan",
  },
};

/** POST — Storyline D · Sam · Client Report Rejection (final copy). */
export const EXP7_POST: Exp7ConversationCopy = {
  title: "Client Report Rejection",
  characterName: "Sam",
  characterRole: "Former peer and work friend",
  characterAvatar: "/arena/exp4/characters/former-peer.png",
  characterId: "sam",
  about: [
    "You are a newly promoted manager. About a month ago Sam was your peer and a close work friend. Today Sam reports to you.",
    "Two days ago the team sent a client report with numbers Sam owned. Today the client flagged clear errors: totals that do not match and two sections that contradict each other. A routine second check was skipped under pressure so the report could go out on time. Your manager expects a recovery plan this week. The corrected report is still due.",
    "This 1:1 is the first conversation since the client replied. Sam is usually careful and arrives shaken. Peer history is still present: when you sat at the same level, covering for each other felt easy, and nothing has yet been said about how you work together now.",
  ],
  whoYou: {
    name: "You",
    role: "New manager",
    body: "New to the role. Running this first 1:1 after the client flagged the report.",
  },
  whoThem: {
    name: "Sam",
    role: "Your report · Former peer and work friend",
    body: "Owned the numbers the client flagged. Careful by habit; shaken by the miss and still adjusting to you as manager.",
  },
  objectives: [
    "Listen and respond so Sam stays open in the discussion after the client flag, without only defending or withdrawing.",
    "Agree the next actions for the corrected report and the timing for each.",
    "Confirm Sam owns the numbers rework. Do not take the report over and complete it yourself.",
    "Acknowledge that the client flagged the report. Do not minimize it. Agree how progress will be reviewed before it is resubmitted.",
  ],
  scene: {
    scenarioKey: "sam-post",
    sceneId: "scene-mc1-sam-post",
    headline: "Client Report Rejection",
    intro:
      "You are a newly promoted manager. About a month ago Sam was your peer and a close work friend. Today Sam reports to you.",
    howItWorks:
      "Sam opens with the client flag. Respond out loud. End the scene when you’re done for feedback across the conversation.",
    formatNote: "Microphone access required.",
    ctaLabel: "Join Conversation",
    characterName: "Sam",
    characterRole: "Former peer and work friend",
    characterAvatar: "/arena/exp4/characters/former-peer.png",
    characterId: "sam",
  },
};

/** @deprecated Prefer EXP7_PRE.scene */
export const EXP7_PRE_SCENE = EXP7_PRE.scene;
/** @deprecated Prefer EXP7_POST.scene */
export const EXP7_POST_SCENE = EXP7_POST.scene;

export const EXP7_PRE_POST_META = {
  preTitle: EXP7_PRE.title,
  postTitle: EXP7_POST.title,
  competencies: EXP7_PRE_POST_COMPETENCIES,
} as const;

/** 2s entry → session transition. */
export const PRE_POST_TRANSITION_MS = 2000;

/** Overlay copy while navigating entry → session. */
export const EXP7_PRE_TRANSITION = {
  title: "Entering 1:1 with Claire",
  subtitle: "Getting your conversation ready…",
} as const;

export const EXP7_POST_TRANSITION = {
  title: "Entering 1:1 with Sam",
  subtitle: "Getting your conversation ready…",
} as const;

export const EXP7_PRE_POST_SESSION_POST_HREF =
  `${EXP7_PRE_POST_SESSION_HREF}?phase=post` as const;
