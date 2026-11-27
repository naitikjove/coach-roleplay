# Backend / AI — The Delegation Dilemma

**Scope:** Realtime actor session, analyzer/scoring, scene runtime ids, voice, turn limits.  
**Not in scope:** Brief layout / visual design (see `../01-frontend/`).

## Files

| File | Use |
|---|---|
| [`prompts/amara_mc5_cert.actor.vA.prompt.txt`](prompts/amara_mc5_cert.actor.vA.prompt.txt) | Full `session.instructions` for Realtime |
| [`prompts/amara_mc5_cert.analyzer.vA.prompt.txt`](prompts/amara_mc5_cert.analyzer.vA.prompt.txt) | Full analyzer system prompt |
| [`prompts/amara_mc5_cert.scoring_meta.json`](prompts/amara_mc5_cert.scoring_meta.json) | Scoring meta |
| [`scene-runtime.json`](scene-runtime.json) | Scene id, voice, checklist ids, competencies, turn limits, pass threshold |
| [`WIRING.md`](WIRING.md) | Models + API call shape |
| [`OBJECTIVE_TRACKING.md`](OBJECTIVE_TRACKING.md) | Live objective ticks (criteria, judge output) + post-call scoring summary |

## Wire these server pieces

1. Load **actor** prompt as Realtime instructions  
2. Set voice = **`ballad`** (from `scene-runtime.json`)  
3. Model actor = **`gpt-realtime-2.1`**  
4. Analyzer model = **Opus (`claude-opus-5`), same as MC1 — do not change**; only swap analyzer prompt file  
5. Map checklist ids: `who_takes_request`, `keep_track`, `thank_dev`  
6. Pass threshold = **7** per competency  
7. Run the live objective judge per `OBJECTIVE_TRACKING.md`  

Learner-facing strings on the brief must stay in sync with `01-frontend` — do not invent alternate scenario text in the backend.
