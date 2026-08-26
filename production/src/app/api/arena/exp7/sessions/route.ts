import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import {
  loadExp7Scene,
  resolveSceneId,
  EXP7_SCENE_ID,
} from "@/lib/arena/exp7/content";
import { initExp7RunSession } from "@/lib/arena/exp7/runPersistence";
import { createExp7Session } from "@/lib/arena/exp7/sessionStore";
import { hasOpenAiKey } from "@/lib/arena/loadOpenAiKey";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!hasOpenAiKey()) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY not configured — add to workspace env.txt" },
      { status: 503 },
    );
  }

  const body = (await request.json().catch(() => ({}))) as { sceneId?: string };
  const sceneId = resolveSceneId(body.sceneId || EXP7_SCENE_ID);

  const sessionId = randomUUID();
  createExp7Session(sessionId, sceneId);
  void initExp7RunSession(sessionId, sceneId).catch((err) =>
    console.error("[exp7] init run session failed", err),
  );
  const scene = loadExp7Scene(sceneId);

  return NextResponse.json({
    id: sessionId,
    sceneId,
    sceneTitle: scene.title,
    characterId: scene.characterId || "alex",
    turnLimits: scene.turnLimits,
  });
}
