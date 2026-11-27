# Objective tracking + How it went (Jenna certificate)

Self-contained for integrators. Mid-call ticks ≠ post-call quality scores.

## Mid-call coverage (live objective ticks)

| | |
|---|---|
| Count | **2** (same as brief objectives) |
| Scene ids | `scene-mc8-jenna-cert`, any id containing `jenna` |
| Judge | settle/decision coverage only, not quality |
| Output | `{"1":boolean,"2":boolean}` |

Ticks go true only when the matter is **settled** (the learner gave a direction and Jenna acknowledged it or moved on). Jenna volunteering alone, a bare "okay", or greeting-only = false. A weak managerial choice still ticks true for coverage.

### Criteria (order = UI objectives 1–2)

1. Obj1 (the email about Ryan): The manager gave any direction on Jenna's email to the whole team about Ryan's mistakes (hold it, don't send it, own her part, say sorry to Ryan, talk to Ryan privately at a set time, send it as is, or soften it) AND Jenna acknowledged it or moved on to Kayla. Greeting alone = false. A question alone = false. Jenna's words alone = false. Weak okay alone = false.
2. Obj2 (talking to Kayla): The manager gave any direction on how Jenna should talk to Kayla (say what she has noticed, ask what's going on, keep Friday with a first version, a midweek check-in, just say yes, or say no) AND Jenna acknowledged it or the call is closing. A question alone = false. Jenna's words alone = false. Weak okay alone = false. Do NOT judge whether the plan is good.

Checklist ids (runtime): `team_email`, `kayla_request`

## Post-call analyzer (quality / G1)

| | |
|---|---|
| Prompt | `jenna_heated_week.analyzer.vA.prompt.txt` |
| Meta | `jenna_heated_week.scoring_meta.json` |
| Model | Opus (`claude-opus-5`), same as MC1 |
| Shape | One **G1** (0–10) per competency. Range first (`0-1`, `2-4`, `5-7`, `8-10`), then the point from three checks (bottom 2/5/8, middle 3/6/9, top 4/7/10) · max **20** · bands 17–20 Strong, 10–16 Getting there, 0–9 Needs practice · pass **7**/10 overall (`score` = round(sumScore/20×10)) |

| Competency id | Display | G1 (quality aim) |
|---|---|---|
| `managing_emotions` | Managing Emotions | Holds the all-team email, owns how she spoke or her part, and gives a time to talk to Ryan |
| `demonstrating_awareness` | Demonstrating Awareness | Says what Jenna has noticed or asks what is going on, and keeps Friday for the client |

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

