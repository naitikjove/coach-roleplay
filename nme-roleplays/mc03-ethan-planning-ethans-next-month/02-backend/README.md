# Backend / AI — Planning Ethan's Next Month

**Scope:** Realtime actor session, analyzer/scoring, scene runtime ids, voice, turn limits.  
**Not in scope:** Brief layout / visual design (see `../01-frontend/`).

## Files

| File | Use |
|---|---|
| [`prompts/ethan_next_month.actor.vA.prompt.txt`](prompts/ethan_next_month.actor.vA.prompt.txt) | Full `session.instructions` for Realtime (vA — no missing-piece quiz) |
| [`prompts/ethan_next_month.analyzer.vA.prompt.txt`](prompts/ethan_next_month.analyzer.vA.prompt.txt) | Full analyzer system prompt (vA 1.1 — no missing-piece quiz) |
| [`prompts/ethan_next_month.scoring_meta.json`](prompts/ethan_next_month.scoring_meta.json) | Competency goals + objective criteria |
| [`scene-runtime.json`](scene-runtime.json) | Scene id, voice, checklist ids, competencies, turn limits, pass threshold |
| [`WIRING.md`](WIRING.md) | Models + API call shape |

## Wire these server pieces

1. Load **actor** prompt as Realtime instructions  
2. Set voice = **`verse`** (from `scene-runtime.json`)  
3. Model actor = **`gpt-realtime-2.1`**  
4. Analyzer model = **Opus (`claude-opus-5`), same as MC1 — do not change**; only swap analyzer prompt file  
5. Map checklist ids: `gs_next_month`, `es_slow_reply`, `mmw_tracking`  
6. Pass threshold = **7** per competency  
7. Scene id = **`scene-mc3-rachel-practice`** (legacy rachel id; `characterId` = `ethan`)

Learner-facing strings on the brief must stay in sync with `01-frontend` — do not invent alternate scenario text in the backend.
