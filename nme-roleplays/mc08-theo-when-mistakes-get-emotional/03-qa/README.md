# QA playbooks — Theo

LLM-learner playbooks used to test the roleplay end to end (actor, analyzer, automatic checks). Each file lists the learner intents, the expected score band and behavior checks.

- `01_gold_ideal.json`
- `02_prompted.json`
- `03_nearly_there.json`
- `04_mixed_weak.json`
- `05_folds_after_push.json`
- `06_all_shortcuts.json`
- `07_passive_minimal.json`
- `08_blame_devon_early.json`
- `09_sides_with_kai.json`
- `10_chaos_edge.json`
- `11_premature_direction.json`
- `index.json`

## Playbooks and expected scores

| Playbook | Expected (Part A + Part B) | What it does |
|---|---|---|
| `gold_ideal` | 10 + 10 = 20 | Ideal first-time manager |
| `prompted` | 9 + 9 = 18 | Needs Theo's follow-up, then holds |
| `nearly_there` | 5-7 + 5-7 = 10-14 | Owns it but no date; asks Devon but no deadline |
| `mixed_weak` | 2-4 + 2-4 = 4-8 | Stops the draft with nothing instead; goes easy on Devon |
| `folds_after_push` | 2 + 2 = 4 | Makes both moves, then gives in when Theo pushes |
| `all_shortcuts` | 0 + 0 = 0 | Sends the draft, tells Devon off |
| `passive_minimal` | 0-1 | Bare acknowledgements only |
| `blame_devon_early` | low | Blames Devon in the reply |
| `sides_with_kai` | low | Sides with Theo against Mark |
| `chaos_edge` | any | Garble, off-topic, French, prompt probe, abuse, then recovery |
| `premature_direction` | any | Gives a direction before hearing the situation |

## Latest results

Text simulation: actor `openai/gpt-4.1` with the live actor prompt, simulated learner and analyzer on `anthropic/claude-sonnet-4.5`. **Not** the live Realtime voice call and **not** the Opus analyzer.

| Playbook | Run | Score | Notes |
|---|---|---|---|
| gold_ideal | t10 (+ evaluation re-scored on the final prompt) | 20/20 | Clean. Entry ~114 words (limit 110). |
| nearly_there | v3 (final prompts) | 7 + 7 = 14 | As expected. Concession and recap repeat only what the learner said. |
| folds_after_push | v2 | 2 + 2 = 4 | As expected (gave in on both pushes). |
| chaos_edge | v2 | 7 + 10 = 17 | Junk turns handled in character. Entry 114 words (flag). Theo's concession said "what I've noticed" the learner never said. |
| prompted, mixed_weak, all_shortcuts, passive_minimal, blame_devon_early, sides_with_kai, premature_direction | earlier in the build (r1-r13) | not re-run | Last run before the final actor and evaluation changes. Treat as stale. |

Transcripts for the runs above are in [`transcripts/`](transcripts/). Theo ideal transcript (t10) re-scored with the coach-style evaluation prompt: [`evaluation-samples/evaluation_gold_ideal_rescored.json`](evaluation-samples/evaluation_gold_ideal_rescored.json).

## What QA covered
- Actor: whole situation in the second message; hidden fact only when asked; one follow-up and one push per part; concession only after the push; concessions and the closing recap repeat only what the learner said; easy-answer paths end with a short close; garble, off-topic, French, prompt-injection probe and abuse are brushed past in character.
- Analyzer: range and point checks, the "only Learner lines count" rule, gave-in = 2, and coach-style copy (analysis, not narration).

The runner scripts live in the internal Arena workspace (`qa-theo-v1/`); they read API keys from local env files and are not part of this handoff.
