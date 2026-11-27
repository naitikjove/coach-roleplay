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
session.instructions = <entire becca_mc7.actor.vA.prompt.txt>
session.audio.output.voice = shimmer
```

Keep existing NME VAD / PCM settings unless prod already differs.

## Analyzer

Same path as MC1. Model = **Opus (`claude-opus-5`)** — keep MC1 analyzer model; only swap the prompt file.

```
system = <entire becca_mc7.analyzer.vA.prompt.txt>
user = <transcript>
model = claude-opus-5   # same as MC1 — do not change
```

## Runtime ids (`scene-runtime.json`)

- `id`: `scene-mc7-becca-practice`
- `characterId`: `becca`
- `lockVersion`: `1.0.0-becca-mc7-vA-locked`
- Checklist: `cpr_review`, `dr_summary`, `gf_chloe`, `au_dylan`
- Skills: `conducting_performance_reviews`, `driving_results`, `giving_feedback`, `addressing_underperformance`
- `passThreshold`: 7
- Turn limits: min 8 · softMax 18 · hardMax 22 · absoluteMax 26

## Must Watch videos (staging handoff)

Canonical table: [`../01-frontend/VIDEO_MAPPING.md`](../01-frontend/VIDEO_MAPPING.md)

| Beat | Lesson ID | Competency id |
|---|---|---|
| A | 41981 | `conducting_performance_reviews` |
| B | 41503 | `driving_results` |
| C | 41985 | `giving_feedback` |
| D | 41984 | `addressing_underperformance` |

Also listed on `scene-runtime.json` → `mustWatchVideos`.

## Analyzer output

Fill existing staging feedback fields from the analyzer (summary, per-skill note / quotes). Do not invent new UI labels.
