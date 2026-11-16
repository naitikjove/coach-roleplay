# Backend wiring

## Models

| Piece | Value |
|---|---|
| Actor | `gpt-realtime-2.1` |
| Voice | `cedar` |
| Analyzer | **Opus — same as MC1** (`claude-opus-5`). **Do not change** the analyzer model. |

## Realtime

```
POST https://api.openai.com/v1/realtime/client_secrets
session.model = gpt-realtime-2.1
session.instructions = <entire owen_post.actor.prompt.txt>
session.audio.output.voice = cedar
```

Keep existing NME VAD / PCM settings unless prod already differs.

## Analyzer

Same path as MC1. Model = **Opus (`claude-opus-5`)** — keep MC1 analyzer model; only swap the prompt file.

```
system = <entire owen_post.analyzer.prompt.txt>
user = <transcript>
model = claude-opus-5   # same as MC1 — do not change
```


## Runtime ids (`scene-runtime.json`)

- `id`: `scene-mc2-owen-post`
- `characterId`: `owen`
- `lockVersion`: `1.0.0-owen-post-v4.0`
- Checklist: `missed_goal`, `late_laptops`, `six_new_people`, `team_choice`
- Skills: `learning_agility`, `managing_complexity`, `leading_change`, `decision_quality`
- `passThreshold`: 7
- Turn limits: min 6 · softMax 14 · hardMax 18 · absoluteMax 22

## Must Watch videos (staging handoff)

Canonical table: [`../01-frontend/VIDEO_MAPPING.md`](../01-frontend/VIDEO_MAPPING.md)

| Lesson ID | Competency id |
|---|---|
| 41955 | `learning_agility` |
| 41952 | `managing_complexity` |
| 41954 | `leading_change` |
| 42033 | `decision_quality` |

Also listed on `scene-runtime.json` → `mustWatchVideos`.

## Analyzer output

Fill existing staging feedback fields from the analyzer (summary, per-skill note / quotes). Do not invent new UI labels.
