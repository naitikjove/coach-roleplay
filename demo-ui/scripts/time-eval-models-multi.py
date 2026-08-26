#!/usr/bin/env python3
"""Multi-model evaluation race for Exp7 Jordan PRE analyzer.

Runs the SAME system + user payload (saved analyzer-input.txt) across models.
Measures latency and score agreement. Does not touch Vercel.

Usage:
  OPENAI_API_KEY=... OPENROUTER_API_KEY=... \\
    python3 time-eval-models-multi.py [--sessions id1,id2] [--models a,b]

Defaults: 5 recent Jordan PRE sessions with ≥10 learner turns;
models: gpt-5.6-terra, o3, anthropic/claude-sonnet-4.6 (OpenRouter).
"""

from __future__ import annotations

import argparse
import json
import os
import statistics
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path("/Users/naitik/Documents/b2b enterprise")
UI = ROOT / "b2c-ui-main"
RUNS = UI / ".exp7-runs"
SYSTEM_PROMPT = (
    UI / "arena/exp7/prompts/jordan_presentation_quality_miss_analyzer.prompt.txt"
)
OUT_DIR = UI / ".exp7-runs" / "_eval-bench"

# Manual rubric estimate for the session we already audited (accuracy anchor).
# Approximate competency totals out of 10; overall ~52–55%.
MANUAL_ANCHORS: dict[str, dict] = {
    "f92ad272-f9cb-4067-a5c3-e1c0b28e4cdf": {
        "building_trust": 4,
        "expectation_setting": 6.5,
        "delegation": 3,
        "accountability": 8,
        "percent": 54,  # ~21.5/40
        "note": "Human-rubric estimate from prior audit",
    },
}

DEFAULT_MODELS = [
    {"id": "gpt-5.6-terra", "provider": "openai", "effort": "medium"},
    {"id": "o3", "provider": "openai", "effort": "medium"},
    {
        "id": "anthropic/claude-sonnet-4.6",
        "provider": "openrouter",
        "effort": None,  # Claude via OpenRouter: no OpenAI reasoning_effort
    },
]


def load_openai_key() -> str:
    if os.environ.get("OPENAI_API_KEY"):
        return os.environ["OPENAI_API_KEY"]
    for line in (ROOT / "env.txt").read_text(encoding="utf-8-sig").splitlines():
        if line.strip().startswith("OPENAI_API_KEY") and "=" in line:
            return line.split("=", 1)[1].strip().strip('"').strip("'")
    raise RuntimeError("OPENAI_API_KEY missing")


def load_openrouter_key() -> str:
    key = os.environ.get("OPENROUTER_API_KEY", "").strip()
    if not key:
        raise RuntimeError("OPENROUTER_API_KEY missing")
    return key


def pick_sessions(limit: int = 5, min_learners: int = 10) -> list[str]:
    rows: list[tuple[float, str, int]] = []
    for d in RUNS.iterdir():
        if not d.is_dir() or d.name.startswith("_"):
            continue
        ai = d / "analyzer-input.txt"
        if not ai.exists():
            continue
        text = ai.read_text(encoding="utf-8")
        # Prefer Jordan PRE analyzer inputs (Claire: lines)
        if "Claire:" not in text:
            continue
        learners = text.count("Learner:")
        if learners < min_learners:
            continue
        rows.append((d.stat().st_mtime, d.name, learners))
    rows.sort(reverse=True)
    return [r[1] for r in rows[:limit]]


