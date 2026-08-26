/**
 * Learner-facing copy — mirrored from
 * b2c-ui-main/src/app/arena/exp7/pre-post/constants.ts
 *
 * Keep in sync when product copy changes.
 */

export const EXP7_MICROCOURSE_TITLE =
  "Transitioning from Individual Contributor to Manager";

export const EXP7_PRE_POST_COMPETENCIES = [
  "Building Trust",
  "Setting Goals",
  "Directing Work",
  "Ensuring Accountability",
];

export const EXP7_PRE_ENTRY_PURPOSE =
  "Check your current skills before the videos, then come back after to see the difference.";

export const EXP7_PRE_POST_HREF = "/arena/exp7/pre-post";
export const EXP7_PRE_POST_SESSION_HREF = "/arena/exp7/pre-post/session";
export const EXP7_PRE_POST_SUBJECT_TITLE = "New Manager Essentials";

export const EXP7_PRE_POST_SESSION_BREADCRUMB = [
  { label: "Home", href: "/" },
  { label: EXP7_PRE_POST_SUBJECT_TITLE, href: EXP7_PRE_POST_HREF },
  { label: EXP7_MICROCOURSE_TITLE, href: EXP7_PRE_POST_HREF },
  { label: "Roleplay" },
];

export const PRE_POST_TRANSITION_MS = 2000;

export const EXP7_PRE_TRANSITION = {
  title: "Entering 1:1 with Claire",
  subtitle: "Getting your conversation ready…",
};

export const EXP7_PRE = {
  title: "Your First 1:1 as a New Manager",
  characterName: "Claire",
  characterRole: "Former peer",
  characterAvatar: "/avatars/team-member.png",
  characterId: "jordan",
  about: [
    "You are a newly promoted manager: weeks ago Claire was your peer; today Claire reports to you.",
    "Last week the team submitted a client presentation that Claire owned; yesterday senior leadership rejected it for an incomplete story, thin claims, and numbers that could not hold.",
    "Your manager expects a recovery plan from the team this week, and the presentation deadline remains firm.",
    "This regular 1:1 is the first talk since the rejection: the old peer habit of late-night rescue is still in the room, Claire is still adjusting to you as manager, and next steps remain open.",
  ],
  whoYou: {
    name: "You",
    role: "New manager",
    body: "New to the role. Running this first 1:1 after the presentation rejection.",
  },
  whoThem: {
    name: "Claire",
    role: "Your report · Former peer",
    body: "Owned the presentation that came back from leadership. Still getting used to reporting to you.",
  },
  objectives: [
    "Keep Claire open after the rejection; avoid pushing them into defense or shutdown.",
    "Agree next presentation actions and timing.",
    "Keep ownership with Claire; do not redo the draft yourself.",
    "Name the failed review; agree how progress will be checked before resubmit.",
  ],
  scene: {
    scenarioKey: "jordan-pre",
    sceneId: "scene-mc1-jordan-pre",
    headline: "Your First 1:1 as a New Manager",
    formatNote: "Microphone access required.",
    ctaLabel: "Join Conversation",
    characterName: "Claire",
    characterRole: "Former peer",
    characterAvatar: "/avatars/team-member.png",
    characterId: "jordan",
  },
};

/** Demo debrief sample (production uses LLM analyzer). */
export const MOCK_DEBRIEF = {
  score: 6,
  headlineLabel: "Solid",
  summary:
    "You kept Claire in the conversation and named next steps, but ownership and the check-before-resubmit still need a clearer close.",
  didWell: [
    "Opened by acknowledging the leadership rejection without blaming Claire.",
    "Asked for Claire’s view on what broke in the story and numbers.",
    "Proposed a recovery window this week instead of taking the deck over.",
  ],
  keyTakeaways: [
    "Restate ownership out loud: Claire owns the rewrite; you coach checkpoints.",
    "Close the 1:1 by confirming how progress will be checked before resubmit.",
    "Keep peer-rescue history as context — not an invitation to redo the work.",
  ],
  competencies: [
    { id: "building_trust", name: "Building Trust", score: 7 },
    { id: "setting_goals", name: "Setting Goals", score: 6 },
    { id: "directing_work", name: "Directing Work", score: 5 },
    { id: "ensuring_accountability", name: "Ensuring Accountability", score: 4 },
  ],
};
