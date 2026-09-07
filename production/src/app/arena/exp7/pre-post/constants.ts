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

/** Entry framing for the certificate conversation (shown after the chapter videos). */
export const EXP7_POST_ENTRY_PURPOSE =
  "You’ve watched the videos. Run this conversation to see how much you’ve grown." as const;

/** Product chrome labels for the two roleplays. */
export const EXP7_PRACTICE_LABEL = "Practice Roleplay" as const;
export const EXP7_CERTIFICATE_LABEL = "Certificate Roleplay" as const;

/** Figma feedback header — phase framing under the scenario title. */
export const EXP7_PRE_FEEDBACK_PHASE_LINE =
  "Your starting point · Before the course begins" as const;
export const EXP7_POST_FEEDBACK_PHASE_LINE =
  "Your growth check · After the course" as const;

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
  /** Eyebrow above the title on the session brief. */
  phaseLabel: string;
  /** Short scenario framing shown under the title on the brief. */
  summary: string;
  characterName: string;
  characterRole: string;
  characterAvatar: string;
  characterId: string;
  /** Long-form scenario reference (CONTENT_FINAL). Brief shows `summary`. */
  about: readonly string[];
  whoYou: Exp7WhoCopy;
  whoThem: Exp7WhoCopy;
  objectives: readonly string[];
  scene: Exp7SceneCopy;
};

/** PRE — Storyline A · Claire · Your First 1:1 as a New Manager (final copy). */
export const EXP7_PRE: Exp7ConversationCopy = {
  title: "Your First 1:1 as a New Manager",
  phaseLabel: `${EXP7_PRACTICE_LABEL} Scenario`,
  summary:
    "Claire’s presentation was rejected by leadership. In your first 1:1 as her manager, understand what happened and agree how it will be fixed by the end of the week.",
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
    role: "Newly promoted manager",
    body: "New to the role. Running this first 1:1 after the presentation came back.",
  },
  whoThem: {
    name: "Claire",
    role: "Former peer · Now reports to you",
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
    formatNote: "Microphone required",
    ctaLabel: "Join Conversation",
    characterName: "Claire",
    characterRole: "Former peer",
    characterAvatar: "/arena/exp4/characters/team-member.png",
    characterId: "jordan",
  },
};

/** POST — Storyline D · Sam · Your 1:1 After Sam's Report Was Rejected (final copy). */
export const EXP7_POST: Exp7ConversationCopy = {
  title: "Your 1:1 After Sam’s Report Was Rejected",
  phaseLabel: `${EXP7_CERTIFICATE_LABEL} Scenario`,
  summary:
    "The client rejected the report Sam sent them. You’re meeting him in a 1:1 as his manager to talk through what happened and what happens next.",
  characterName: "Sam",
  characterRole: "Former peer",
  characterAvatar: "/arena/exp4/characters/former-peer.png",
  characterId: "sam",
  about: [
    "You are a newly promoted manager. Sam was your peer and a work friend. Today Sam reports to you.",
    "The client replied on the report Sam owned. They flagged totals that do not match and two sections that contradict each other.",
    "You have a 1:1 with Sam. This is the first since you became manager, and since the client replied.",
    "Your manager wants a recovery plan and the corrected report this week. Next steps are still open.",
  ],
  whoYou: {
    name: "You",
    role: "Newly promoted manager",
    body: "New to the role. Running this first 1:1 after the client flagged the report.",
  },
  whoThem: {
    name: "Sam",
    role: "Former peer · Now reports to you",
    body: "Owned the numbers the client flagged. Shaken by the miss, and still getting used to reporting to you.",
  },
  objectives: [
    "Find out from Sam what actually happened with the report.",
    "Agree what happens with the report between now and the client meeting.",
    "Decide who fixes the mistakes in the report.",
    "Decide who goes to the client meeting to walk them through the report.",
  ],
  scene: {
    scenarioKey: "sam-post",
    sceneId: "scene-mc1-sam-post",
    headline: "Your 1:1 After Sam’s Report Was Rejected",
    intro:
      "You are a newly promoted manager. Sam sat beside you as a peer and a work friend. Today Sam reports to you.",
    howItWorks:
      "Sam opens with the client flag. Respond out loud. End the scene when you’re done for feedback across the conversation.",
    formatNote: "Microphone required",
    ctaLabel: "Join Conversation",
    characterName: "Sam",
    characterRole: "Former peer",
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

/** Last saved PRE evaluation — open on session with ?view=last */
export const EXP7_PRE_POST_LAST_RESULTS_HREF =
  `${EXP7_PRE_POST_SESSION_HREF}?view=last` as const;

/** Last saved POST (Sam) evaluation */
export const EXP7_PRE_POST_LAST_RESULTS_POST_HREF =
  `${EXP7_PRE_POST_SESSION_HREF}?phase=post&view=last` as const;

/** Hosted PRE entry (subtle “open hosted” when a local last result exists). */
export const EXP7_PRE_POST_HOSTED_HREF =
  "https://jove-exp7-pre-post.vercel.app/arena/exp7/pre-post" as const;

/**
 * Start micro-course from roleplay feedback — opens in a new tab.
 * Production coach chapter for Transitioning from IC to Manager.
 */
export const EXP7_PRE_MICROCOURSE_HREF =
  "https://coach.jove.com/new-manager-essentials/transitioning-from-individual-contributor-to-manager/from-individual-contributor-to-manager?chapterId=525&page=ChapterCard&chapterName=Transitioning+from+Individual+Contributor+to+Manager" as const;

export const EXP7_LAST_DEBRIEF_STORAGE_KEY = "arena.exp7.pre.lastDebrief.v1" as const;
export const EXP7_LAST_DEBRIEF_STORAGE_KEY_POST =
  "arena.exp7.post.lastDebrief.v1" as const;