def call_chat(
    *,
    provider: str,
    model: str,
    system: str,
    user: str,
    effort: str | None,
) -> dict:
    if provider == "openai":
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {load_openai_key()}",
            "Content-Type": "application/json",
        }
        payload: dict = {
            "model": model,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            "max_completion_tokens": 12_000,
            "response_format": {"type": "json_object"},
        }
        if effort:
            payload["reasoning_effort"] = effort
    elif provider == "openrouter":
        url = "https://openrouter.ai/api/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {load_openrouter_key()}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://jove-exp7-pre-post.vercel.app",
            "X-Title": "JoVE Exp7 Eval Bench",
        }
        # Claude: put rubric in system; force JSON via instruction + response_format
        # when supported. OpenRouter forwards response_format for many models.
        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": system},
                {
                    "role": "user",
                    "content": user
                    + "\n\nReturn ONLY valid JSON matching the required schema. No markdown.",
                },
            ],
            "max_tokens": 12_000,
            "temperature": 0,
            "response_format": {"type": "json_object"},
        }
    else:
        raise ValueError(provider)

    req = urllib.request.Request(
        url, data=json.dumps(payload).encode(), headers=headers, method="POST"
    )
    t0 = time.perf_counter()
    try:
        with urllib.request.urlopen(req, timeout=360) as resp:
            body = json.loads(resp.read().decode())
            status = resp.status
    except urllib.error.HTTPError as e:
        err = e.read().decode("utf-8", errors="replace")
        # Retry OpenRouter once without response_format if rejected
        if provider == "openrouter" and "response_format" in err.lower():
            payload.pop("response_format", None)
            req2 = urllib.request.Request(
                url, data=json.dumps(payload).encode(), headers=headers, method="POST"
            )
            try:
                with urllib.request.urlopen(req2, timeout=360) as resp:
                    body = json.loads(resp.read().decode())
                    status = resp.status
            except urllib.error.HTTPError as e2:
                elapsed = round(time.perf_counter() - t0, 2)
                return {
                    "ok": False,
                    "status": e2.code,
                    "elapsed_s": elapsed,
                    "error": e2.read().decode("utf-8", errors="replace")[:1000],
                }
        else:
            elapsed = round(time.perf_counter() - t0, 2)
            return {
                "ok": False,
                "status": e.code,
                "elapsed_s": elapsed,
                "error": err[:1000],
            }

    elapsed = round(time.perf_counter() - t0, 2)
    choice = (body.get("choices") or [{}])[0]
    content = ((choice.get("message") or {}).get("content") or "").strip()
    # Strip markdown fences if any
    if content.startswith("```"):
        content = content.strip("`")
        if content.lower().startswith("json"):
            content = content[4:].lstrip()
    usage = body.get("usage") or {}
    parsed = None
    try:
        # Extract first JSON object if wrapped
        start = content.find("{")
        end = content.rfind("}")
        if start >= 0 and end > start:
            parsed = json.loads(content[start : end + 1])
    except json.JSONDecodeError:
        parsed = None

    comps = (parsed or {}).get("competencies") or {}
    return {
        "ok": bool(parsed),
        "status": status,
        "elapsed_s": elapsed,
        "finish_reason": choice.get("finish_reason"),
        "score": (parsed or {}).get("score"),
        "percent": (parsed or {}).get("percent"),
        "headline": (parsed or {}).get("headline"),
        "sumScore": (parsed or {}).get("sumScore"),
        "summary": (parsed or {}).get("summary"),
        "competencies": {
            k: {
                "score": (comps.get(k) or {}).get("score"),
                "level": (comps.get(k) or {}).get("level"),
            }
            for k in (
                "building_trust",
                "expectation_setting",
                "delegation",
                "accountability",
            )
        },
        "prompt_tokens": usage.get("prompt_tokens") or usage.get("promptTokens"),
        "completion_tokens": usage.get("completion_tokens")
        or usage.get("completionTokens"),
        "reasoning_tokens": (
            (usage.get("completion_tokens_details") or {}).get("reasoning_tokens")
        ),
        "total_tokens": usage.get("total_tokens") or usage.get("totalTokens"),
        "raw_preview": (content[:200] if content else ""),
        "error": None if parsed else "unparsable/empty",
        "parsed": parsed,
    }


