# Backend / AI — The Follow-Ups That Keep Slipping

**Scope:** Realtime actor session, analyzer/scoring, scene runtime ids, voice, turn limits.  
**Not in scope:** Brief layout / visual design (see `../01-frontend/`).

## Files

| File | Use |
|---|---|
| [`prompts/marcus_practice.actor.prompt.txt`](prompts/marcus_practice.actor.prompt.txt) | Full `session.instructions` for Realtime |
| [`prompts/marcus_practice.analyzer.prompt.txt`](prompts/marcus_practice.analyzer.prompt.txt) | Full analyzer system prompt |
| [`prompts/marcus_practice.scoring_meta.json`](prompts/marcus_practice.scoring_meta.json) | Scoring meta |
| [`scene-runtime.json`](scene-runtime.json) | Scene id, voice, checklist ids, competencies, turn limits, pass threshold |
| [`WIRING.md`](WIRING.md) | Models + API call shape |
| [`OBJECTIVE_TRACKING.md`](OBJECTIVE_TRACKING.md) | Live objective ticks (criteria, judge output) + post-call scoring summary |

## Wire these server pieces

1. Load **actor** prompt as Realtime instructions  
2. Set voice = **`cedar`** (from `scene-runtime.json`)  
3. Model actor = **`gpt-realtime-2.1`**  
4. Analyzer model = **Opus (`claude-opus-5`), same as MC1 — do not change**; only swap analyzer prompt file  
5. Map checklist ids: `slipping_followups`, `handle_calls`, `repeat_callers`  
6. Pass threshold = **7** per competency  
7. Run the live objective judge per `OBJECTIVE_TRACKING.md`  

Learner-facing strings on the brief must stay in sync with `01-frontend` — do not invent alternate scenario text in the backend.
