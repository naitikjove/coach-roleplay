# MC05 Practice — Jordan · A Team Member’s First Client Calls (FINAL)

**Share this folder:**  
https://github.com/naitikjove/coach-roleplay/tree/main/nme-roleplays/mc05-jordan-a-team-members-first-client-calls

| | |
|---|---|
| Lock | `1.1.0-jordan-first-calls-locked-local` |
| Course | New Manager Essentials → How to Delegate with Clarity → Practice Roleplay |
| Scene id | `scene-mc5-first-calls-practice` |
| Character | Jordan (team member new to client calls) |
| Voice | `verse` · actor `gpt-realtime-2.1` |
| Pass threshold | 7 / 10 per competency |

## Who reads what

| Role | Folder |
|---|---|
| **Frontend** | [`01-frontend/`](01-frontend/) — brief copy + video map + character image |
| **Backend / AI** | [`02-backend/`](02-backend/) — prompts, voice, scene runtime, objective tracking |
| **QA** | [`ACCEPTANCE.md`](ACCEPTANCE.md) + [`03-qa/`](03-qa/) |

```
01-frontend/     ← variable learner copy + Must Watch table + assets/jordan.jpg
02-backend/      ← actor + analyzer prompts + scene-runtime.json
03-qa/           ← LLM-learner playbooks (addition vs MC02–MC04 packs)
```

**Models:** actor `gpt-realtime-2.1` · voice `verse` · analyzer **Opus same as MC1 (`claude-opus-5`) — do not change analyzer model** (reasoning-effort guard in `02-backend/WIRING.md`).

## At a glance

| Beat | Lesson ID | Video | Competency |
|---|---|---|---|
| A | 41968 | Handling Mistakes After Delegation | Ensuring Accountability |
| B | 41963 | Deciding What to Delegate | Effective Delegation |
| C | 41966 | Giving Clear and Actionable Instructions | Expectations Setting |

**Competencies:** Ensuring Accountability · Effective Delegation · Expectations Setting

**Objective tracking:** mid-call coverage (3 settle/decision ticks) + post-call scoring + How it went → [`02-backend/OBJECTIVE_TRACKING.md`](02-backend/OBJECTIVE_TRACKING.md).

**Character image:** [`01-frontend/assets/jordan.jpg`](01-frontend/assets/jordan.jpg) (committed in this pack; app path `/arena/exp4/characters/jordan-v2.jpg`).

**MC1 headline replacement:** *Show how you’d help a team member who is new to client calls.* (replaces the MC1 first-1:1 headline for this slot; not the scenario title).

**Pronouns:** Jordan is referred to as “they” in prompt and copy.

## QA status

Ran with Opus analyzer and an LLM learner on 2026-11-26 (local app, same prompts as this pack). Figures below are carried over from the MC05 QA log; they were **not re-run** when this pack was assembled.

| Playbook | Result |
|---|---|
| ideal | 30/30 |
| off-topic questions | 27/30, behavior checks pass |
| responsive (different questions + suggestion) | 29/30, checks pass |
| shortcuts / owns-then-folds / prompted / mixed / passive / early exit | passed on an earlier prompt version (before the off-topic and opener edits); not re-run since |

## Known gaps

See [`ACCEPTANCE.md`](ACCEPTANCE.md#known-gaps).

**Out of scope for this pack:** static feedback chrome already on staging (Your next step, How it went, You said, Try instead, score ring labels, Nailed it / Solid / Try again, etc.).
