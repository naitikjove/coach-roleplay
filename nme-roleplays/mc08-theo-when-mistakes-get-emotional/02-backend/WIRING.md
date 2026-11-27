# Backend wiring

## Models

| Piece | Value |
|---|---|
| Actor | `gpt-realtime-2.1` |
| Voice | `ash` |
| Analyzer | **Opus — same as MC1** (`claude-opus-5`). **Do not change** the analyzer model. |

QA note: all QA runs in this pack used a text harness with Sonnet for the simulated learner and the analyzer. Re-check scores on Opus before sign-off.

## Realtime

```
POST https://api.openai.com/v1/realtime/client_secrets
session.model = gpt-realtime-2.1
session.instructions = <entire theo_late_report.actor.vA.prompt.txt>
session.audio.output.voice = ash
```

Keep existing NME VAD / PCM settings unless prod already differs.

## Analyzer

Same path as MC1. Model = **Opus (`claude-opus-5`)**; only swap the prompt file.

```
system = <entire theo_late_report.analyzer.vA.prompt.txt>
user = <transcript>
model = claude-opus-5   # same as MC1 — do not change
```

The analyzer returns JSON only (no markdown fences). Reasoning/token limits: leave headroom (the JSON includes per-goal evidence); the QA harness used `max_tokens` 9000.

## Runtime ids (`scene-runtime.json`)

- `id`: `scene-mc8-theo-practice`
- `characterId`: `theo`
- `lockVersion`: `1.1.0-theo-late-report-vA-local`
- Checklist: `client_reply`, `devon_talk`
- Skills: `managing_emotions`, `demonstrating_awareness`
- `passThreshold`: 7
- Turn limits: min 5 · softMax 12 · hardMax 16 · absoluteMax 20

## Must Watch videos (staging handoff)

Canonical table: [`../01-frontend/VIDEO_MAPPING.md`](../01-frontend/VIDEO_MAPPING.md)

| Lesson ID | Competency id |
|---|---|
| 41989 | `managing_emotions` |
| 41995 | `demonstrating_awareness` |

Also listed on `scene-runtime.json` → `mustWatchVideos`.

## Analyzer output

Fill existing staging feedback fields from the analyzer (`summary`, per-skill `note` / `youSaid` / `tryInstead`, `nextStep`). Do not invent new UI labels. The JSON also carries a per-goal `evidence` block (`said`, `missing`, ...), which is internal and not shown.

## Objective tracking + How it went

See [`OBJECTIVE_TRACKING.md`](OBJECTIVE_TRACKING.md).
