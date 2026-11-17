# Objective tracking + How it went (Ethan practice)

Self-contained for integrators. Mid-call ticks ≠ post-call quality scores.

## Mid-call coverage (live objective ticks)

| | |
|---|---|
| Count | **3** (same as brief objectives) |
| Scene ids | `scene-mc3-rachel-practice`, any id containing `ethan` or `rachel` |
| Judge prompt rev | **5** (settle/decision coverage only — not quality) |
| Output | `{"1":boolean,"2":boolean,"3":boolean}` |

Ticks go true only when the matter is **settled** (both engaged; a decision/agreement exists). Character volunteering alone, bare “okay”, or greeting-only = false. A settled but weak managerial choice still ticks true for coverage.

### Criteria (order = UI objectives 1–3)

1. **Obj1 (next-month aim)** — What Ethan should aim for next month was agreed in substance (clear target beyond vague “more calls” — number, mix, or measurable aim) **and** Ethan acknowledged or advanced.
2. **Obj2 (customer emails)** — How customer emails / reply timing will be handled was agreed **and** Ethan acknowledged or advanced. Mentioning the four-day wait alone with no standard = false.
3. **Obj3 (know whether working)** — How both will know whether the plan is working (check-in, metric, review cadence, or other explicit signal) was agreed **and** Ethan acknowledged or advanced. Vague “keep an eye on it” with no method = false. Do **not** judge whether the measure is ideal.

Checklist ids (runtime): `gs_next_month` · `es_slow_reply` · `mmw_tracking`

## Post-call analyzer (quality / G1)

| | |
|---|---|
| Prompt | `ethan_next_month.analyzer.vA.prompt.txt` |
| Meta | `ethan_next_month.scoring_meta.json` |
| Model | Opus (`claude-opus-5`) — same as MC1 |
| Shape | One **G1** band per competency, 0–10 each · max **30** · pass **7**/10 overall |

| Competency id | Display | G1 (quality aim) |
|---|---|---|
| `setting_goals` | Goal Setting | Aims Ethan at sign-ups instead of calls, with a number and a timeframe |
| `setting_expectations` | Expectations Setting | Sets a specific reply time for customer emails instead of “try to be quicker” |
| `measuring_results` | Managing & Measuring Work | Agrees what to look at and how often instead of an end-of-month report |

Coverage ticks can be true while G1 stays low (agreement without the strong managerial move).

## How it went (learner usefulness)

Staging chrome already shows these labels — fill from analyzer JSON only:

| Analyzer field | UI |
|---|---|
| `summary` | Overall “How it went” / coach summary for the whole call |
| `competencies.*.note` | Per-skill “How it went” |
| `competencies.*.youSaid` | “You said” |
| `competencies.*.tryInstead` | “Try instead” |
| `nextStep` | “Your next step” (headline + body) |

Headline bands (app-derived from score share when needed): strong / getting-there style mapping to staging **Nailed it / Solid / Try again** where that chrome exists. Do not invent new labels.

**Learner usefulness check:** summary + each note should say what happened, what it means for Ethan / the plan after the call, and the manager habit behind it — not a move inventory or score dump.

## Playbook / QA evidence

Ethan has generic playbook-style batch runs under the MC03 storyline output (vA). Use those for calibration; this pack ships the locked prompts + criteria above.
