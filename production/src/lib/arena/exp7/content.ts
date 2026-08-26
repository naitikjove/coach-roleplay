import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

function workspaceRoot(): string {
  const cwd = process.cwd();
  if (cwd.endsWith("b2c-ui-main")) {
    return path.resolve(cwd, "..");
  }
  return cwd;
}

function resolveExp7Dir(): string {
  const bundled = path.join(process.cwd(), "arena", "exp7");
  if (existsSync(path.join(bundled, "config", "scene.json"))) {
    return bundled;
  }
  return path.join(workspaceRoot(), "arena", "exp7");
}

const EXP7_DIR = resolveExp7Dir();

/** Default / Alex boundary scene (first card). */
export const EXP7_SCENE_ID = "scene-2-boundary";
/** Jordan multi-anchor MC1 scene (second card). */
export const EXP7_JORDAN_SCENE_ID = "scene-mc1-jordan-multi";
/** PRE — Your First 1:1 as a New Manager (pre-post session). */
export const EXP7_JORDAN_PRE_SCENE_ID = "scene-mc1-jordan-pre";
/** POST — Client Report Rejection (pre-post session). */
export const EXP7_SAM_POST_SCENE_ID = "scene-mc1-sam-post";

export const EXP7_MISSION_SLUG = "exp7-demo-favor";
export const ALEX_REALTIME_VOICE = "ash";
export const JORDAN_REALTIME_VOICE = "coral";
export const SAM_REALTIME_VOICE = "sage";

const SCENE_FILES: Record<string, string> = {
  [EXP7_SCENE_ID]: "scene.json",
  [EXP7_JORDAN_SCENE_ID]: "scene-jordan.json",
  "scene-jordan": "scene-jordan.json",
  [EXP7_JORDAN_PRE_SCENE_ID]: "scene-jordan-pre.json",
  "scene-jordan-pre": "scene-jordan-pre.json",
  "jordan-pre": "scene-jordan-pre.json",
  [EXP7_SAM_POST_SCENE_ID]: "scene-mc1-sam-post.json",
  "scene-sam-post": "scene-mc1-sam-post.json",
  "sam-post": "scene-mc1-sam-post.json",
};

export type Exp7SceneConfig = {
  id: string;
  slug: string;
  title: string;
  lessonRef: string;
  lessonTitle: string;
  lessonSlug: string;
  characterId?: string;
  voice?: string;
  actorPromptFile?: string;
  analyzerPromptFile?: string;
  turnLimits: {
    minLearnerTurns: number;
    softMaxLearnerTurns: number;
    hardMaxLearnerTurns: number;
    absoluteMaxLearnerTurns: number;
  };
  checklistItems: Array<{ id: string; label: string; critical?: boolean }>;
  headlineLabels: Record<string, string>;
};

export function isKnownExp7SceneId(sceneId: string): boolean {
  return (
    sceneId in SCENE_FILES ||
    sceneId === "scene-jordan" ||
    sceneId === "scene-jordan-pre" ||
    sceneId === "jordan-pre" ||
    sceneId === "scene-sam-post" ||
    sceneId === "sam-post"
  );
}

export function resolveSceneId(raw?: string | null): string {
  if (!raw) return EXP7_SCENE_ID;
  if (raw === "jordan" || raw === "scene-jordan") return EXP7_JORDAN_SCENE_ID;
  if (
    raw === "jordan-pre" ||
    raw === "scene-jordan-pre" ||
    raw === EXP7_JORDAN_PRE_SCENE_ID
  ) {
    return EXP7_JORDAN_PRE_SCENE_ID;
  }
  if (
    raw === "sam-post" ||
    raw === "scene-sam-post" ||
    raw === EXP7_SAM_POST_SCENE_ID
  ) {
    return EXP7_SAM_POST_SCENE_ID;
  }
  if (raw === "alex" || raw === EXP7_SCENE_ID) return EXP7_SCENE_ID;
  if (raw in SCENE_FILES) return raw;
  return EXP7_SCENE_ID;
}

function defaultCharacterId(id: string): string {
  if (id === EXP7_SAM_POST_SCENE_ID) return "sam";
  if (id === EXP7_JORDAN_SCENE_ID || id === EXP7_JORDAN_PRE_SCENE_ID) return "jordan";
  return "alex";
}

function defaultVoice(characterId: string): string {
  if (characterId === "sam") return SAM_REALTIME_VOICE;
  if (characterId === "jordan") return JORDAN_REALTIME_VOICE;
  return ALEX_REALTIME_VOICE;
}

export function loadExp7Scene(sceneId: string = EXP7_SCENE_ID): Exp7SceneConfig {
  const id = resolveSceneId(sceneId);
  const file = SCENE_FILES[id] || "scene.json";
  const raw = readFileSync(path.join(EXP7_DIR, "config", file), "utf8");
  const scene = JSON.parse(raw) as Exp7SceneConfig;
  if (!scene.characterId) {
    scene.characterId = defaultCharacterId(id);
  }
  if (!scene.voice) {
    scene.voice = defaultVoice(scene.characterId);
  }
  if (!scene.actorPromptFile) {
    scene.actorPromptFile =
      scene.characterId === "sam"
        ? "sam_client_report_rejection.prompt.txt"
        : scene.characterId === "jordan"
          ? "jordan.prompt.txt"
          : "alex.prompt.txt";
  }
  if (!scene.analyzerPromptFile) {
    scene.analyzerPromptFile =
      scene.characterId === "sam"
        ? "sam_client_report_rejection_analyzer.prompt.txt"
        : scene.characterId === "jordan"
          ? "jordan_analyzer.prompt.txt"
          : "analyzer.prompt.txt";
  }
  return scene;
}

function loadPromptFile(fileName: string): string {
  return readFileSync(path.join(EXP7_DIR, "prompts", fileName), "utf8");
}

export function loadActorPrompt(sceneId: string = EXP7_SCENE_ID): string {
  const scene = loadExp7Scene(sceneId);
  return loadPromptFile(scene.actorPromptFile || "alex.prompt.txt");
}

/** @deprecated Prefer loadActorPrompt(sceneId) */
export function loadAlexPrompt(): string {
  return loadActorPrompt(EXP7_SCENE_ID);
}

export function loadAnalyzerPrompt(sceneId: string = EXP7_SCENE_ID): string {
  const scene = loadExp7Scene(sceneId);
  return loadPromptFile(scene.analyzerPromptFile || "analyzer.prompt.txt");
}

export function loadCloseEvaluatorPrompt(): string {
  return loadPromptFile("close_evaluator.prompt.txt");
}

export function headlineLabel(scene: Exp7SceneConfig, headline: string): string {
  return scene.headlineLabels[headline] || headline.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function realtimeVoiceForScene(scene: Exp7SceneConfig): string {
  return scene.voice || defaultVoice(scene.characterId || "alex");
}
