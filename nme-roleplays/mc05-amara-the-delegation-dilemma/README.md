# MC05 Certificate — Amara · The Delegation Dilemma (FINAL)

**Share this folder:**  
https://github.com/naitikjove/coach-roleplay/tree/main/nme-roleplays/mc05-amara-the-delegation-dilemma

| | |
|---|---|
| Lock | `1.1.0-amara-delegation-dilemma-locked-local` |
| Course | New Manager Essentials → How to Delegate with Clarity → Certificate Roleplay |
| Scene id | `scene-mc5-amara-post` |
| Character | Amara (plans the team’s weekly work) |
| Voice | `ballad` · actor `gpt-realtime-2.1` |
| Pass threshold | 7 / 10 per competency |

## Who reads what

| Role | Folder |
|---|---|
| **Frontend** | [`01-frontend/`](01-frontend/) — brief copy + video map + character image |
| **Backend / AI** | [`02-backend/`](02-backend/) — prompts, voice, scene runtime, objective tracking |
| **QA** | [`ACCEPTANCE.md`](ACCEPTANCE.md) + [`03-qa/`](03-qa/) |

```
01-frontend/     ← variable learner copy + Must Watch table + assets/amara.jpg
02-backend/      ← actor + analyzer prompts + scene-runtime.json
03-qa/           ← LLM-learner playbooks (addition vs MC02–MC04 packs)
```

**Models:** actor `gpt-realtime-2.1` · voice `ballad` · analyzer **Opus same as MC1 (`claude-opus-5`) — do not change analyzer model** (reasoning-effort guard in `02-backend/WIRING.md`).

## At a glance

| Beat | Lesson ID | Video | Competency |
|---|---|---|---|
| A | 41965 | How to Choose the Right Person for the Task | Effective Delegation |
| B | 41967 | How to Monitor Progress Without Micromanaging | Ensuring Accountability |
| C | 41969 | Recognizing and Rewarding Accountability | Recognizing Contributions |

**Competencies:** Effective Delegation · Ensuring Accountability · Recognizing Contributions

**Objective tracking:** mid-call coverage (3 settle/decision ticks) + post-call scoring + How it went → [`02-backend/OBJECTIVE_TRACKING.md`](02-backend/OBJECTIVE_TRACKING.md).

**Character image:** [`01-frontend/assets/amara.jpg`](01-frontend/assets/amara.jpg) (committed in this pack; app path `/arena/exp4/characters/amara-v4.jpg`).

**No certificate headline or entry line added** — keep production.

## QA status

Ran with Opus analyzer and an LLM learner on 2026-11-26 (local app, same prompts as this pack). Figures below are carried over from the MC05 QA log; they were **not re-run** when this pack was assembled.

| Playbook | Result |
|---|---|
| ideal | 30/30 |
| off-topic questions | 25/30, behavior checks pass |
| responsive (different questions + suggestion) | 24/30, checks pass |
| shortcuts / gives-in-after-push / prompted / asks-questions / public-generic / vague-monitoring | passed on an earlier prompt version (before the off-topic and opener edits); not re-run since |

## Known gaps

See [`ACCEPTANCE.md`](ACCEPTANCE.md#known-gaps).

**Out of scope for this pack:** static feedback chrome already on staging (Your next step, How it went, You said, Try instead, score ring labels, Nailed it / Solid / Try again, etc.).
