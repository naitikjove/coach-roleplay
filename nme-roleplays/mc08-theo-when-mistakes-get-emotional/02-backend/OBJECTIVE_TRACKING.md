# Objective tracking + How it went (Theo practice)

Self-contained for integrators. Mid-call ticks ≠ post-call quality scores.

## Mid-call coverage (live objective ticks)

| | |
|---|---|
| Count | **2** (same as brief objectives) |
| Scene ids | `scene-mc8-theo-practice`, any id containing `theo` |
| Judge | settle/decision coverage only, not quality |
| Output | `{"1":boolean,"2":boolean}` |

Ticks go true only when the matter is **settled** (the learner gave a direction and Theo acknowledged it or moved on). Theo volunteering alone, a bare "okay", or greeting-only = false. A weak managerial choice still ticks true for coverage.

### Criteria (order = UI objectives 1–2)

1. Obj1 (the reply to Mark): The manager gave any direction on Theo's reply to Mark (hold it, don't send it, reply owning the miss, give Mark a next date, blame Devon, soften it, or send it as is) AND Theo acknowledged it or moved on to Devon. Greeting alone = false. A question alone = false. Theo's words alone = false. Weak okay alone = false.
2. Obj2 (talking to Devon): The manager gave any direction on how Theo should talk to Devon (say what he has noticed, ask what's going on, keep the Monday-evening deadline, go easy, be straight, or tell him it's not good enough) AND Theo acknowledged it or the call is closing. A question alone = false. Theo's words alone = false. Weak okay alone = false. Do NOT judge whether the plan is good.

Checklist ids (runtime): `client_reply`, `devon_talk`

## Post-call analyzer (quality / G1)

| | |
|---|---|
| Prompt | `theo_late_report.analyzer.vA.prompt.txt` |
| Meta | `theo_late_report.scoring_meta.json` |
| Model | Opus (`claude-opus-5`), same as MC1 |
| Shape | One **G1** (0–10) per competency. Range first (`0-1`, `2-4`, `5-7`, `8-10`), then the point from three checks (bottom 2/5/8, middle 3/6/9, top 4/7/10) · max **20** · bands 17–20 Strong, 10–16 Getting there, 0–9 Needs practice · pass **7**/10 overall (`score` = round(sumScore/20×10)) |

| Competency id | Display | G1 (quality aim) |
|---|---|---|
| `managing_emotions` | Managing Emotions | Holds the angry reply, then replies owning the miss with a clear next date |
| `demonstrating_awareness` | Demonstrating Awareness | Says what Theo has noticed or asks what is going on, and keeps the Monday-evening deadline |

Coverage ticks can be true while G1 stays low (for example agreeing to the character's easy answer settles the objective for coverage but scores 0 on G1).

## How it went (learner usefulness)

Staging chrome already shows these labels — fill from analyzer JSON only:

| Analyzer field | UI |
|---|---|
| `summary` | Overall "How it went" summary (5 sentences, coach voice) |
| `competencies.*.note` | Per-skill "How it went" (3 sentences: the principle, your moment, the effect and edge) |
| `competencies.*.youSaid` | "You said" (the scored quote) |
| `competencies.*.tryInstead` | "Try instead" |
| `nextStep` | "Your next step" (headline + body) |

The analyzer copy rules require analysis, not a retelling: each sentence names the manager skill, why strong managers do it, ONE moment, and the effect. They ban listing the learner's actions and ban management jargon. Character recaps and concessions never count as evidence; a piece counts only if a Learner line says it.

## QA evidence

See [`../03-qa/README.md`](../03-qa/README.md).
