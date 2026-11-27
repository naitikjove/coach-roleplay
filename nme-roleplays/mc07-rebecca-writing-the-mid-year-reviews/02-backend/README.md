# Backend / AI — Writing the Mid-Year Reviews

**Scope:** Realtime actor session, analyzer/scoring, scene runtime ids, voice, turn limits.  
**Not in scope:** Brief layout / visual design (see `../01-frontend/`).

## Files

| File | Use |
|---|---|
| [`prompts/becca_mc7.actor.vA.prompt.txt`](prompts/becca_mc7.actor.vA.prompt.txt) | Full `session.instructions` for Realtime |
| [`prompts/becca_mc7.analyzer.vA.prompt.txt`](prompts/becca_mc7.analyzer.vA.prompt.txt) | Full analyzer system prompt |
| [`prompts/becca_mc7.scoring_meta.json`](prompts/becca_mc7.scoring_meta.json) | Scoring meta |
| [`scene-runtime.json`](scene-runtime.json) | Scene id, voice, checklist ids, competencies, turn limits, pass threshold, must-watch videos |
| [`WIRING.md`](WIRING.md) | Models + API call shape |
| [`OBJECTIVE_TRACKING.md`](OBJECTIVE_TRACKING.md) | Live objective ticks + post-call scoring + How it went mapping |

## Wire these server pieces

1. Load **actor** prompt as Realtime instructions  
2. Set voice = **`shimmer`** (from `scene-runtime.json`; `realtimeReasoningEffort` = `low`)  
3. Model actor = **`gpt-realtime-2.1`**  
4. Analyzer model = **Opus (`claude-opus-5`), same as MC1 — do not change**; only swap analyzer prompt file  
5. Map checklist ids: `cpr_review`, `dr_summary`, `gf_chloe`, `au_dylan`  
6. Pass threshold = **7**  

Character id is `becca` (display name Rebecca) because MC4 owns `rebecca` and phase/scene inference matches on `includes("rebecca")`. In any phase-inference check, the MC7 certificate scene id must be tested before the broad MC7 cue.

Learner-facing strings on the brief must stay in sync with `01-frontend` — do not invent alternate scenario text in the backend.
