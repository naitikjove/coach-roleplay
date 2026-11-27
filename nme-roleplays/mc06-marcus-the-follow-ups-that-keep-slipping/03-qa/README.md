# QA playbooks — Marcus

LLM-learner playbooks used to test the roleplay end to end (actor, coverage judge, analyzer). Each file lists the learner intents, expected score band and behavior checks (`must_hit` / `must_avoid`).

- `01_ideal.json`
- `02_prompted.json`
- `03_owns_then_folds.json`
- `04_all_shortcuts.json`
- `05_mixed_partial.json`
- `06_declines_offer.json`
- `07_passive.json`
- `09_curious.json`
- `index.json`

Suite name: `qa-marcus-v4` (`index.json` gives the run order).

The runner scripts live in the internal Arena workspace (`by-mc/mc06-coaching-and-developing-teams/`, `qa/scripts/dry-run-playbook.mjs`); they read API keys from local env files and are not part of this handoff.

## QA status

Verified from the suite's own README (`output-marcus-v4/qa/README.md`, internal Arena workspace):

- Batch 2 (2026-11-25, after adding the PUSH GATE to the actor prompt): ideal **30**, prompted **24**, owns_then_folds **6**, all_shortcuts **0**, mixed_partial **14**.
- Batch 1 found Marcus skipping his push in B and C on complete first answers (ideal and owns_then_folds); fixed in batch 2.
- Further ideal / mixed_partial runs exist locally from 2026-11-26; no scored summary of them is recorded, so none is claimed here.
