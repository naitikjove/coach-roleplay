# MC08 Certificate — Jenna · Heat of the Moment

**Share this folder:**  
https://github.com/naitikjove/coach-roleplay/tree/main/nme-roleplays/mc08-jenna-heat-of-the-moment

| | |
|---|---|
| Lock | `1.0.0-jenna-heated-week-vA-local` |
| Course | New Manager Essentials → How Can You Lead with Emotional Intelligence? → Certificate Roleplay |
| Scene id | `scene-mc8-jenna-cert` |
| Character | Jenna (Senior analyst) · voice `sage` |

## Who reads what

| Role | Folder |
|---|---|
| **Frontend** | [`01-frontend/`](01-frontend/) — brief copy + video map only |
| **Backend / AI** | [`02-backend/`](02-backend/) — prompts, voice, scene runtime |
| **QA** | [`ACCEPTANCE.md`](ACCEPTANCE.md) and [`03-qa/`](03-qa/) |

```
01-frontend/     ← variable learner copy + Must Watch table + portrait
02-backend/      ← actor + analyzer prompts + scene-runtime.json
03-qa/           ← playbooks, transcripts, evaluation sample, results
```

**Models:** actor `gpt-realtime-2.1` · voice `sage` · analyzer **Opus same as MC1 (`claude-opus-5`) — do not change analyzer model.**

**Competencies (one per beat, one video per beat):**

| Competency | id | Video |
|---|---|---|
| Managing Emotions | `managing_emotions` | 41989 |
| Demonstrating Awareness | `demonstrating_awareness` | 41995 |

**Scoring:** two competencies, 0–10 each, total 20. Bands 17–20 Strong · 10–16 Getting there · 0–9 Needs practice. Pass threshold 7/10.

**Objective tracking:** mid-call coverage (2 settle/decision ticks) + post-call G1 + How it went → [`02-backend/OBJECTIVE_TRACKING.md`](02-backend/OBJECTIVE_TRACKING.md).

**Character image:** [`01-frontend/assets/jenna.jpg`](01-frontend/assets/jenna.jpg) (AI generated).

**Out of scope for this pack:** static feedback chrome already on staging (Your next step, How it went, You said, Try instead, score ring, Skills overview, etc.).
