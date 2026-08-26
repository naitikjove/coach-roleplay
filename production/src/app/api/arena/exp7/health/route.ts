import { NextResponse } from "next/server";
import { hasOpenAiKey } from "@/lib/arena/loadOpenAiKey";

export const runtime = "nodejs";

export async function GET() {
  const keyReady = hasOpenAiKey();
  return NextResponse.json({
    ok: true,
    realtime_ready: keyReady,
    llm_ready: keyReady,
    llm_provider: keyReady ? "openai" : "mock",
  });
}
