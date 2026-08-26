# Realtime voice & session APIs

## Voice stack

| Piece | File | Notes |
|-------|------|-------|
| WebRTC client | `exp7Realtime.ts` | OpenAI Realtime beta API |
| React bridge | `Exp7RealtimeBridge.tsx` | Mic, VAD, character buffer, judge trigger |
| Token route | `api/.../realtime-token/route.ts` | Client secret + actor system prompt |
| Actor prompt | `reference/prompts/jordan_*.prompt.txt` | Loaded by scene id |

**Model:** `ARENA_REALTIME_MODEL` (default `gpt-realtime-2.1`)  
**Voice:** `coral` for Claire (see scene JSON)

## Session lifecycle

```
1. POST /api/arena/exp7/sessions
   Body: { "sceneId": "scene-mc1-jordan-pre" }
   → { sessionId, … }

2. POST /api/arena/exp7/sessions/:sessionId/realtime-token
   → { clientSecret, model, … } + actor instructions embedded server-side

3. Client opens WebRTC (Exp7RealtimeBridge)
   → Claire speaks opener
   → Learner speaks (VAD / push-to-talk per UI)
   → commit-turn after each side's utterance

4. POST /api/arena/exp7/sessions/:sessionId/commit-turn
   Body: { learnerText?, characterText?, closeEval?, … }
   → persists transcript + arc metadata

5. (Parallel) Coverage judge after each Claire turn — see OBJECTIVES_COVERAGE.md

6. Learner ends scene
   POST /api/arena/exp7/sessions/:sessionId/complete
   → runs analyzer → returns debrief JSON
```

## API reference

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/arena/exp7/health` | Realtime readiness probe |
| POST | `/api/arena/exp7/sessions` | Create session |
| POST | `…/realtime-token` | OpenAI ephemeral token |
| POST | `…/commit-turn` | Append turn to transcript |
| POST | `…/complete` | Analyze + debrief (~20–35s) |
| POST | `…/coverage` | **Dev only** — log judge verdicts |
| GET | `…/debug` | **Dev only** — session snapshot |

## Auth / keys

- `OPENAI_API_KEY` required (server-side)
- Loaded via `loadOpenAiKey.ts` from env or workspace `env.txt` in local sandbox
- Session creation returns 500 if key missing

## Turn commit & close evaluation

`commit-turn` stores learner + character lines and runs code-based close evaluation (`closeEvaluator.ts`) for arc tracking (push count, refusal, cave-in). This feeds **analyzer facts** in the debrief user message — separate from live objectives judge.

## Error handling

- Realtime disconnect → `Exp7PracticePanel` shows error, allows retake
- Analyzer empty JSON → retry once with lower reasoning effort; else "Try again" failed debrief
- See `exp7Errors.ts` for client-facing messages

## Health check

Before Join, UI may probe `/api/arena/exp7/health` to confirm Realtime is configured.
