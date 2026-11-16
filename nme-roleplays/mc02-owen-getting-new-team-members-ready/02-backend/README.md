# Backend / AI — Getting New Team Members Ready

**Scope:** Realtime actor session, analyzer/scoring, scene runtime ids, voice, turn limits.  
**Not in scope:** Brief layout / visual design (see `../01-frontend/`).

## Files

| File | Use |
|---|---|
| [`prompts/owen_post.actor.prompt.txt`](prompts/owen_post.actor.prompt.txt) | Full `session.instructions` for Realtime |
| [`prompts/owen_post.analyzer.prompt.txt`](prompts/owen_post.analyzer.prompt.txt) | Full analyzer system prompt |
| [`scene-runtime.json`](scene-runtime.json) | Scene id, voice, checklist ids, competencies, turn limits, pass threshold |
| [`WIRING.md`](WIRING.md) | Models + API call shape |

## Wire these server pieces

1. Load **actor** prompt as Realtime instructions  
2. Set voice = **`cedar`** (from `scene-runtime.json`)  
3. Model actor = **`gpt-realtime-2.1`**  
4. Analyzer model = **Opus (`claude-opus-5`), same as MC1 — do not change**; only swap analyzer prompt file  
5. Map checklist ids: `missed_goal`, `late_laptops`, `six_new_people`, `team_choice`  
6. Pass threshold = **7** per competency  

Learner-facing strings on the brief must stay in sync with `01-frontend` — do not invent alternate scenario text in the backend.
