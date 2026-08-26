#!/usr/bin/env python3
"""One Jordan PRE 1:1 over OpenAI Realtime; print usage + USD cost."""

from __future__ import annotations

import json
import pathlib
import re
import ssl
import time
import urllib.request

try:
    import websocket  # websocket-client
except ImportError:
    raise SystemExit("pip install websocket-client")

ROOT = pathlib.Path("/Users/naitik/Documents/b2b enterprise")
MODEL = "gpt-realtime-2.1"
VOICE = "marin"

PRICES = {
    "audio_in": 32.0 / 1_000_000,
    "audio_out": 64.0 / 1_000_000,
    "text_in": 4.0 / 1_000_000,
    "text_cached": 0.40 / 1_000_000,
    "text_out": 24.0 / 1_000_000,
}

LEARNER = [
    "Yeah I saw that. First one of these is a bit weird. How are you doing with it?",
    "Okay. So the story didn't hold and the numbers got us. What actually broke — rushed, or something else?",
    "This week we still need a recovery. Tighten the narrative and make the numbers hold. Cleaner draft by Thursday?",
    "I'll review Thursday, but the rewrite stays with you. I'm not taking the deck over like we used to.",
    "Yeah I get it was faster when I jumped in. Not this time. You own the rewrite; I'll be a second pair of eyes Thursday.",
    "Before it goes back, we look together Thursday afternoon. Good enough means complete story and numbers that add up. That work?",
    "Yeah. Thursday afternoon, you bring the tightened draft, we check story and numbers, then it goes back. Thanks.",
]


def load_key() -> str:
    for p in [ROOT / "env.txt", ROOT / "env (1).txt"]:
        if not p.exists():
            continue
        for line in p.read_text().splitlines():
            m = re.match(r"^\s*OPENAI_API_KEY\s*=\s*(.+)$", line)
            if m:
                return m.group(1).strip().strip('"').strip("'")
    raise SystemExit("NO_KEY")


def load_prompt() -> str:
    return (ROOT / "b2c-ui-main/arena/exp7/prompts/jordan_presentation_quality_miss.prompt.txt").read_text()


def cost_from_usage(u: dict) -> dict:
    inp = u.get("input_token_details") or {}
    out = u.get("output_token_details") or {}
    audio_in = int(inp.get("audio_tokens") or 0)
    text_in = int(inp.get("text_tokens") or 0)
    cached = int((inp.get("cached_tokens_details") or {}).get("text_tokens") or inp.get("cached_tokens") or 0)
    audio_out = int(out.get("audio_tokens") or 0)
    text_out = int(out.get("text_tokens") or 0)
    usd = (
        audio_in * PRICES["audio_in"]
        + audio_out * PRICES["audio_out"]
        + max(0, text_in - cached) * PRICES["text_in"]
        + cached * PRICES["text_cached"]
        + text_out * PRICES["text_out"]
    )
    return {
        "audio_in": audio_in,
        "audio_out": audio_out,
        "text_in": text_in,
        "text_cached": cached,
        "text_out": text_out,
        "usd": usd,
    }


AUDIO_DELTA = (
    "response.output_audio.delta",
    "response.audio.delta",
    "response.output_audio_transcript.delta",
)

def event_type(raw: str) -> str:
    m = re.search(r'"type"\s*:\s*"([^"]+)"', raw[:240])
    return m.group(1) if m else ""


def recv_until(ws, pred, timeout=90):
    end = time.time() + timeout
    events = []
    while time.time() < end:
        raw = ws.recv()
        if isinstance(raw, bytes):
            raw = raw.decode("utf-8", "replace")
        et = event_type(raw)
        if et in AUDIO_DELTA:
            continue
        ev = json.loads(raw)
        events.append(ev)
        if pred(ev):
            return ev, events
        if ev.get("type") == "error":
            raise RuntimeError(ev)
    types = [e.get("type") for e in events]
    raise TimeoutError(f"timeout waiting; saw {types}")


