# Backend wiring

## Models

| Piece | Value |
|---|---|
| Actor | `gpt-realtime-2.1` |
| Voice | `verse` |
| Analyzer | **Opus — same as MC1** (`claude-opus-5`). **Do not change** the analyzer model. |

## Realtime

```
POST https://api.openai.com/v1/realtime/client_secrets
session.model = gpt-realtime-2.1
session.instructions = <entire ethan_next_month.actor.vA.prompt.txt>
session.audio.output.voice = verse
```

Keep existing NME VAD / PCM settings unless prod already differs.

## Analyzer

Same path as MC1. Model = **Opus (`claude-opus-5`)** — keep MC1 analyzer model; only swap the prompt file.

```
system = <entire ethan_next_month.analyzer.vA.prompt.txt>
user = <transcript>
model = claude-opus-5   # same as MC1 — do not change
```

## Runtime ids (`scene-runtime.json`)

- `id`: `scene-mc3-rachel-practice` (**legacy rachel id** — keep for wiring; character is Ethan)
- `characterId`: `ethan`
- `lockVersion`: `1.0.0-ethan-practice-vA.1.1`
- Checklist: `gs_next_month`, `es_slow_reply`, `mmw_tracking`
- Skills: `setting_goals`, `setting_expectations`, `measuring_results`
- `passThreshold`: 7
- Turn limits: min 6 · softMax 14 · hardMax 18 · absoluteMax 22

## Must Watch videos (staging handoff)

Canonical table: [`../01-frontend/VIDEO_MAPPING.md`](../01-frontend/VIDEO_MAPPING.md)

| Lesson ID | Competency id |
|---|---|
| 41956 | `setting_goals` |
| 41958 | `setting_goals` |
| 41959 | `setting_expectations` |
| 41746 | `measuring_results` |

Also listed on `scene-runtime.json` → `mustWatchVideos`.

## Analyzer output

Fill existing staging feedback fields from the analyzer (summary, per-skill note / quotes). Do not invent new UI labels.

## Objective tracking + How it went

Full mid-call coverage criteria, G1 map, and How it went field mapping:  
[`OBJECTIVE_TRACKING.md`](OBJECTIVE_TRACKING.md)
