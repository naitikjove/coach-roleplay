# Acceptance — variable items only

## Frontend
- [ ] Title = **Performance and Feedback in Practice**
- [ ] Scenario + 3 about lines + 4 objectives + who cards = `01-frontend/COPY.md`
- [ ] Competencies + Must Watch = `01-frontend/VIDEO_MAPPING.md` (41981, 41503, 41985, 41984)
- [ ] Pass threshold = **7 / 10**
- [ ] Pack asset committed: `01-frontend/assets/rebecca.png` (open on GitHub)
- [ ] App path for prod wiring: `/arena/exp4/characters/reporting-manager.png`

## Backend
- [ ] Actor + analyzer prompts from `02-backend/prompts/` (`becca_mc7_post.*.vA`)
- [ ] Voice = `shimmer` · Realtime = `gpt-realtime-2.1`
- [ ] Analyzer = **Opus (`claude-opus-5`), same as MC1 — do not change**
- [ ] Checklist ids + pass threshold 7 from `scene-runtime.json` (`cpr_review`, `dr_debrief`, `gf_felix`, `au_omar`)
- [ ] Live objective ticks follow `02-backend/OBJECTIVE_TRACKING.md` (4 ticks, settle-only)
- [ ] Scene id = `scene-mc7-becca-post`

## Smoke
- [ ] Brief shows locked copy
- [ ] Live call opens; Rebecca speaks first and gives the first item; feedback uses existing staging shell
- [ ] Ideal answers score 40/40; the playbooks in `03-qa/` behave as listed in `03-qa/README.md`

## Known gaps
- **Portrait:** the character image is the temporary shared Rebecca avatar (`reporting-manager.png`, same as MC4), not a MC7-specific portrait. The app constants say the same.
- **Modal headline:** MC3/MC4 packs replace the MC1 modal headline for their slot. No MC7 headline replacement has been written or locked yet, so none is specified here. Content team to supply it. The app's entry-purpose line is in `01-frontend/COPY.md` for reference.
- **Brief path:** `briefPath` in `brief-ui.json` follows the MC3/MC4 pattern `/<lesson-slug>/certificate-roleplay?step=brief` using the scene's `lessonSlug` (`how-to-manage-team-performance-and-feedback`). It was not checked against production routes.
- **Chapter name:** the app constant names the chapter "How to Manage Team Performance and Feedback"; the local live chapter list shows MC7 under a different name ("Running Effective 1:1 Meetings" in the local test notes). Confirm the production chapter name before wiring.
- **Scoring ranges in the scene file:** the scene JSON lists `scoring.ranges` as even bands (0, 2, 4, 6, 8, 10), while the analyzer prompt scores in ranges 0-1 / 2-4 / 5-7 / 8-10 with top/middle/bottom checks. The analyzer prompt is the source of truth; `scene-runtime.json` keeps the scene values and adds a `scoringNote`.
- **Analyzer model:** all MC7 QA ran on OpenAI models (actor/learner/judge gpt-4.1, analyzer gpt-5.6-terra). The Opus analyzer named here has not been run on MC7.
- **Live voice:** no live Realtime voice call was run after the last prompt changes.
- **Not locked:** certificate status is draft. Only three playbooks exist (gold_strong, partial_pieces, stay_in_scene).
- **Latest gold run did not meet its band:** `cert-r15` gold_strong scored 31/40 (A 4, B 7, C 10, D 10) against an expected 36-40, because the simulated learner gave generic praise for Zara with no facts. Earlier gold runs (r1, r6, r7, r8) scored 40/40. Re-run on the final prompt with a corrected learner before lock.
- **Checklist id:** the 4th objective is about Ravi but its runtime id is still `au_omar` (an earlier character name). Kept as-is in `scene-runtime.json` because the live scene uses it.
