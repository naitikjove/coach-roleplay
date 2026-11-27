# QA playbooks — Rebecca (Performance and Feedback in Practice)

LLM-learner playbooks used to test the roleplay end to end (actor, coverage judge, analyzer). Each file lists the learner intents, expected score band (`total`, per-beat ranges A-D) and behavior checks (`adherence_flags_max`, markers).

- `01_gold_strong.json`
- `02_partial_pieces.json`
- `03_stay_in_scene.json`
- `index.json` (playbook order and sets)

## Latest results (OpenAI models, text simulation; from the Arena QA suite and story pack, 2026-11-26/27)

| Playbook | Result |
|---|---|
| gold_strong | 40/40 on r1, r6, r7, r8. Later runs: r9 25/40 (simulated learner gave weak answers, correct for what was said); **r15 31/40** (A 4, B 7, C 10, D 10; simulated learner gave generic praise for Zara with no facts), which is outside the expected 36-40 band |
| partial_pieces | 27/40 (r2, r3); 25/40 (r14, passed its 16-34 band); follow-ups fired on beats A and C |
| stay_in_scene | Passed, no breaking character (r5) |

Adherence checker: 0 flags on r4, r5, r7, r9; evaluation copy lint clean on r8.

**Not run:** Opus analyzer, Sonnet, live Realtime voice. Certificate is a draft.

The runner scripts and run folders live in the internal Arena workspace (`qa-mc7-post-v1/scripts/`); they read API keys from local env files and are not part of this handoff.
