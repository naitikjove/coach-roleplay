import type { ChapterInitialData } from "@/types/chapterInitialData";

export const EXP7_SUBJECT_SLUG = "new-manager-essentials" as const;
export const EXP7_CHAPTER_SLUG =
  "transitioning-from-individual-contributor-to-manager" as const;

export const EXP7_CHAPTER_HREF =
  `/arena/exp7/${EXP7_SUBJECT_SLUG}/${EXP7_CHAPTER_SLUG}` as const;

export const EXP7_LESSON_SLUG = "how_to_set_boundaries_with_former_peers" as const;
export const EXP7_LESSON_TITLE = "How to Set Boundaries With Former Peers";
export const EXP7_LESSON_HREF =
  `/microcourse/${EXP7_SUBJECT_SLUG}/${EXP7_CHAPTER_SLUG}/${EXP7_LESSON_SLUG}` as const;
export const EXP7_LESSON_ID = "41949" as const;
export const EXP7_LESSON_THUMBNAIL =
  "https://coach-cdn.jove.com/enterprise/couchEBTab1/41949.webp" as const;
export const EXP7_LESSON_DURATION = "01:22" as const;

/** Debrief card copy — ties report back to the Alex practice scenario. */
export const EXP7_DEBRIEF = {
  reportTitle: "Your practice feedback",
  reportIntro:
    "Here's how you handled your conversation with Alex and what to work on before your next attempt.",
  videoSectionTitle: "Recommended concept",
  videoSectionHint: "Rewatch this concept to sharpen how you set boundaries with former peers.",
  watchCta: "Watch concept",
} as const;

export const EXP7_SIDEBAR_NAV = {
  key: "practice-simulation",
  label: "Practice Simulation",
  icon: "/arena/exp7/practice-simulation.svg",
  iconActive: "/arena/exp7/practice-simulation-active.svg",
  href: "/arena/exp7",
} as const;

export type Exp7ChapterPayload = {
  initialData: ChapterInitialData;
  microCourseOverviewData: Record<string, unknown> | null;
  mobileUserAgentHint: boolean;
};

export type Exp7Skill = {
  id: string;
  title: string;
  subtitle: string;
  href?: string;
  locked?: boolean;
};

/** Learner-facing copy for the Alex boundary voice scene (idle + live header). */
export const EXP7_SCENE = {
  scenarioKey: "alex" as const,
  sceneId: "scene-2-boundary",
  headline: "Alex, your former peer, wants to talk.",
  intro:
    "You and Alex used to work together as peers. You were promoted recently, and he's on your team now. He's reaching out about something at work.",
  howItWorks:
    "Alex opens with the situation. You respond out loud. When you're done, you get feedback and video recommendations to help you improve.",
  formatNote: "Microphone access required.",
  ctaLabel: "Join Conversation",
  characterName: "Alex",
  characterRole: "Former peer",
  characterAvatar: "/arena/exp4/characters/former-peer.png",
  characterId: "alex",
} as const;

/**
 * Jordan multi-anchor MC1 practice (second card).
 * Trust → expectation setting → delegation → accountability in one conversation.
 */
export const EXP7_JORDAN_SCENE = {
  scenarioKey: "jordan" as const,
  sceneId: "scene-mc1-jordan-multi",
  headline: "Jordan wants a 1:1 — former peer, now your report.",
  intro:
    "Jordan used to work beside you as a peer and now reports to you. This is a regular 1:1. Lead as their manager—not as a peer finishing their work.",
  howItWorks:
    "Jordan opens and brings up what’s on their plate. Respond out loud. You don’t need a script—handle what comes up as their manager. End the scene when you’re done for feedback across the conversation.",
  formatNote: "Microphone access required. Often longer than a single-issue chat.",
  ctaLabel: "Join Conversation",
  characterName: "Jordan",
  characterRole: "Former peer · senior analyst",
  characterAvatar: "/arena/exp4/characters/team-member.png",
  characterId: "jordan",
} as const;

/** Learner-facing idle/live header copy for a practice panel. */
export type Exp7SceneCopy = {
  scenarioKey: string;
  sceneId: string;
  headline: string;
  intro: string;
  howItWorks: string;
  formatNote: string;
  ctaLabel: string;
  characterName: string;
  characterRole: string;
  characterAvatar: string;
  characterId: string;
};

/** True for Jordan PRE/multi-anchor scenes (character or scenario key). */
export function isJordanScene(scene: Pick<Exp7SceneCopy, "characterId" | "scenarioKey">): boolean {
  const characterId = String(scene.characterId ?? "");
  const scenarioKey = String(scene.scenarioKey ?? "");
  return characterId === "jordan" || scenarioKey === "jordan" || scenarioKey.startsWith("jordan");
}

/** True for PRE/POST 1:1s (Claire/Jordan or Sam) vs Alex single-ask. */
export function isRoleplayScene(scene: Pick<Exp7SceneCopy, "characterId" | "scenarioKey">): boolean {
  const characterId = String(scene.characterId ?? "").toLowerCase();
  const scenarioKey = String(scene.scenarioKey ?? "").toLowerCase();
  return (
    isJordanScene(scene) ||
    characterId === "sam" ||
    scenarioKey === "sam" ||
    scenarioKey.startsWith("sam")
  );
}

/** @deprecated Legacy preview card; live second card is EXP7_JORDAN_SCENE. */
export const EXP7_UPCOMING_SCENE = {
  ...EXP7_JORDAN_SCENE,
  demoOnlyMessage:
    "This preview card is unused. Use Jordan’s live conversation card for multi-anchor practice.",
} as const;

export const EXP7_WORK_SKILLS: Exp7Skill[] = [
  {
    id: "nme",
    title: "New Manager Essentials",
    subtitle: "Workplace skills for first-time managers",
    href: EXP7_CHAPTER_HREF,
  },
  {
    id: "ice",
    title: "Individual Contributor Excellence",
    subtitle: "Skills for high-performing individual contributors",
    locked: true,
  },
];
