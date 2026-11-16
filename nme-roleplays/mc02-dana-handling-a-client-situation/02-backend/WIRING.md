# Backend wiring

## Models

| Piece | Value |
|---|---|
| Actor | `gpt-realtime-2.1` |
| Voice | `sage` |
| Analyzer | Same Chat Completions model as other NME roleplays (e.g. `gpt-5.6-terra`) |

## Realtime

```
POST https://api.openai.com/v1/realtime/client_secrets
session.model = gpt-realtime-2.1
session.instructions = <entire dana_brightway.actor.vB.prompt.txt>
session.audio.output.voice = sage
```

Keep existing NME VAD / PCM settings unless prod already differs.

## Analyzer

```
POST /v1/chat/completions
messages = [
  { role: "system", content: <entire dana_brightway.analyzer.vB.prompt.txt> },
  { role: "user", content: <transcript> }
]
response_format = { type: "json_object" }
```

Feedback payload must still expose: How it went / You said / Try instead / Your next step.  
**Try instead** = ideal quote to Dana (not habit essays).

## Runtime ids (`scene-runtime.json`)

- `id`: `scene-mc2-dana-brightway-practice`
- `characterId`: `dana`
- `lockVersion`: `2.0.0-dana-brightway-vB-final`
- Checklist: `la_weekend_catch_up`, `mc_missed_request`, `lc_new_dashboard`, `dq_dashboard_owner`
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
| 41953 | `decision_quality` |

Also listed on `scene-runtime.json` → `mustWatchVideos`.

## Analyzer output

Fill existing staging feedback fields from the analyzer (summary, per-skill note / quotes). Do not invent new UI labels.
