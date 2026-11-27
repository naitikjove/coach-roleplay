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
session.instructions = <entire marcus_practice.actor.prompt.txt>
session.audio.output.voice = cedar
```

Keep existing NME VAD / PCM settings unless prod already differs.

## Analyzer

Same path as MC1. Model = **Opus (`claude-opus-5`)** via OpenRouter; only swap the prompt file.

```
system = <entire marcus_practice.analyzer.prompt.txt>
user = <transcript>
model = claude-opus-5   # same as MC1 — do not change
```

**Empty-output guard (as in the MC05 pack):** send `reasoning: { effort: <effort> }` on the OpenRouter request — first try `medium`, retry once with `low`; `max_tokens` = 8000. Without it Opus can spend the whole budget on hidden reasoning and return empty content.

## Runtime ids (`scene-runtime.json`)

- `id`: `scene-mc6-marcus-practice`
- `characterId`: `marcus`
- `lockVersion`: `1.0.0-marcus-practice-v4-local`
- Checklist: `slipping_followups`, `handle_calls`, `repeat_callers`
- Skills: `assessing_capabilities`, `coaching_team_members`, `sharing_knowledge`
- `passThreshold`: 7
- Turn limits: min 6 · softMax 14 · hardMax 18 · absoluteMax 22

## Must Watch videos (staging handoff)

Canonical table: [`../01-frontend/VIDEO_MAPPING.md`](../01-frontend/VIDEO_MAPPING.md)

| Lesson ID | Competency id |
|---|---|
| 41970 | `assessing_capabilities` |
| 41978 | `coaching_team_members` |
| 41975 | `sharing_knowledge` |

Also listed on `scene-runtime.json` → `mustWatchVideos`.

## Analyzer output

Fill existing staging feedback fields from the analyzer (summary, per-skill note / quotes, Try instead, next step). Do not invent new UI labels.

## Transcript order (known issue)

Realtime transcribes the learner on a separate path, so the learner line can arrive after the character’s reply. Persist turns so a learner line that arrives within ~2 s of a character line is placed **before** it; otherwise the analyzer sees the push before the answer.
