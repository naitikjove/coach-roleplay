# Objective tracking + How it went (Rebecca · Writing the Mid-Year Reviews)

Self-contained for integrators. Mid-call ticks ≠ post-call quality scores.

## Mid-call coverage (live objective ticks)

| | |
|---|---|
| Count | **4** (same as brief objectives) |
| Scene ids | `scene-mc7-becca-practice`, any scene id containing `becca-practice` |
| Source | `BECCA_PRACTICE` in `src/lib/arena/exp7/coverageJudge.ts` (settle/decision coverage only — not quality) |
| Output | `{"1":boolean,"2":boolean,"3":boolean,"4":boolean}` |
| Run | Hidden out-of-band judge request after each character reply, from the 2nd reply on (never on the opening line) |

Ticks go true only when the matter is **settled** (the manager gave a direction and Rebecca acknowledged or moved on). The character volunteering alone, a bare “okay”, or a greeting = false. A weak managerial choice still ticks true for coverage.

### Criteria (order = UI objectives 1–4)

1. **Obj1 (Jamie's review)** — The manager gave any direction on what Jamie's review should say (what actually happened, asking for her side, a label like 'not detail-oriented', or agreeing to write the label) **and** Rebecca acknowledged it or moved on to the team summary. Greeting alone, a question alone, Rebecca's words alone, or a weak okay alone = false.
2. **Obj2 (the team summary)** — The manager gave any direction on what the team summary should show (customers kept, how the team's work helped, a day-by-day list, more detail, or leaving it as it was) **and** Rebecca acknowledged it or moved on to Chloe. A question alone, Rebecca's words alone, or a weak okay alone = false.
3. **Obj3 (Chloe's call)** — The manager gave any direction on how to handle Chloe interrupting the client (talk to her privately, say what happened, a note to the whole team, leave it, or something to try on the next call) **and** Rebecca acknowledged it or moved on to Dylan. A question alone, Rebecca's words alone, or a weak okay alone = false.
4. **Obj4 (Dylan's late reports)** — The manager gave any direction on Dylan's late reports (asked why they are late, training on the software, a goal and date, weekly check-ins, a formal plan now, or a formal plan later) **and** Rebecca acknowledged it or the call is closing. A question alone, Rebecca's words alone, or a weak okay alone = false. Do **not** judge whether the plan is good.

Checklist ids (runtime): `cpr_review` · `dr_summary` · `gf_chloe` · `au_dylan`

## Post-call analyzer (quality / G1)

| | |
|---|---|
| Prompt | `becca_mc7.analyzer.vA.prompt.txt` |
| Meta | `becca_mc7.scoring_meta.json` |
| Model | Opus (`claude-opus-5`) — same as MC1 |
| Shape | One **G1** per competency, 0-10 each · ranges 0-1 / 2-4 / 5-7 / 8-10 with top/middle/bottom checks · max **40** · pass **7**/10 overall |
| Gave-in rule | Not used (Rebecca never pushes). A weak line after a good one does not lower the score (best range reached). |

| Competency id | Display | G1 (quality aim) |
|---|---|---|
| `conducting_performance_reviews` | Conducting Performance Reviews | Writes what happened instead of a label, asks Jamie's side, and agrees what good looks like |
| `driving_results` | Driving Results | Makes the team summary show how many customers we kept, and ties the team's work to it |
| `giving_feedback` | Giving Feedback | Tells Chloe what she did, what it caused for the client, and one thing to try next call |
| `addressing_underperformance` | Addressing Underperformance | Matches the fix to the cause (training or help with the software) and says how they will see it is working |

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
