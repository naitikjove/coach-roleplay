# Backend / AI — A Team Member’s First Client Calls

**Scope:** Realtime actor session, analyzer/scoring, scene runtime ids, voice, turn limits.  
**Not in scope:** Brief layout / visual design (see `../01-frontend/`).

## Files

| File | Use |
|---|---|
| [`prompts/jordan_first_calls.actor.vA.prompt.txt`](prompts/jordan_first_calls.actor.vA.prompt.txt) | Full `session.instructions` for Realtime |
| [`prompts/jordan_first_calls.analyzer.vA.prompt.txt`](prompts/jordan_first_calls.analyzer.vA.prompt.txt) | Full analyzer system prompt |
| [`prompts/jordan_first_calls.scoring_meta.json`](prompts/jordan_first_calls.scoring_meta.json) | Scoring meta |
| [`scene-runtime.json`](scene-runtime.json) | Scene id, voice, checklist ids, competencies, turn limits, pass threshold |
| [`WIRING.md`](WIRING.md) | Models + API call shape |
| [`OBJECTIVE_TRACKING.md`](OBJECTIVE_TRACKING.md) | Live objective ticks (criteria, judge output) + post-call scoring summary |

## Wire these server pieces

1. Load **actor** prompt as Realtime instructions  
2. Set voice = **`verse`** (from `scene-runtime.json`)  
3. Model actor = **`gpt-realtime-2.1`**  
4. Analyzer model = **Opus (`claude-opus-5`), same as MC1 — do not change**; only swap analyzer prompt file  
5. Map checklist ids: `calls_next_step`, `change_requests`, `after_call_note`  
6. Pass threshold = **7** per competency  
7. Run the live objective judge per `OBJECTIVE_TRACKING.md`  

Learner-facing strings on the brief must stay in sync with `01-frontend` — do not invent alternate scenario text in the backend.
