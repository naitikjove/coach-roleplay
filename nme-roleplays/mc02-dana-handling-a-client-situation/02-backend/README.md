# Backend / AI — Handling a client situation

**Scope:** Realtime actor session, analyzer/scoring, scene runtime ids, voice, turn limits.  
**Not in scope:** Brief layout / visual design (see `../01-frontend/`).

## Files

| File | Use |
|---|---|
| [`prompts/dana_brightway.actor.vB.prompt.txt`](prompts/dana_brightway.actor.vB.prompt.txt) | Full `session.instructions` for Realtime |
| [`prompts/dana_brightway.analyzer.vB.prompt.txt`](prompts/dana_brightway.analyzer.vB.prompt.txt) | Full analyzer system prompt |
| [`scene-runtime.json`](scene-runtime.json) | Scene id, voice, checklist ids, competencies, turn limits, pass threshold |
| [`WIRING.md`](WIRING.md) | Models + API call shape |

## Wire these server pieces

1. Load **actor** prompt as Realtime instructions  
2. Set voice = **`sage`** (from `scene-runtime.json`)  
3. Model actor = **`gpt-realtime-2.1`**  
4. Analyzer model = **Opus (`claude-opus-5`), same as MC1 — do not change**; only swap analyzer prompt file  
5. Map checklist ids: `la_weekend_catch_up`, `mc_missed_request`, `lc_new_dashboard`, `dq_dashboard_owner`  
6. Pass threshold = **7** per competency  

Learner-facing strings on the brief must stay in sync with `01-frontend` — do not invent alternate scenario text in the backend.
