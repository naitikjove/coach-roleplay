# MC07 Certificate — Rebecca · Performance and Feedback in Practice (DRAFT)

**Share this folder:**  
https://github.com/naitikjove/coach-roleplay/tree/main/nme-roleplays/mc07-rebecca-performance-and-feedback-in-practice

| | |
|---|---|
| Lock | `1.0.0-becca-mc7-post-vA-draft` |
| Course | New Manager Essentials → How to Manage Team Performance and Feedback → Certificate Roleplay |
| Scene id | `scene-mc7-becca-post` |
| Character | Rebecca, the learner's manager (character id `becca`, because MC4 already owns `rebecca`) |

**Status: DRAFT, not locked.** Built and wired locally; QA so far ran on OpenAI models only (no Opus run yet). Treat prompts as ship candidates pending an Opus polish pass and a live voice check.

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

**Models:** actor `gpt-realtime-2.1` · voice `shimmer` · analyzer **Opus same as MC1 (`claude-opus-5`) — do not change analyzer model.**

**Beats (one video and one competency each, four beats):**

| Beat | Topic | Video | Competency |
|---|---|---|---|
| A | Zara's review (ran the sponsor program, did it all herself) | **41981** Running Productive Performance Reviews | Conducting Performance Reviews |
| B | The team debrief for leadership (was the conference worth it?) | **41503** Must-Have for Success: Focus Your Team on Results | Driving Results |
| C | Felix changing an approved sponsor banner | **41985** How to Give Constructive Feedback | Giving Feedback |
| D | Ravi's invoices sent to the wrong person | **41984** Diagnosing Performance Gaps | Addressing Underperformance |

**Scoring:** four goals, 0-10 each, **40 total**. Pass threshold **7 / 10**. Bands: Strong 32-40 · Getting there 20-31 · Needs practice 0-19.

**Character image:** [`01-frontend/assets/rebecca.png`](01-frontend/assets/rebecca.png) (committed in this pack for GitHub access). App path: `/arena/exp4/characters/reporting-manager.png`. This is the temporary Rebecca avatar shared with MC4 until a MC7 portrait lands.

**Prompt files:** `becca_mc7_post.actor.vA.prompt.txt` / `becca_mc7_post.analyzer.vA.prompt.txt` / `becca_mc7_post.scoring_meta.json` (copied from the live app, they match the scene wiring).

**Design (both MC7 roleplays):** Rebecca is a competent manager short on time. She gives the facts with signposts (First / Second / Third / Last thing), asks "what are you planning to do about it?", asks at most one neutral follow-up when a piece is missing, accepts a good answer with a short reaction and one small commitment, and never proposes the answer or pushes back on a good one.

**Companion roleplay:** the practice for MC7 is [`mc07-rebecca-writing-the-mid-year-reviews/`](../mc07-rebecca-writing-the-mid-year-reviews/).

**Out of scope for this pack:** static feedback chrome already on staging.
