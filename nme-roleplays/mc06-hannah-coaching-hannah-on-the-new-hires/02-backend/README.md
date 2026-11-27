# Backend / AI — Coaching Hannah on the New Hires

**Scope:** Realtime actor session, analyzer/scoring, scene runtime ids, voice, turn limits.  
**Not in scope:** Brief layout / visual design (see `../01-frontend/`).

## Files

| File | Use |
|---|---|
| [`prompts/hannah_mc6_cert.actor.vA.prompt.txt`](prompts/hannah_mc6_cert.actor.vA.prompt.txt) | Full `session.instructions` for Realtime |
| [`prompts/hannah_mc6_cert.analyzer.vA.prompt.txt`](prompts/hannah_mc6_cert.analyzer.vA.prompt.txt) | Full analyzer system prompt |
| [`prompts/hannah_mc6_cert.scoring_meta.json`](prompts/hannah_mc6_cert.scoring_meta.json) | Scoring meta |
| [`scene-runtime.json`](scene-runtime.json) | Scene id, voice, checklist ids, competencies, turn limits, pass threshold |
| [`WIRING.md`](WIRING.md) | Models + API call shape |
| [`OBJECTIVE_TRACKING.md`](OBJECTIVE_TRACKING.md) | Live objective ticks (criteria, judge output) + post-call scoring summary |

## Wire these server pieces

1. Load **actor** prompt as Realtime instructions  
2. Set voice = **`marin`** (from `scene-runtime.json`)  
3. Model actor = **`gpt-realtime-2.1`**  
4. Analyzer model = **Opus (`claude-opus-5`), same as MC1 — do not change**; only swap analyzer prompt file  
5. Map checklist ids: `course_request`, `welcome_new_hires`, `learn_from_team`  
6. Pass threshold = **7** per competency  
7. Run the live objective judge per `OBJECTIVE_TRACKING.md`  

Learner-facing strings on the brief must stay in sync with `01-frontend` — do not invent alternate scenario text in the backend.
