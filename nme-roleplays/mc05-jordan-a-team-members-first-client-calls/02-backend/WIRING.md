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
session.instructions = <entire jordan_first_calls.actor.vA.prompt.txt>
session.audio.output.voice = verse
```

Keep existing NME VAD / PCM settings unless prod already differs.

## Analyzer

Same path as MC1. Model = **Opus (`claude-opus-5`)** via OpenRouter; only swap the prompt file.

```
system = <entire jordan_first_calls.analyzer.vA.prompt.txt>
user = <transcript>
model = claude-opus-5   # same as MC1 — do not change
```

**Empty-output guard (required for Opus):** send `reasoning: { effort: <effort> }` on the OpenRouter request — first try `medium`, retry once with `low`. Without it Opus can spend the whole 8000-token budget on hidden reasoning and return empty content (seen on real transcripts). `max_tokens` = 8000.

## Runtime ids (`scene-runtime.json`)

- `id`: `scene-mc5-first-calls-practice`
- `characterId`: `jordan5`
- `lockVersion`: `1.1.0-jordan-first-calls-locked-local`
- Checklist: `calls_next_step`, `change_requests`, `after_call_note`
- Skills: `ensuring_accountability`, `effective_delegation`, `expectations_setting`
- `passThreshold`: 7
- Turn limits: min 6 · softMax 14 · hardMax 18 · absoluteMax 22

## Must Watch videos (staging handoff)

Canonical table: [`../01-frontend/VIDEO_MAPPING.md`](../01-frontend/VIDEO_MAPPING.md)

| Lesson ID | Competency id |
|---|---|
| 41968 | `ensuring_accountability` |
| 41963 | `effective_delegation` |
| 41966 | `expectations_setting` |

Also listed on `scene-runtime.json` → `mustWatchVideos`.

## Analyzer output

Fill existing staging feedback fields from the analyzer (summary, per-skill note / quotes, Try instead, next step). Do not invent new UI labels.

## Transcript order (known issue)

Realtime transcribes the learner on a separate path, so the learner line can arrive after the character’s reply. Persist turns so a learner line that arrives within ~2 s of a character line is placed **before** it; otherwise the analyzer sees the push before the answer.
