# MC06 Practice — Marcus · The Follow-Ups That Keep Slipping (FINAL)

**Share this folder:**  
https://github.com/naitikjove/coach-roleplay/tree/main/nme-roleplays/mc06-marcus-the-follow-ups-that-keep-slipping

| | |
|---|---|
| Lock | `1.0.0-marcus-practice-v4-local` (2026-11-25) |
| Course | New Manager Essentials → Coaching and Developing Teams → Practice Roleplay |
| Scene id | `scene-mc6-marcus-practice` |
| Character | Marcus (Direct report) · voice `cedar` |
| Competencies (beats A/B/C) | Assessing Capabilities · Coaching Team Members · Sharing Knowledge |
| Must Watch lessons | 41970 · 41978 · 41975 |
| Pass threshold | 7 / 10 per competency (max 30) |

## Who reads what

| Role | Folder |
|---|---|
| **Frontend** | [`01-frontend/`](01-frontend/) — brief copy + video map + character image |
| **Backend / AI** | [`02-backend/`](02-backend/) — prompts, voice, scene runtime |
| **QA** | [`ACCEPTANCE.md`](ACCEPTANCE.md) + [`03-qa/`](03-qa/) |

```
01-frontend/     ← variable learner copy + Must Watch table + character image
02-backend/      ← actor + analyzer prompts + scene-runtime.json + wiring + objective tracking
03-qa/           ← playbooks + README
```

**Models:** actor `gpt-realtime-2.1` · voice `cedar` · analyzer **Opus same as MC1 (`claude-opus-5`) — do not change analyzer model.**

**MC1 headline replacement (practice slot):**  
`Show how you'd help a team member whose customers keep calling in again`  
Replaces the MC1 headline "See how you'd handle your first 1:1" for this slot. **Not** the scenario title (keep **The Follow-Ups That Keep Slipping**). Do **not** label this string as "Entry card body".

**Character image:** [`01-frontend/assets/marcus.jpg`](01-frontend/assets/marcus.jpg) (committed in this pack for GitHub access). App path: `/arena/exp4/characters/marcus.jpg`.

**Objective tracking:** mid-call coverage (3 settle/decision ticks) + post-call G1 + How it went → [`02-backend/OBJECTIVE_TRACKING.md`](02-backend/OBJECTIVE_TRACKING.md).

**Known gaps:** listed in [`ACCEPTANCE.md`](ACCEPTANCE.md).

**Out of scope for this pack:** static feedback chrome already on staging (Your next step, How it went, You said, Try instead, Certificate/Practice score, Skills overview, etc.).
