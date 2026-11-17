# Objective tracking + How it went (Daniel certificate)

Self-contained for integrators. Mid-call ticks ≠ post-call quality scores.

## Mid-call coverage (live objective ticks)

| | |
|---|---|
| Count | **3** (same as brief objectives) |
| Scene ids | `scene-mc3-daniel-post`, any id containing `daniel` |
| Judge prompt rev | **5** (settle/decision coverage only — not quality) |
| Output | `{"1":boolean,"2":boolean,"3":boolean}` |

Ticks go true only when the matter is **settled** (both engaged; a decision/agreement exists). Character volunteering alone, bare “okay”, or greeting-only = false. A settled but weak managerial choice still ticks true for coverage.

### Criteria (order = UI objectives 1–3)

1. **Obj1 (templates plan)** — What happens to the ten templates over the next stretch (keep the eight-week plan, re-scope, schedule, or an explicit push/defer decision) was agreed **and** Daniel acknowledged or advanced. Daniel only asking to push to next year with no manager decision = false.
2. **Obj2 (newer designers / tricky jobs)** — How to handle the newer designers sending every tricky job to Daniel was agreed **and** Daniel acknowledged or advanced. Venting alone with no decision = false.
3. **Obj3 (whether templates are working)** — How both will tell leadership whether the templates are working (signal, review, metric, or check-in) was agreed **and** Daniel acknowledged or advanced. Reporting only “how many finished” with no agreed method can still count if that method was explicitly accepted. Vague later with no method = false. Do **not** judge quality of the measure.

Checklist ids (runtime): `templates_plan` · `newer_designers` · `templates_working`

## Post-call analyzer (quality / G1)

| | |
|---|---|
| Prompt | `daniel_post.analyzer.prompt.txt` |
| Meta | `daniel_post.scoring_meta.json` |
| Model | Opus (`claude-opus-5`) — same as MC1 |
| Shape | One **G1** band per competency, even bands **0/2/4/6/8/10** · max **30** · pass **7**/10 overall |

| Competency id | Display | G1 (quality aim) |
|---|---|---|
| `setting_goals` | Goal Setting | Keeps the templates, with set weekly time and a rule for urgent jobs |
| `setting_expectations` | Expectations Setting | Finds out why, then makes clear which jobs are the newer designers' and how Daniel helps them start |
| `measuring_results` | Managing & Measuring Work | Counts the small jobs still coming in, with a target and who checks it how often |

Coverage ticks can be true while G1 stays low (e.g. agreeing to push templates to next year settles Obj1 for coverage but scores 0 on Goal Setting G1).

## How it went (learner usefulness)

Staging chrome already shows these labels — fill from analyzer JSON only:

| Analyzer field | UI |
|---|---|
| `summary` | Overall “How it went” / coach summary for the whole call |
| `competencies.*.note` | Per-skill “How it went” |
| `competencies.*.youSaid` | “You said” |
| `competencies.*.tryInstead` | “Try instead” |
| `nextStep` | “Your next step” (headline + body) |

Analyzer copy rules already require summary + each note to name what happened, what it means for Daniel / the team after the call, and the manager habit behind it — so How it went stays useful for learners, not a score dump.

Headline bands (app-derived): score share maps to staging **Nailed it / Solid / Try again** where that chrome exists. Do not invent new labels.

## Playbook / QA evidence

Daniel has a thinner QA run set than Ethan (ideal / shortcuts / fold / mixed style transcripts). Treat prompts + `scoring_meta.json` as source of truth; expand playbook batches later if needed.
