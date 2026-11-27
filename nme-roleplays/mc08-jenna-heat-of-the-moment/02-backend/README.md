# Backend / AI — Heat of the Moment

**Scope:** Realtime actor session, analyzer/scoring, scene runtime ids, voice, turn limits.  
**Not in scope:** Brief layout / visual design (see `../01-frontend/`).

## Files

| File | Use |
|---|---|
| [`prompts/jenna_heated_week.actor.vA.prompt.txt`](prompts/jenna_heated_week.actor.vA.prompt.txt) | Full `session.instructions` for Realtime |
| [`prompts/jenna_heated_week.analyzer.vA.prompt.txt`](prompts/jenna_heated_week.analyzer.vA.prompt.txt) | Full analyzer system prompt (one G1 per skill, ranges + checks, coach-style copy rules) |
| [`prompts/jenna_heated_week.scoring_meta.json`](prompts/jenna_heated_week.scoring_meta.json) | Competency goals + objective criteria |
| [`scene-runtime.json`](scene-runtime.json) | Scene id, voice, checklist ids, competencies, turn limits, pass threshold |
| [`WIRING.md`](WIRING.md) | Models + API call shape |
| [`OBJECTIVE_TRACKING.md`](OBJECTIVE_TRACKING.md) | Mid-call coverage (2 objs) + G1 / How it went |

## Wire these server pieces

1. Load **actor** prompt as Realtime instructions  
2. Set voice = **`sage`** (from `scene-runtime.json`)  
3. Model actor = **`gpt-realtime-2.1`**  
4. Analyzer model = **Opus (`claude-opus-5`), same as MC1 — do not change**; only swap analyzer prompt file  
5. Map checklist ids: `team_email`, `kayla_request`  
6. Pass threshold = **7** (overall score out of 10)  
7. Scene id = **`scene-mc8-jenna-cert`** (`characterId` = `jenna`)

Learner-facing strings on the brief must stay in sync with `01-frontend` — do not invent alternate scenario text in the backend.
