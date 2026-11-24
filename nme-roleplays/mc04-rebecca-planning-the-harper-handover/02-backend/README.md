# Backend / AI — Planning the Harper Handover

**Scope:** Realtime actor session, analyzer/scoring, scene runtime ids, voice, turn limits.  
**Not in scope:** Brief layout / visual design (see `../01-frontend/`).

## Files

| File | Use |
|---|---|
| [`prompts/rebecca_harper.actor.vA.prompt.txt`](prompts/rebecca_harper.actor.vA.prompt.txt) | Full `session.instructions` for Realtime |
| [`prompts/rebecca_harper.analyzer.vA.prompt.txt`](prompts/rebecca_harper.analyzer.vA.prompt.txt) | Full analyzer system prompt |
| [`prompts/rebecca_harper.scoring_meta.json`](prompts/rebecca_harper.scoring_meta.json) | Scoring meta |
| [`scene-runtime.json`](scene-runtime.json) | Scene id, voice, checklist ids, competencies, turn limits, pass threshold |
| [`WIRING.md`](WIRING.md) | Models + API call shape |

## Wire these server pieces

1. Load **actor** prompt as Realtime instructions  
2. Set voice = **`shimmer`** (from `scene-runtime.json`)  
3. Model actor = **`gpt-realtime-2.1`**  
4. Analyzer model = **Opus (`claude-opus-5`), same as MC1 — do not change**; only swap analyzer prompt file  
5. Map checklist ids: `bet_kickoff`, `bet_client_contact`, `att_interviews`  
6. Pass threshold = **7** per competency  

Learner-facing strings on the brief must stay in sync with `01-frontend` — do not invent alternate scenario text in the backend.
