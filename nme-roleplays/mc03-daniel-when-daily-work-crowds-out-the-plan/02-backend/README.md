# Backend / AI — When Daily Work Crowds Out the Plan

**Scope:** Realtime actor session, analyzer/scoring, scene runtime ids, voice, turn limits.  
**Not in scope:** Brief layout / visual design (see `../01-frontend/`).

## Files

| File | Use |
|---|---|
| [`prompts/daniel_post.actor.prompt.txt`](prompts/daniel_post.actor.prompt.txt) | Full `session.instructions` for Realtime |
| [`prompts/daniel_post.analyzer.prompt.txt`](prompts/daniel_post.analyzer.prompt.txt) | Full analyzer system prompt (v1.0 — one G1 band per skill) |
| [`prompts/daniel_post.scoring_meta.json`](prompts/daniel_post.scoring_meta.json) | Competency goals + objective criteria |
| [`scene-runtime.json`](scene-runtime.json) | Scene id, voice, checklist ids, competencies, turn limits, pass threshold |
| [`WIRING.md`](WIRING.md) | Models + API call shape |
| [`OBJECTIVE_TRACKING.md`](OBJECTIVE_TRACKING.md) | Mid-call coverage (3 objs) + G1 / How it went |

## Wire these server pieces

1. Load **actor** prompt as Realtime instructions  
2. Set voice = **`ash`** (from `scene-runtime.json`)  
3. Model actor = **`gpt-realtime-2.1`**  
4. Analyzer model = **Opus (`claude-opus-5`), same as MC1 — do not change**; only swap analyzer prompt file  
5. Map checklist ids: `templates_plan`, `newer_designers`, `templates_working`  
6. Pass threshold = **7** per competency  
7. Scene id = **`scene-mc3-daniel-post`** (`characterId` = `daniel`)

Learner-facing strings on the brief must stay in sync with `01-frontend` — do not invent alternate scenario text in the backend.
