# Objective tracking + How it went (Amara certificate)

Self-contained for integrators — nothing here depends on the Arena source code. Mid-call ticks ≠ post-call quality scores.

## Mid-call coverage (live objective ticks)

| | |
|---|---|
| Count | **3** (same as the brief objectives) |
| Scene ids | `scene-mc5-amara-post`, any scene id containing `amara` |
| Judge prompt rev | **8** (settle/decision coverage only — not quality) |
| Output | `{"1":boolean,"2":boolean,"3":boolean}` |
| Run | Hidden out-of-band judge request after each character reply, from the 2nd reply on (never on the opening line) |

Ticks go true only when the matter is **settled** (the manager gave a direction and Amara acknowledged or moved on). The character volunteering alone, a bare “okay”, or a greeting = false. A weak managerial choice still ticks true for coverage.

### Criteria (order = UI objectives 1–3)

1. **Obj1 (who takes the request)** — The manager gave any direction on who should take the sales team’s competitor comparison (Dev, Lena, asked about workload or experience first, or a vague steer like “whoever you think”) **and** Amara acknowledged it or moved on to how to keep track. Greeting alone, a question alone, Amara’s words alone, or a weak okay alone = false.
2. **Obj2 (keeping track)** — The manager gave any direction on how to keep track of the work (daily updates, reviewing every draft, one review partway, leaving it until the end, or guidance when she is stuck) **and** Amara acknowledged it or moved on to Dev. A question alone, Amara’s words alone, or a weak okay alone = false.
3. **Obj3 (thanking Dev)** — The manager gave any direction on how to thank Dev for the customer report (a private message, say it themselves, say it to the team, be specific about what he did, or no thanks needed) **and** Amara acknowledged it or the call is closing. A question alone, Amara’s words alone, or a weak okay alone = false. Do **not** judge whether the plan is good.

Checklist ids (runtime): `who_takes_request` · `keep_track` · `thank_dev`

## Post-call analyzer (quality)

| | |
|---|---|
| Prompt | `prompts/amara_mc5_cert.analyzer.vA.prompt.txt` |
| Meta | `prompts/amara_mc5_cert.scoring_meta.json` |
| Model | Opus (`claude-opus-5`) — same as MC1, with the reasoning-effort guard in `WIRING.md` |
| Shape | 0–10 per competency (range set by the move; one of three checks sets the exact point) · max **30** · pass **7** |
| Fixed points | gave in after the push = **2** · easy answer taken with no earlier move = **0** |
| Evidence | every score above 0 needs a verbatim learner quote |

| Competency id | Display | Top-range aim |
|---|---|---|
| `effective_delegation` | Effective Delegation | Asks what Dev and Lena are carrying and have done before, then picks Lena with reasons (skills, room, wants a bigger job), and holds on the push. Picking Dev for speed alone = 0 |
| `ensuring_accountability` | Ensuring Accountability | Turns down daily updates and checking every draft; sets one review partway and offers guidance. Vague lighter checking is partial; agreeing to daily updates = 0 |
| `recognizing_contributions` | Recognizing Contributions | Tells Dev himself, says exactly what he did and why it mattered, and shares it with the team. Public but generic is capped at 6; specific but private-only at 5; agreeing to a private generic thanks or “no thanks needed” scores 0–2 |

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
