import { NextResponse } from "next/server";
import { loadOpenAiKey } from "@/lib/arena/loadOpenAiKey";
import {
  loadActorPrompt,
  loadExp7Scene,
  realtimeVoiceForScene,
} from "@/lib/arena/exp7/content";
import { parseExp7SessionSnapshot } from "@/lib/arena/exp7/parseSnapshot";
import { ensureExp7Session } from "@/lib/arena/exp7/sessionStore";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ sessionId: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { sessionId } = await context.params;
  const body = (await request.json().catch(() => ({}))) as { snapshot?: unknown };
  const session = await ensureExp7Session(sessionId, parseExp7SessionSnapshot(body));

  if (!session) {
    return NextResponse.json({ error: "Invalid session" }, { status: 404 });
  }

  const apiKey = loadOpenAiKey();
  if (!apiKey) {
    return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 503 });
  }

  const scene = loadExp7Scene(session.sceneId);
  const instructions = loadActorPrompt(session.sceneId);
  const voice = realtimeVoiceForScene(scene);
  const characterId = scene.characterId || "alex";
  const realtimeModel =
    process.env.ARENA_REALTIME_MODEL?.trim() || "gpt-realtime-2.1";

  const upstream = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      session: {
        type: "realtime",
        model: realtimeModel,
        instructions,
        audio: {
          input: {
            format: { type: "audio/pcm", rate: 24000 },
            transcription: { model: "whisper-1" },
            turn_detection: {
              type: "server_vad",
              threshold: 0.65,
              prefix_padding_ms: 300,
              silence_duration_ms: 900,
            },
          },
          output: {
            voice,
            format: { type: "audio/pcm", rate: 24000 },
          },
        },
      },
    }),
  });

  if (!upstream.ok) {
    const text = await upstream.text();
    console.error("[exp7] realtime token error", upstream.status, text);
    return NextResponse.json(
      { error: `Realtime upstream error: ${upstream.status}` },
      { status: 502 },
    );
  }

  const data = (await upstream.json()) as { value?: string; expires_at?: number };

  return NextResponse.json({
    clientSecret: data.value,
    expiresAt: data.expires_at,
    model: realtimeModel,
    voice,
    characterId,
    sceneId: session.sceneId,
    instructions,
  });
}
