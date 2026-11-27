# QA playbooks — Jordan

LLM-learner playbooks used to test the roleplay end to end (actor, coverage judge, Opus analyzer). Each file lists the learner intents, expected score band and, where relevant, behavior checks.

- `01_ideal.json`
- `02_prompted.json`
- `03_shortcuts.json`
- `04_owns_then_folds.json`
- `05_mixed.json`
- `06_passive_story_moves.json`
- `07_early_exit.json`
- `08_off_topic.json`
- `09_responsive.json`

The runner scripts live in the internal Arena workspace (`qa-jordan/scripts/`); they read API keys from local env files and are not part of this handoff.

Latest results are in the pack [`README.md`](../README.md#qa-status).
