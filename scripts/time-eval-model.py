#!/usr/bin/env python3
"""Time transcript → evaluation turnaround for ARENA_LLM_MODEL candidates.

Replays the exact analyzer system + user payload from a saved .exp7-runs session,
timing only the OpenAI call (not session wrap-up / audio tail).
"""

from __future__ import annotations

import json
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path("/Users/naitik/Documents/b2b enterprise")
UI = ROOT / "b2c-ui-main"
RUN_ID = sys.argv[1] if len(sys.argv) > 1 else "f92ad272-f9cb-4067-a5c3-e1c0b28e4cdf"
MODELS = sys.argv[2:] or ["gpt-5.6-terra"]
RUN = UI / ".exp7-runs" / RUN_ID
SYSTEM_PROMPT = (
    UI / "arena/exp7/prompts/jordan_presentation_quality_miss_analyzer.prompt.txt"
)


def load_key() -> str:
    for line in (ROOT / "env.txt").read_text(encoding="utf-8-sig").splitlines():
        if line.strip().startswith("OPENAI_API_KEY") and "=" in line:
            return line.split("=", 1)[1].strip().strip('"').strip("'")
    raise RuntimeError("OPENAI_API_KEY not found in env.txt")


def call(model: str, system: str, user: str, effort: str = "medium") -> dict:
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        "reasoning_effort": effort,
        "max_completion_tokens": 12_000,
        "response_format": {"type": "json_object"},
    }
    req = urllib.request.Request(
        "https://api.openai.com/v1/chat/completions",
        data=json.dumps(payload).encode(),
        headers={
            "Authorization": f"Bearer {load_key()}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    t0 = time.perf_counter()
    try:
        with urllib.request.urlopen(req, timeout=300) as resp:
            body = json.loads(resp.read().decode())
            status = resp.status
    except urllib.error.HTTPError as e:
        err = e.read().decode("utf-8", errors="replace")
        elapsed = time.perf_counter() - t0
        return {
            "ok": False,
            "status": e.code,
            "elapsed_s": round(elapsed, 2),
            "error": err[:800],
        }
    elapsed = time.perf_counter() - t0
    choice = (body.get("choices") or [{}])[0]
    content = ((choice.get("message") or {}).get("content") or "").strip()
    usage = body.get("usage") or {}
    parsed = None
    try:
        parsed = json.loads(content) if content else None
    except json.JSONDecodeError:
        parsed = None
    return {
        "ok": bool(content),
        "status": status,
        "elapsed_s": round(elapsed, 2),
        "finish_reason": choice.get("finish_reason"),
        "content_chars": len(content),
        "score": (parsed or {}).get("score") if isinstance(parsed, dict) else None,
        "percent": (parsed or {}).get("percent") if isinstance(parsed, dict) else None,
        "headline": (parsed or {}).get("headline") if isinstance(parsed, dict) else None,
        "prompt_tokens": usage.get("prompt_tokens"),
        "completion_tokens": usage.get("completion_tokens"),
        "reasoning_tokens": (usage.get("completion_tokens_details") or {}).get(
            "reasoning_tokens"
        ),
        "total_tokens": usage.get("total_tokens"),
        "raw_preview": content[:160].replace("\n", " "),
        "error": None if content else "empty content",
    }


def main() -> None:
    system = SYSTEM_PROMPT.read_text(encoding="utf-8")
    user = (RUN / "analyzer-input.txt").read_text(encoding="utf-8")
    print(f"session: {RUN_ID}")
    print(f"system_chars: {len(system)}  user_chars: {len(user)}")
    print(f"models: {', '.join(MODELS)}")
    print()
    results = []
    for model in MODELS:
        print(f"→ {model} (reasoning_effort=medium) …", flush=True)
        r = call(model, system, user, "medium")
        results.append({"model": model, **r})
        if r.get("ok"):
            print(
                f"  {r['elapsed_s']}s  score={r.get('score')} percent={r.get('percent')} "
                f"headline={r.get('headline')} "
                f"tokens prompt={r.get('prompt_tokens')} "
                f"completion={r.get('completion_tokens')} "
                f"reasoning={r.get('reasoning_tokens')}"
            )
        else:
            print(f"  FAIL {r['elapsed_s']}s status={r.get('status')} {r.get('error')}")
        print()

    out = RUN / "eval-timing.json"
    out.write_text(json.dumps(results, indent=2), encoding="utf-8")
    print(f"wrote {out}")


if __name__ == "__main__":
    main()
