# MC03 Practice — Ethan · Planning Ethan's Next Month (FINAL)

**Share this folder:**  
https://github.com/naitikjove/coach-roleplay/tree/main/nme-roleplays/mc03-ethan-planning-ethans-next-month

| | |
|---|---|
| Lock | `1.0.0-ethan-practice-vA.1.1` |
| Course | New Manager Essentials → Setting Clear Goals and Expectations → Practice Roleplay |
| Replaces | Legacy Rachel practice slot (`scene-mc3-rachel-practice` id kept for wiring) |

## Who reads what

| Role | Folder |
|---|---|
| **Frontend** | [`01-frontend/`](01-frontend/) — brief copy + video map only |
| **Backend / AI** | [`02-backend/`](02-backend/) — prompts, voice, scene runtime |
| **QA** | [`ACCEPTANCE.md`](ACCEPTANCE.md) |

```
01-frontend/     ← variable learner copy + Must Watch table
02-backend/      ← actor + analyzer prompts + scene-runtime.json
```

**Models:** actor `gpt-realtime-2.1` · voice `verse` · analyzer **Opus same as MC1 (`claude-opus-5`) — do not change analyzer model.**

**MC1 headline replacement (practice slot):**  
`Show how you'd set clear goals with your team`  
Replaces the MC1 headline "See how you'd handle your first 1:1" for this slot. **Not** the scenario title (keep **Planning Ethan's Next Month**). Do **not** label this string as "Entry card body".

**Prompt lock:** actor/analyzer **vA 1.1** — no missing-piece quiz (Ethan never asks for number / target / deadline / reply-time / rhythm / measure slots).

**Character image:** [`01-frontend/assets/ethan.jpg`](01-frontend/assets/ethan.jpg) (committed in this pack for GitHub access).

**Learner scenario lock:** “shown interest” / “your only advice was…” / “any other guidance” / “Help him plan his next month.” (see `01-frontend/COPY.md`).

**Objective tracking:** mid-call coverage (3 settle/decision ticks) + post-call G1 + How it went → [`02-backend/OBJECTIVE_TRACKING.md`](02-backend/OBJECTIVE_TRACKING.md).

**Out of scope for this pack:** static feedback chrome already on staging.
