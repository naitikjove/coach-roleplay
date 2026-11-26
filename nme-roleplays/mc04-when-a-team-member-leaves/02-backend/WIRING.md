# Backend wiring

## Models

| Piece | Value |
|---|---|
| Actor | `gpt-realtime-2.1` |
| Voice | `shimmer` |
| Analyzer | **Opus — same as MC1** (`claude-opus-5`). **Do not change** the analyzer model. |

## Realtime

```
POST https://api.openai.com/v1/realtime/client_secrets
session.model = gpt-realtime-2.1
session.instructions = <entire rebecca_lucas_post.actor.prompt.txt>
session.audio.output.voice = shimmer
```

Keep existing NME VAD / PCM settings unless prod already differs.

## Analyzer

Same path as MC1. Model = **Opus (`claude-opus-5`)** — keep MC1 analyzer model; only swap the prompt file.

```
system = <entire rebecca_lucas_post.analyzer.prompt.txt>
user = <transcript>
model = claude-opus-5   # same as MC1 — do not change
```

## Runtime ids (`scene-runtime.json`)

- `id`: `scene-mc4-lucas-post`
- `characterId`: `rebecca`
- `lockVersion`: `1.0.0-rebecca-lucas-post-actor-v4-analyzer-v3`
- Checklist: `lucas_jobs`, `client_contact`, `interviews`
- Skills: `building_effective_teams`, `managing_stakeholders`, `attracting_top_talent`
- `passThreshold`: 7
- Turn limits: min 5 · softMax 14 · hardMax 18 · absoluteMax 22

## Must Watch videos (staging handoff)

Canonical table: [`../01-frontend/VIDEO_MAPPING.md`](../01-frontend/VIDEO_MAPPING.md)

| Lesson ID | Competency id |
|---|---|
| 42026 | `building_effective_teams` |
| 42029 | `managing_stakeholders` |
| 42027 | `attracting_top_talent` |

Also listed on `scene-runtime.json` → `mustWatchVideos`.

## Analyzer output

Fill existing staging feedback fields from the analyzer (summary, per-skill note / quotes). Do not invent new UI labels.
