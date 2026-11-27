# QA playbooks — Jenna

LLM-learner playbooks used to test the roleplay end to end (actor, analyzer, automatic checks). Each file lists the learner intents, the expected score band and behavior checks.

- `01_gold_ideal.json`
- `02_mixed_weak.json`
- `03_folds_after_push.json`
- `04_nearly_there.json`
- `05_all_shortcuts.json`
- `06_chaos_edge.json`
- `index.json`

## Playbooks and expected scores

| Playbook | Expected (Part A + Part B) | What it does |
|---|---|---|
| `gold_ideal` | 10 + 10 = 20 | Ideal first-time manager |
| `mixed_weak` | 2-4 + 2-4 = 4-8 | Stops the email with nothing instead; kind but vague about Kayla |
| `folds_after_push` | 2 + 2 = 4 | Makes both moves, then gives in when Jenna pushes |
| `nearly_there` | 5-7 + 5-7 = 10-14 | Owns it but no time; asks Kayla but no Friday plan |
| `all_shortcuts` | 0 + 0 = 0 | Sides with Jenna, says yes to Wednesday |
| `chaos_edge` | any | Garble, off-topic, French, prompt probe, abuse, then recovery |

## Latest results

Text simulation: actor `openai/gpt-4.1` with the live actor prompt, simulated learner and analyzer on `anthropic/claude-sonnet-4.5`. **Not** the live Realtime voice call and **not** the Opus analyzer.

| Playbook | Run | Score | Notes |
|---|---|---|---|
| gold_ideal | j7 (evaluation re-scored on the final coach-style prompt) | 20/20 | Clean. |
| mixed_weak | j5 | 4 + 3 = 7 | As expected. Run before the final actor and evaluation fixes. |
| folds_after_push | j6 | 2 + 2 = 4 | As expected. Run before the final actor and evaluation fixes. |
| nearly_there | v2 (final prompts) | 7 + 7 = 14 | As expected. |
| all_shortcuts | v2 (final prompts) | 0 + 0 = 0 | As expected; poor close now fires. |
| chaos_edge | v2 (final prompts) | 9 + 7 = 16 | As expected. Junk turns handled in character. |

Transcripts for the runs above are in [`transcripts/`](transcripts/). Jenna ideal transcript (j7) re-scored with the coach-style evaluation prompt: [`evaluation-samples/evaluation_gold_ideal_rescored.json`](evaluation-samples/evaluation_gold_ideal_rescored.json).

## What QA covered
- Actor: whole situation in the second message; hidden fact only when asked; one follow-up and one push per part; concession only after the push; concessions and the closing recap repeat only what the learner said; easy-answer paths end with a short close; garble, off-topic, French, prompt-injection probe and abuse are brushed past in character.
- Analyzer: range and point checks, the "only Learner lines count" rule, gave-in = 2, and coach-style copy (analysis, not narration).

The runner scripts live in the internal Arena workspace (`qa-jenna-v1/`); they read API keys from local env files and are not part of this handoff.
