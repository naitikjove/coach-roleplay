# Objective tracking + How it went (Hannah certificate)

Self-contained for integrators — nothing here depends on the Arena source code. Mid-call ticks ≠ post-call quality scores.

## Mid-call coverage (live objective ticks)

| | |
|---|---|
| Count | **3** (same as the brief objectives) |
| Scene ids | `scene-mc6-hannah-cert` (judge match: id contains `hannah`) |
| Judge | Settle/decision coverage only — not quality (criteria below, copied from the live coverage judge) |
| Output | `{"1":boolean,"2":boolean,"3":boolean}` |
| Run | Hidden out-of-band judge request after each character reply, from the 2nd reply on (never on the opening line) |

Ticks go true only when the matter is **settled** (the manager gave a direction and Hannah acknowledged or moved on). The character volunteering alone, a bare “okay”, or a greeting = false. A weak managerial choice still ticks true for coverage.

### Criteria (order = UI objectives 1–3)

1. **Obj1 (the course request)** — The manager gave any direction on the two-day course (asked what is going on in a new hire's first week, asked for an example, approved it, said do it anyway, or told Hannah to push on) **and** Hannah answered it or moved on to how she welcomes new hires. Greeting alone, a question alone, Hannah's words alone, or a weak okay alone = false.
2. **Obj2 (welcoming new hires)** — The manager gave any direction on how Hannah welcomes new hires (a first task, a day-one check-in, more in the handbook, be more supportive, or leave it) **and** Hannah accepted it or moved on to Joel's team. A question alone, Hannah's words alone, or a weak okay alone = false.
3. **Obj3 (Joel's team)** — The manager gave any direction on the other team (Joel's help by a group, a demo, pairing or guiding; ask Joel for tips; use his checklist; or leave it) **and** Hannah accepted it or the call is closing. A question alone, Hannah's words alone, or a weak okay alone = false. Do **not** judge whether the plan is good.

Checklist ids (runtime): `course_request` · `welcome_new_hires` · `learn_from_team`

## Post-call analyzer (quality)

| | |
|---|---|
| Prompt | `prompts/hannah_mc6_cert.analyzer.vA.prompt.txt` |
| Meta | `prompts/hannah_mc6_cert.scoring_meta.json` |
| Model | Opus (`claude-opus-5`) — same as MC1, with the reasoning-effort guard in `WIRING.md` |
| Shape | 0–10 per competency (range set by the move; one of three checks sets the exact point) · max **30** · pass **7** |
| Bands | Strong 24–30 · Getting there 15–23 · Needs practice 0–14 |
| Fixed points | gave in after the push = **2** · easy answer taken with no earlier move = **0** |
| Evidence | every score above 0 needs a verbatim learner quote |

| Competency id | Display | Top-range aim |
|---|---|---|
| `assessing_capabilities` | Assessing Capabilities | Asks what is really happening with the new hires (what their first week looks like, why they leave, an example, what they said, what Hannah sends them) before agreeing to the course. Approving or booking the course, or telling Hannah to push on = 0. |
| `coaching_team_members` | Coaching Team Members | Gives one clear change for new hires that Hannah does from now on, says why it helps (they know what to do, they stay) and keeps it when Hannah says she is in client meetings all week. More in the handbook or leaving things as they are = 0. |
| `sharing_knowledge` | Sharing Knowledge | Brings Joel in to help Hannah with new hires (a group, a demo, pairing or guiding) with a clear start, and keeps it when Hannah says it is a lot to ask of Joel. Leaving Joel out or just using Joel's checklist = 0. |

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

Copy rules (plain English, names explained, no invented detail) are inside the analyzer prompt — do not rewrite them in the UI.
