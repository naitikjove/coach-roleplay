"""Replay the exp7 coverage judge over each turn prefix of a saved session.

Reconstructs when each objective marker would flip, using the same judge
instructions as src/lib/arena/exp7/coverageJudge.ts. The live judge runs on
gpt-realtime-2.1 in text mode; this replay approximates with a text model.
"""

from __future__ import annotations

import json
import sys
import urllib.request
from pathlib import Path

ROOT = Path("/Users/naitik/Documents/b2b enterprise")
RUN = ROOT / "b2c-ui-main/.exp7-runs" / (
    sys.argv[1] if len(sys.argv) > 1 else "89b4b6d0-6153-45d7-924b-7fcf427e0fd8"
)
MODEL = "gpt-4.1"

CRITERIA = [
    "What happened with the rejected client presentation was explained, and the manager engaged with it (asked, acknowledged, or responded to the substance).",
    "A concrete path or timing for the deck this week was expressed by either person and acknowledged by the other (e.g. when it moves, or who sees it before leadership).",
    "It is now clear who does the rewrite, after any back-and-forth about helping resolved. Merely asking for help does not count; the matter must have settled.",
    "Who will be present or represent the work in the leadership conversation was decided (not merely raised or offered).",
]

JUDGE = "\n".join(
    [
        "You are silently auditing this workplace 1:1 for a training tool. Do not speak to anyone; produce data only.",
        "",
        "For each item below, answer true only if it has GENUINELY been resolved in the conversation so far — both people engaged and the matter moved. A topic being mentioned once is NOT enough.",
        "If you are not sure, answer false — you will see more of the conversation next time. Never guess true.",
        "",
        "\n".join(f"{i + 1}. {c}" for i, c in enumerate(CRITERIA)),
        "",
        'Output ONLY this JSON object, nothing else: {"1":boolean,"2":boolean,"3":boolean,"4":boolean}',
    ]
)


def load_key() -> str:
    for line in (ROOT / "env.txt").read_text(encoding="utf-8-sig").splitlines():
        if line.strip().startswith("OPENAI_API_KEY") and "=" in line:
            return line.split("=", 1)[1].strip().strip('"').strip("'")
    raise RuntimeError("no OPENAI_API_KEY in env.txt")


def load_turns() -> list[dict]:
    turns = []
    for line in (RUN / "turns.jsonl").read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        row = json.loads(line)
        text = (row.get("learnerText") or "").strip()
        if text:
            turns.append({"role": "learner", "text": text, "ts": row["ts"]})
        text = (row.get("characterText") or "").strip()
        if text:
            turns.append({"role": "claire", "text": text, "ts": row["ts"]})
    return turns


def judge(key: str, convo: list[dict]) -> dict:
    lines = [
        ("Manager (learner): " if t["role"] == "learner" else "Claire (report): ") + t["text"]
        for t in convo
    ]
    payload = {
        "model": MODEL,
        "temperature": 0,
        "response_format": {"type": "json_object"},
        "messages": [
            {"role": "system", "content": JUDGE},
            {"role": "user", "content": "CONVERSATION SO FAR:\n" + "\n".join(lines)},
        ],
    }
    req = urllib.request.Request(
        "https://api.openai.com/v1/chat/completions",
        data=json.dumps(payload).encode(),
        headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=60) as resp:
        body = json.loads(resp.read())
    return json.loads(body["choices"][0]["message"]["content"])


def main() -> None:
    key = load_key()
    turns = load_turns()
    committed: dict[str, int | None] = {"1": None, "2": None, "3": None, "4": None}
    claire_count = 0

    print(f"session: {RUN.name}  turns: {len(turns)}  model: {MODEL}\n")
    for idx, turn in enumerate(turns):
        if turn["role"] != "claire":
            continue
        claire_count += 1
        if claire_count < 2:  # live judge skips Claire's opener
            continue
        verdict = judge(key, turns[: idx + 1])
        flips = []
        for k in ("1", "2", "3", "4"):
            if verdict.get(k) and committed[k] is None:
                committed[k] = idx
                flips.append(k)
        state = "".join("#" if verdict.get(k) else "." for k in ("1", "2", "3", "4"))
        note = f"  << obj {','.join(flips)} committed" if flips else ""
        print(f"after line {idx:2d} ({turn['ts'][11:19]}) [{state}] {turn['text'][:70]!r}{note}")

    print("\nfirst committed at line (monotonic, as the UI would show):")
    for k in ("1", "2", "3", "4"):
        line = committed[k]
        where = f"line {line}: {turns[line]['text'][:80]!r}" if line is not None else "never"
        print(f"  objective {k}: {where}")


if __name__ == "__main__":
    main()
