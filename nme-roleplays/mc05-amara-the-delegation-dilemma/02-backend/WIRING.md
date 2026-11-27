# Backend wiring

## Models

| Piece | Value |
|---|---|
| Actor | `gpt-realtime-2.1` |
| Voice | `ballad` |
| Analyzer | **Opus — same as MC1** (`claude-opus-5`). **Do not change** the analyzer model. |

## Realtime

```
POST https://api.openai.com/v1/realtime/client_secrets
session.model = gpt-realtime-2.1
session.instructions = <entire amara_mc5_cert.actor.vA.prompt.txt>
session.audio.output.voice = ballad
```

Keep existing NME VAD / PCM settings unless prod already differs.

## Analyzer

Same path as MC1. Model = **Opus (`claude-opus-5`)** via OpenRouter; only swap the prompt file.

```
system = <entire amara_mc5_cert.analyzer.vA.prompt.txt>
user = <transcript>
model = claude-opus-5   # same as MC1 — do not change
```

**Empty-output guard (required for Opus):** send `reasoning: { effort: <effort> }` on the OpenRouter request — first try `medium`, retry once with `low`. Without it Opus can spend the whole 8000-token budget on hidden reasoning and return empty content (seen on real transcripts). `max_tokens` = 8000.

## Runtime ids (`scene-runtime.json`)

- `id`: `scene-mc5-amara-post`
- `characterId`: `amara`
- `lockVersion`: `1.1.0-amara-delegation-dilemma-locked-local`
- Checklist: `who_takes_request`, `keep_track`, `thank_dev`
- Skills: `effective_delegation`, `ensuring_accountability`, `recognizing_contributions`
- `passThreshold`: 7
- Turn limits: min 6 · softMax 14 · hardMax 18 · absoluteMax 22

## Must Watch videos (staging handoff)

Canonical table: [`../01-frontend/VIDEO_MAPPING.md`](../01-frontend/VIDEO_MAPPING.md)

| Lesson ID | Competency id |
|---|---|
| 41965 | `effective_delegation` |
| 41967 | `ensuring_accountability` |
| 41969 | `recognizing_contributions` |

Also listed on `scene-runtime.json` → `mustWatchVideos`.

## Analyzer output

Fill existing staging feedback fields from the analyzer (summary, per-skill note / quotes, Try instead, next step). Do not invent new UI labels.

## Transcript order (known issue)

Realtime transcribes the learner on a separate path, so the learner line can arrive after the character’s reply. Persist turns so a learner line that arrives within ~2 s of a character line is placed **before** it; otherwise the analyzer sees the push before the answer.
