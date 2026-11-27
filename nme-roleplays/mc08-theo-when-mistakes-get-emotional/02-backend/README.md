# Backend / AI — When Mistakes Get Emotional

**Scope:** Realtime actor session, analyzer/scoring, scene runtime ids, voice, turn limits.  
**Not in scope:** Brief layout / visual design (see `../01-frontend/`).

## Files

| File | Use |
|---|---|
| [`prompts/theo_late_report.actor.vA.prompt.txt`](prompts/theo_late_report.actor.vA.prompt.txt) | Full `session.instructions` for Realtime |
| [`prompts/theo_late_report.analyzer.vA.prompt.txt`](prompts/theo_late_report.analyzer.vA.prompt.txt) | Full analyzer system prompt (one G1 per skill, ranges + checks, coach-style copy rules) |
| [`prompts/theo_late_report.scoring_meta.json`](prompts/theo_late_report.scoring_meta.json) | Competency goals + objective criteria |
| [`scene-runtime.json`](scene-runtime.json) | Scene id, voice, checklist ids, competencies, turn limits, pass threshold |
| [`WIRING.md`](WIRING.md) | Models + API call shape |
| [`OBJECTIVE_TRACKING.md`](OBJECTIVE_TRACKING.md) | Mid-call coverage (2 objs) + G1 / How it went |

## Wire these server pieces

1. Load **actor** prompt as Realtime instructions  
2. Set voice = **`ash`** (from `scene-runtime.json`)  
3. Model actor = **`gpt-realtime-2.1`**  
4. Analyzer model = **Opus (`claude-opus-5`), same as MC1 — do not change**; only swap analyzer prompt file  
5. Map checklist ids: `client_reply`, `devon_talk`  
6. Pass threshold = **7** (overall score out of 10)  
7. Scene id = **`scene-mc8-theo-practice`** (`characterId` = `theo`)

Learner-facing strings on the brief must stay in sync with `01-frontend` — do not invent alternate scenario text in the backend.
