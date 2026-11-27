# QA playbooks — Rebecca (Writing the Mid-Year Reviews)

LLM-learner playbooks used to test the roleplay end to end (actor, coverage judge, analyzer). Each file lists the learner intents, expected score band (`total`, per-beat ranges A-D) and behavior checks (`adherence_flags_max`, markers).

- `01_gold_strong.json`
- `02_trap_label.json`
- `03_trap_activity_list.json`
- `04_trap_team_note.json`
- `05_trap_formal_plan.json`
- `06_mixed_recover.json`
- `07_partial_pieces.json`
- `08_out_of_order.json`
- `09_thin_input.json`
- `10_derail.json`
- `11_scene_probe.json`
- `12_abuse_safety.json`
- `13_meta_jailbreak.json`
- `14_info_stress.json`
- `15_early_exit.json`
- `16_long_run.json`
- `17_hedgy_novice.json`
- `18_textbook_jargon.json`
- `19_decide_for_me.json`
- `20_garble_language.json`
- `21_kitchen_sink_good.json`
- `index.json` (playbook order and sets)

## Latest results (OpenAI models, text simulation; from the Arena QA suite `LOCKED.md` / `RESULTS.md`, 2026-11-26)

| Playbook | Result |
|---|---|
| gold_strong | 40/40 on the locked prompt (r24); evidence at lock: r12 40/40, r23 40/40; r24 closing recap named only three of four beats |
| partial_pieces | 27/40 with follow-ups firing (r25) |
| kitchen_sink_good | 37/40 (r18, A9 B9 C9 D10) |
| stay_in_scene / strict-script / derail | 29-31/40 across r14-r17 with clean adherence on the later rounds (older prompt versions) |
| Evaluation re-score stability | live call 29/40 x3 identical, gold 40/40 x4, mixed_recover 36/40 x4 |

**Not run on the final prompt:** the other playbooks (several still hold older-design learner intents). **Not run:** Opus analyzer, Sonnet, live Realtime voice after the last prompt changes.

The runner scripts and run folders live in the internal Arena workspace (`qa-mc7-v1/scripts/`); they read API keys from local env files and are not part of this handoff.
