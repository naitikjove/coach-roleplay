# Objective tracking + How it went (Marcus practice)

Self-contained for integrators — nothing here depends on the Arena source code. Mid-call ticks ≠ post-call quality scores.

## Mid-call coverage (live objective ticks)

| | |
|---|---|
| Count | **3** (same as the brief objectives) |
| Scene ids | `scene-mc6-marcus-practice` (judge match: id contains `mc6` or `marcus`) |
| Judge | Settle/decision coverage only — not quality (criteria below, copied from the live coverage judge) |
| Output | `{"1":boolean,"2":boolean,"3":boolean}` |
| Run | Hidden out-of-band judge request after each character reply, from the 2nd reply on (never on the opening line) |

Ticks go true only when the matter is **settled** (the manager gave a direction and Marcus acknowledged or moved on). The character volunteering alone, a bare “okay”, or a greeting = false. A weak managerial choice still ticks true for coverage.

### Criteria (order = UI objectives 1–3)

1. **Obj1 (the late follow-ups)** — The manager gave any direction on Marcus's late follow-up calls (asked why customers call back, asked for an example or what is in his note, agreed he should stay late, took his follow-ups, or told him to try harder) **and** Marcus answered it or moved on to how he handles his calls. Greeting alone, a question alone, Marcus's words alone, or a weak okay alone = false.
2. **Obj2 (how he handles his calls)** — The manager gave any direction on how Marcus handles his calls (a step on every call, write more, keep his calls as they are, let the tech team call the customer, or look at it later) **and** Marcus accepted it or moved on to the upset customers. A question alone, Marcus's words alone, or a weak okay alone = false.
3. **Obj3 (the upset customers)** — The manager gave any direction on the upset customers (do the calls with Nina, ask someone for tips, leave Marcus to it, or take the calls) **and** Marcus accepted it or the call is closing. A question alone, Marcus's words alone, or a weak okay alone = false. Do **not** judge whether the plan is good.

Checklist ids (runtime): `slipping_followups` · `handle_calls` · `repeat_callers`

## Post-call analyzer (quality)

| | |
|---|---|
| Prompt | `prompts/marcus_practice.analyzer.prompt.txt` |
| Meta | `prompts/marcus_practice.scoring_meta.json` |
| Model | Opus (`claude-opus-5`) — same as MC1, with the reasoning-effort guard in `WIRING.md` |
| Shape | 0–10 per competency (range set by the move; one of three checks sets the exact point) · max **30** · pass **7** |
| Bands | Strong 24–30 · Getting there 15–23 · Needs practice 0–14 |
| Fixed points | gave in after the push = **2** · easy answer taken with no earlier move = **0** |
| Evidence | every score above 0 needs a verbatim learner quote |

| Competency id | Display | Top-range aim |
|---|---|---|
| `assessing_capabilities` | Assessing Capabilities | Asks what is really happening with the repeat calls (why customers call back, an example, what goes in the note) before agreeing to stay late. Agreeing to stay late, taking the follow-ups away or telling him to try harder = 0. |
| `coaching_team_members` | Coaching Team Members | Gives one clear change to the note that captures the whole problem, says why it helps (fixed the first time, no second call) and keeps it when Marcus asks about busy times. Leaving calls as they are, letting the tech team call or "only when it's quiet" = 0. |
| `sharing_knowledge` | Sharing Knowledge | Brings Nina in to help with the upset calls, by guiding Marcus or sitting in, starting with these three, and keeps it when Marcus says Nina has her own calls. Leaving Nina out or leaving him alone = 0. |

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
