import { NextResponse } from "next/server";
import {
  hasOpenAiKey,
  isOpenRouterAnalyzerModel,
  loadOpenRouterKey,
} from "@/lib/arena/loadOpenAiKey";

export const runtime = "nodejs";

export async function GET() {
  const model = process.env.ARENA_LLM_MODEL || "gpt-5.6-terra";
  const useOpenRouter = isOpenRouterAnalyzerModel(model);
  const llmReady = useOpenRouter
    ? Boolean(loadOpenRouterKey())
    : hasOpenAiKey();
  const realtimeReady = hasOpenAiKey();

  return NextResponse.json({
    ok: true,
    realtime_ready: realtimeReady,
    llm_ready: llmReady,
    llm_provider: useOpenRouter
      ? llmReady
        ? "openrouter"
        : "mock"
      : realtimeReady
        ? "openai"
        : "mock",
    llm_model: model,
  });
}
