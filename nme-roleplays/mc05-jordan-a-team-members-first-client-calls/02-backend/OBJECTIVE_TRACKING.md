# Objective tracking + How it went (Jordan practice)

Self-contained for integrators — nothing here depends on the Arena source code. Mid-call ticks ≠ post-call quality scores.

## Mid-call coverage (live objective ticks)

| | |
|---|---|
| Count | **3** (same as the brief objectives) |
| Scene ids | `scene-mc5-first-calls-practice`, any scene id containing `first-calls` |
| Judge prompt rev | **8** (settle/decision coverage only — not quality) |
| Output | `{"1":boolean,"2":boolean,"3":boolean}` |
| Run | Hidden out-of-band judge request after each character reply, from the 2nd reply on (never on the opening line) |

Ticks go true only when the matter is **settled** (the manager gave a direction and Jordan acknowledged or moved on). The character volunteering alone, a bare “okay”, or a greeting = false. A weak managerial choice still ticks true for coverage.

### Criteria (order = UI objectives 1–3)

1. **Obj1 (the calls)** — The manager gave any direction on whether Jordan keeps running the weekly client calls (asked what has been happening, kept the calls with Jordan, took the calls back, or a vague steer like “let’s see how it goes”) **and** Jordan acknowledged it or moved on to Sarah’s changes. Greeting alone, a question alone, Jordan’s words alone, or a weak okay alone = false.
2. **Obj2 (Sarah’s changes)** — The manager gave any direction on what Jordan does when Sarah asks for changes during the call (Jordan says yes to small ones, deadline changes come to the manager, “use your judgement”, or “check them all with me”) **and** Jordan acknowledged it or moved on to what to send after the calls. A question alone, Jordan’s words alone, or a weak okay alone = false.
3. **Obj3 (after the call)** — The manager gave any direction on what Jordan sends Sarah after each call (a short note, what was agreed, who is doing what, same day, or agreeing to write up everything at the end of the week) **and** Jordan acknowledged it or the call is closing. A question alone, Jordan’s words alone, or a weak okay alone = false. Do **not** judge whether the plan is good.

Checklist ids (runtime): `calls_next_step` · `change_requests` · `after_call_note`

## Post-call analyzer (quality)

| | |
|---|---|
| Prompt | `prompts/jordan_first_calls.analyzer.vA.prompt.txt` |
| Meta | `prompts/jordan_first_calls.scoring_meta.json` |
| Model | Opus (`claude-opus-5`) — same as MC1, with the reasoning-effort guard in `WIRING.md` |
| Shape | 0–10 per competency (range set by the move; one of three checks sets the exact point) · max **30** · pass **7** |
| Fixed points | gave in after the push = **2** · easy answer taken with no earlier move = **0** |
| Evidence | every score above 0 needs a verbatim learner quote |

| Competency id | Display | Top-range aim |
|---|---|---|
| `ensuring_accountability` | Ensuring Accountability | Asks what has been happening or what has been hard before deciding, then keeps the calls with Jordan, and holds when Jordan asks “Are you sure?” |
| `effective_delegation` | Effective Delegation | Lets Jordan say yes to the small changes and says the ones that would make the project late come to the manager |
| `expectations_setting` | Expectations Setting | Says what Jordan sends Sarah after each call (what was agreed, who does what) and when (same day or right after) |

Coverage ticks can be true while the score stays low (e.g. agreeing to the easy answer still settles the objective for coverage but scores 0).

## How it went (learner usefulness)

Staging chrome already shows these labels — fill from analyzer JSON only:

| Analyzer field | UI |
|---|---|
| `summary` | Overall “How it went” / coach summary for the whole call |
| `competencies.*.note` | Per-skill “How it went” |
| `competencies.*.youSaid` | “You said” |
| `competencies.*.tryInstead` | “Try instead” |
| `nextStep.headline` / `nextStep.body` | “Your next step” |

Copy rules (plain English, names explained, no invented detail, tied to the three Must Watch videos) are inside the analyzer prompt — do not rewrite them in the UI.