def mae_vs_anchor(result: dict, anchor: dict) -> float | None:
    if not result.get("ok"):
        return None
    errs = []
    for k in (
        "building_trust",
        "expectation_setting",
        "delegation",
        "accountability",
    ):
        pred = ((result.get("competencies") or {}).get(k) or {}).get("score")
        if pred is None:
            return None
        errs.append(abs(float(pred) - float(anchor[k])))
    return round(statistics.mean(errs), 2)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--sessions", default="", help="comma-separated session ids")
    ap.add_argument("--limit", type=int, default=5)
    ap.add_argument("--min-learners", type=int, default=10)
    args = ap.parse_args()

    sessions = (
        [s.strip() for s in args.sessions.split(",") if s.strip()]
        if args.sessions
        else pick_sessions(args.limit, args.min_learners)
    )
    # Always include the human-audited session if present
    anchor_id = next(iter(MANUAL_ANCHORS))
    if anchor_id not in sessions and (RUNS / anchor_id / "analyzer-input.txt").exists():
        sessions = [anchor_id] + [s for s in sessions if s != anchor_id]
        sessions = sessions[: max(args.limit, 1)]

    system = SYSTEM_PROMPT.read_text(encoding="utf-8")
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    out_path = OUT_DIR / f"bench-{stamp}.json"

    print(f"sessions ({len(sessions)}):")
    for s in sessions:
        ai = RUNS / s / "analyzer-input.txt"
        learners = ai.read_text().count("Learner:") if ai.exists() else 0
        print(f"  {s[:8]}…  learners={learners}")
    print(f"models: {[m['id'] for m in DEFAULT_MODELS]}")
    print()

    results: dict = {"ts": stamp, "sessions": {}, "summary": {}}

    for sid in sessions:
        user = (RUNS / sid / "analyzer-input.txt").read_text(encoding="utf-8")
        results["sessions"][sid] = {
            "learner_lines": user.count("Learner:"),
            "user_chars": len(user),
            "models": {},
        }
        print(f"══ session {sid[:8]} ({user.count('Learner:')} learner lines) ══")
        for m in DEFAULT_MODELS:
            mid = m["id"]
            print(f"  → {mid} …", flush=True)
            r = call_chat(
                provider=m["provider"],
                model=mid,
                system=system,
                user=user,
                effort=m.get("effort"),
            )
            # Drop huge parsed from console summary but keep in file
            slim = {k: v for k, v in r.items() if k != "parsed"}
            results["sessions"][sid]["models"][mid] = r
            if r.get("ok"):
                comps = r.get("competencies") or {}
                print(
                    f"    {r['elapsed_s']}s  score={r.get('score')} "
                    f"percent={r.get('percent')} headline={r.get('headline')}  "
                    f"trust={comps.get('building_trust', {}).get('score')} "
                    f"goals={comps.get('expectation_setting', {}).get('score')} "
                    f"deleg={comps.get('delegation', {}).get('score')} "
                    f"acct={comps.get('accountability', {}).get('score')}"
                )
            else:
                print(f"    FAIL {r.get('elapsed_s')}s {r.get('status')} {r.get('error')}")
        print()

    # Aggregate latency + agreement
    by_model: dict[str, list] = {m["id"]: [] for m in DEFAULT_MODELS}
    for sid, pack in results["sessions"].items():
        for mid, r in pack["models"].items():
            if r.get("ok"):
                by_model[mid].append(r)

    summary_models = {}
    for mid, rows in by_model.items():
        if not rows:
            summary_models[mid] = {"n": 0}
            continue
        lat = [r["elapsed_s"] for r in rows]
        perc = [r["percent"] for r in rows if r.get("percent") is not None]
        # Accuracy vs human anchor (only for sessions that have one)
        maes = []
        for sid, pack in results["sessions"].items():
            if sid in MANUAL_ANCHORS and mid in pack["models"]:
                mae = mae_vs_anchor(pack["models"][mid], MANUAL_ANCHORS[sid])
                if mae is not None:
                    maes.append(mae)
        summary_models[mid] = {
            "n": len(rows),
            "latency_mean_s": round(statistics.mean(lat), 2),
            "latency_median_s": round(statistics.median(lat), 2),
            "latency_min_s": min(lat),
            "latency_max_s": max(lat),
            "percent_mean": round(statistics.mean(perc), 1) if perc else None,
            "percent_stdev": round(statistics.pstdev(perc), 1) if len(perc) > 1 else 0,
            "anchor_mae_competency": maes[0] if maes else None,
            "anchor_percent_delta": (
                abs(pack_models_percent(results, mid) - MANUAL_ANCHORS[anchor_id]["percent"])
                if anchor_id in results["sessions"]
                and results["sessions"][anchor_id]["models"].get(mid, {}).get("percent")
                is not None
                else None
            ),
        }

    # Cross-model agreement on percent (pairwise mean abs diff across sessions)
    ids = [m["id"] for m in DEFAULT_MODELS]
    pairwise = {}
    for i, a in enumerate(ids):
        for b in ids[i + 1 :]:
            diffs = []
            for sid, pack in results["sessions"].items():
                pa = pack["models"].get(a, {}).get("percent")
                pb = pack["models"].get(b, {}).get("percent")
                if pa is not None and pb is not None:
                    diffs.append(abs(pa - pb))
            pairwise[f"{a} vs {b}"] = {
                "mean_abs_percent_diff": round(statistics.mean(diffs), 1) if diffs else None,
                "n": len(diffs),
            }

    results["summary"] = {
        "models": summary_models,
        "pairwise_percent_agreement": pairwise,
        "manual_anchors": MANUAL_ANCHORS,
    }

    # Slim file for readability: keep parsed only under sessions
    out_path.write_text(json.dumps(results, indent=2), encoding="utf-8")
    # Also write a short markdown table
    md = OUT_DIR / f"bench-{stamp}.md"
    lines = [
        f"# Exp7 eval bench — {stamp}",
        "",
        f"Sessions: {len(sessions)} · System prompt: jordan_presentation_quality_miss_analyzer",
        "",
        "## Latency & scores",
        "",
        "| Model | n | mean s | median s | mean % | anchor MAE (comp) | |Δ%| vs human |",
        "|---|---:|---:|---:|---:|---:|---:|",
    ]
    for mid, s in summary_models.items():
        if not s.get("n"):
            lines.append(f"| {mid} | 0 | — | — | — | — | — |")
            continue
        lines.append(
            f"| `{mid}` | {s['n']} | {s['latency_mean_s']} | {s['latency_median_s']} | "
            f"{s['percent_mean']} | {s.get('anchor_mae_competency')} | "
            f"{s.get('anchor_percent_delta')} |"
        )
    lines += ["", "## Pairwise % agreement", ""]
    for k, v in pairwise.items():
        lines.append(f"- **{k}**: mean |Δ%| = {v['mean_abs_percent_diff']} (n={v['n']})")
    lines += ["", "## Per-session detail", ""]
    for sid, pack in results["sessions"].items():
        lines.append(f"### `{sid[:8]}` ({pack['learner_lines']} learner lines)")
        lines.append("")
        lines.append("| Model | s | score | % | trust | goals | deleg | acct |")
        lines.append("|---|---:|---:|---:|---:|---:|---:|---:|")
        for mid, r in pack["models"].items():
            if not r.get("ok"):
                lines.append(f"| `{mid}` | {r.get('elapsed_s')} | FAIL | | | | | |")
                continue
            c = r.get("competencies") or {}
            lines.append(
                f"| `{mid}` | {r['elapsed_s']} | {r.get('score')} | {r.get('percent')} | "
                f"{c.get('building_trust', {}).get('score')} | "
                f"{c.get('expectation_setting', {}).get('score')} | "
                f"{c.get('delegation', {}).get('score')} | "
                f"{c.get('accountability', {}).get('score')} |"
            )
        lines.append("")
    md.write_text("\n".join(lines) + "\n", encoding="utf-8")

    print("══ SUMMARY ══")
    for mid, s in summary_models.items():
        print(f"{mid}: {s}")
    print(f"\nwrote {out_path}")
    print(f"wrote {md}")


def pack_models_percent(results: dict, mid: str) -> float:
    anchor_id = next(iter(MANUAL_ANCHORS))
    return float(results["sessions"][anchor_id]["models"][mid]["percent"])


if __name__ == "__main__":
    main()
