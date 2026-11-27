# QA playbooks — Hannah

LLM-learner playbooks used to test the roleplay end to end (actor, coverage judge, analyzer). Each file lists the learner intents, expected score band and behavior checks (`must_hit` / `must_avoid`).

- `01_ideal.json`
- `02_passive.json`
- `03_mixed.json`
- `index.json`

Suite name: `qa-hannah-cert-v1` (`index.json` gives the run order).

The runner scripts live in the internal Arena workspace (`by-mc/mc06-coaching-and-developing-teams/`, `qa/scripts/dry-run-playbook.mjs`); they read API keys from local env files and are not part of this handoff.

## QA status

Verified from the local run folders (internal Arena workspace, `output-hannah-cert/qa/runs/vA/`, 2026-11-26):

- Ideal playbook run `hannah-9i`: analyzer score **30 / 30**.
- Mixed and passive playbook runs exist but were conversation-only (analyzer skipped), so no scores are claimed for them.
- Only 3 playbooks exist (ideal, passive, mixed), a thinner batch than the MC05 pack's 9. See `../ACCEPTANCE.md` → Known gaps.