def main() -> None:
    key = load_key()
    prompt = load_prompt()
    url = f"wss://api.openai.com/v1/realtime?model={MODEL}"
    ws = websocket.create_connection(
        url,
        header=[f"Authorization: Bearer {key}"],
        timeout=60,
    )

    recv_until(ws, lambda e: e.get("type") == "session.created")
    ws.send(
        json.dumps(
            {
                "type": "session.update",
                "session": {
                    "type": "realtime",
                    "instructions": prompt,
                    "output_modalities": ["audio"],
                    "audio": {
                        "input": {
                            "format": {"type": "audio/pcm", "rate": 24000},
                            "turn_detection": None,
                        },
                        "output": {
                            "voice": VOICE,
                            "format": {"type": "audio/pcm", "rate": 24000},
                        },
                    },
                },
            }
        )
    )
    recv_until(ws, lambda e: e.get("type") == "session.updated")

    totals = {
        "audio_in": 0,
        "audio_out": 0,
        "text_in": 0,
        "text_cached": 0,
        "text_out": 0,
        "usd": 0.0,
    }
    lines: list[tuple[str, str]] = []

    def run_response() -> str:
        ws.send(json.dumps({"type": "response.create"}))
        done, evs = recv_until(ws, lambda e: e.get("type") == "response.done", timeout=180)
        usage = (done.get("response") or {}).get("usage") or {}
        c = cost_from_usage(usage)
        print(
            f"  usage audio_in={c['audio_in']} audio_out={c['audio_out']} "
            f"text_in={c['text_in']} text_out={c['text_out']} usd=${c['usd']:.4f}",
            flush=True,
        )
        for k in totals:
            if k == "usd":
                totals[k] += c[k]
            else:
                totals[k] += c[k]
        text = ""
        for e in evs:
            if e.get("type") in (
                "response.output_audio_transcript.done",
                "response.audio_transcript.done",
            ):
                text = e.get("transcript") or text
            if e.get("type") == "response.output_text.done":
                text = e.get("text") or text
        if not text:
            # pull from response.done output
            for item in (done.get("response") or {}).get("output") or []:
                for part in item.get("content") or []:
                    if part.get("transcript"):
                        text = part["transcript"]
                    if part.get("text"):
                        text = part["text"]
        return text.strip()

    jordan = run_response()
    lines.append(("JORDAN", jordan))
    print("JORDAN:", jordan, flush=True)

    for i, learner in enumerate(LEARNER, 1):
        ws.send(
            json.dumps(
                {
                    "type": "conversation.item.create",
                    "item": {
                        "type": "message",
                        "role": "user",
                        "content": [{"type": "input_text", "text": learner}],
                    },
                }
            )
        )
        jordan = run_response()
        lines.append(("ME", learner))
        lines.append(("JORDAN", jordan))
        print(f"ME {i}:", learner, flush=True)
        print(f"JORDAN {i}:", jordan, flush=True)

    ws.close()

    # OpenAI: 1 audio-in token / 100ms, 1 audio-out token / 50ms.
    jordan_sec = totals["audio_out"] / 20 if totals["audio_out"] else 0
    learner_chars = sum(len(t) for r, t in lines if r == "ME")
    learner_sec = max(8, learner_chars / 13)  # ~13 chars/sec speech
    extra_audio_in = int(learner_sec * 10)
    voice_usd = totals["usd"] + extra_audio_in * PRICES["audio_in"]

    print("\n=== USAGE (this run: text learner + audio Jordan) ===")
    print(json.dumps({k: round(v, 6) if k == "usd" else v for k, v in totals.items()}, indent=2))
    print(f"USD this run (typed learner): ${totals['usd']:.4f}")
    print(f"USD estimate if learner also spoke (~{learner_sec:.0f}s in): ${voice_usd:.4f}")
    print(f"Jordan audio tokens: {totals['audio_out']} (~{jordan_sec:.0f}s at 20 tok/s)")


if __name__ == "__main__":
    main()
