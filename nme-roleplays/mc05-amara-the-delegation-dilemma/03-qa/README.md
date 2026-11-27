# QA playbooks — Amara

LLM-learner playbooks used to test the roleplay end to end (actor, coverage judge, Opus analyzer). Each file lists the learner intents, expected score band and, where relevant, behavior checks.

- `01_ideal.json`
- `02_prompted.json`
- `03_shortcuts.json`
- `04_gives_in_after_push.json`
- `05_asks_questions.json`
- `06_public_generic.json`
- `07_vague_monitoring.json`
- `08_off_topic.json`
- `09_responsive.json`

The runner scripts live in the internal Arena workspace (`qa-amara/scripts/`); they read API keys from local env files and are not part of this handoff.

Latest results are in the pack [`README.md`](../README.md#qa-status).
