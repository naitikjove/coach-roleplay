# Objective tracking + How it went (Rebecca · Performance and Feedback in Practice)

Self-contained for integrators. Mid-call ticks ≠ post-call quality scores.

## Mid-call coverage (live objective ticks)

| | |
|---|---|
| Count | **4** (same as brief objectives) |
| Scene ids | `scene-mc7-becca-post`, any scene id containing `becca-post` |
| Source | `BECCA_POST` in `src/lib/arena/exp7/coverageJudge.ts` (settle/decision coverage only — not quality) |
| Output | `{"1":boolean,"2":boolean,"3":boolean,"4":boolean}` |
| Run | Hidden out-of-band judge request after each character reply, from the 2nd reply on (never on the opening line) |

Ticks go true only when the matter is **settled** (the manager gave a direction and Rebecca acknowledged or moved on). The character volunteering alone, a bare “okay”, or a greeting = false. A weak managerial choice still ticks true for coverage.

### Criteria (order = UI objectives 1–4)

1. **Obj1 (Zara's review)** — The manager gave any direction on what to say in Zara's review (what she delivered, asking how she saw it, what doing it well looks like next time, plain praise, or a label) **and** Rebecca acknowledged it or moved on to the debrief. Greeting alone, a question alone, Rebecca's words alone, or a weak okay alone = false.
2. **Obj2 (the team debrief)** — The manager gave any direction on what the team debrief should lead with (the people who tried the product, the team's work, a list of what was done, the head count, or more detail) **and** Rebecca acknowledged it or moved on to Felix. A question alone, Rebecca's words alone, or a weak okay alone = false.
3. **Obj3 (Felix's banner change)** — The manager gave any direction on what to say or do about Felix changing the approved banner (what he did, what it caused, one thing to try, a reminder to the team, or leave it) **and** Rebecca acknowledged it or moved on to Ravi. A question alone, Rebecca's words alone, or a weak okay alone = false.
4. **Obj4 (Ravi's late invoices)** — The manager gave any direction on what to do about Ravi's invoices going to the wrong person (explaining who signs off on what, giving him the rule, checking his invoices, a warning, a reminder, or a formal plan) **and** Rebecca acknowledged it or the call is closing. A question alone, Rebecca's words alone, or a weak okay alone = false. Do **not** judge whether the plan is good.

Checklist ids (runtime): `cpr_review` · `dr_debrief` · `gf_felix` · `au_omar`

## Post-call analyzer (quality / G1)

| | |
|---|---|
| Prompt | `becca_mc7_post.analyzer.vA.prompt.txt` |
| Meta | `becca_mc7_post.scoring_meta.json` |
| Model | Opus (`claude-opus-5`) — same as MC1 |
| Shape | One **G1** per competency, 0-10 each · ranges 0-1 / 2-4 / 5-7 / 8-10 with top/middle/bottom checks · max **40** · pass **7**/10 overall |
| Gave-in rule | Not used (Rebecca never pushes). A weak line after a good one does not lower the score (best range reached). |

| Competency id | Display | G1 (quality aim) |
|---|---|---|
| `conducting_performance_reviews` | Conducting Performance Reviews | Says what Zara delivered in real facts, hears her side, and agrees what doing it well looks like next time |
| `driving_results` | Driving Results | Puts the people who came to the demo and tried the product at the top of the debrief and ties the team's work to it |
| `giving_feedback` | Giving Feedback | Tells Felix what he did, what it caused, and one thing to try next time |
| `addressing_underperformance` | Addressing Underperformance | Matches the fix to the cause (explains who signs off on what and gives Ravi the rule) and says how they will see it worked |

Coverage ticks can be true while G1 stays low (e.g. agreeing to the label in beat A settles Obj1 for coverage but scores 0 on Conducting Performance Reviews G1).

## How it went (learner usefulness)

Staging chrome already shows these labels — fill from analyzer JSON only:

| Analyzer field | UI |
|---|---|
| `summary` | Overall “How it went” / coach summary for the whole call |
| `competencies.*.note` | Per-skill “How it went” |
| `competencies.*.youSaid` | “You said” |
| `competencies.*.tryInstead` | “Try instead” |
| `nextStep` | “Your next step” (headline + body) |

Headline bands (app-derived): score share maps to staging **Nailed it / Solid / Try again** where that chrome exists. Do not invent new labels.

## Playbook / QA evidence

See [`../03-qa/README.md`](../03-qa/README.md).
