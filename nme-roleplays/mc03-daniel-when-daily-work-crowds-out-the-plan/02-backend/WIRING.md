# Backend wiring

## Models

| Piece | Value |
|---|---|
| Actor | `gpt-realtime-2.1` |
| Voice | `ash` |
| Analyzer | **Opus — same as MC1** (`claude-opus-5`). **Do not change** the analyzer model. |

## Realtime

```
POST https://api.openai.com/v1/realtime/client_secrets
session.model = gpt-realtime-2.1
session.instructions = <entire daniel_post.actor.prompt.txt>
session.audio.output.voice = ash
```

Keep existing NME VAD / PCM settings unless prod already differs.

## Analyzer

Same path as MC1. Model = **Opus (`claude-opus-5`)** — keep MC1 analyzer model; only swap the prompt file.

```
system = <entire daniel_post.analyzer.prompt.txt>
user = <transcript>
model = claude-opus-5   # same as MC1 — do not change
```

## Runtime ids (`scene-runtime.json`)

- `id`: `scene-mc3-daniel-post`
- `characterId`: `daniel`
- `lockVersion`: `1.0.0-daniel-post-v1.0`
- Checklist: `templates_plan`, `newer_designers`, `templates_working`
- Skills: `setting_goals`, `setting_expectations`, `measuring_results`
- `passThreshold`: 7
- Turn limits: min 5 · softMax 12 · hardMax 16 · absoluteMax 20

## Must Watch videos (staging handoff)

Canonical table: [`../01-frontend/VIDEO_MAPPING.md`](../01-frontend/VIDEO_MAPPING.md)

| Lesson ID | Competency id |
|---|---|
| 41961 | `setting_goals` |
| 41959 | `setting_expectations` |
| 41746 | `measuring_results` |

Also listed on `scene-runtime.json` → `mustWatchVideos`.

## Analyzer output

Fill existing staging feedback fields from the analyzer (summary, per-skill note / quotes). Do not invent new UI labels.

## Objective tracking + How it went

Full mid-call coverage criteria, G1 map, and How it went field mapping:  
[`OBJECTIVE_TRACKING.md`](OBJECTIVE_TRACKING.md)
