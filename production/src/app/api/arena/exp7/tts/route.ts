import { NextResponse } from "next/server";
import { loadOpenAiKey } from "@/lib/arena/loadOpenAiKey";

export const runtime = "nodejs";

const ALLOWED_VOICES = new Set([
  "alloy",
  "ash",
  "ballad",
  "cedar",
  "coral",
  "echo",
  "marin",
  "sage",
  "shimmer",
  "verse",
]);

const JORDAN_TTS_INSTRUCTIONS =
  "You are Claire, a senior IC talking to your new manager in a first 1:1. Informal, candid, a little tense but not hostile. Short conversational sentences. Sound like a real coworker, not a narrator, actor, or coach. Natural pacing; slight tightness around the rejected presentation.";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    text?: string;
    voice?: string;
    instructions?: string;
  };
  const input = typeof body.text === "string" ? body.text.trim() : "";
  if (!input) {
    return NextResponse.json({ error: "Missing text" }, { status: 400 });
  }

  const apiKey = loadOpenAiKey();
  if (!apiKey) {
    return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 503 });
  }

  const voice =
    typeof body.voice === "string" && ALLOWED_VOICES.has(body.voice) ? body.voice : "coral";
  const instructions =
    typeof body.instructions === "string" && body.instructions.trim()
      ? body.instructions.trim()
      : JORDAN_TTS_INSTRUCTIONS;

  const upstream = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini-tts",
      voice,
      input,
      response_format: "mp3",
      instructions,
    }),
  });

  if (!upstream.ok) {
    const text = await upstream.text();
    console.error("[exp7] tts error", upstream.status, text);
    return NextResponse.json({ error: "Voice preview failed" }, { status: 502 });
  }

  return new Response(await upstream.arrayBuffer(), {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "no-store",
    },
  });
}
