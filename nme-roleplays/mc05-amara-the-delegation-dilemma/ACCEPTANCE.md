# Acceptance — variable items only

## Frontend
- [ ] No certificate headline or entry line added (keep production)
- [ ] Title = **The Delegation Dilemma**
- [ ] Scenario + about lines + 3 objectives + who cards = `01-frontend/COPY.md`
- [ ] Competencies + Must Watch = `01-frontend/VIDEO_MAPPING.md` (41965, 41967, 41969)
- [ ] Pass threshold = **7 / 10**
- [ ] Pack asset committed: `01-frontend/assets/amara.jpg`
- [ ] App path for prod wiring: `/arena/exp4/characters/amara-v4.jpg`

## Backend
- [ ] Actor + analyzer prompts from `02-backend/prompts/` (`amara_mc5_cert.*.vA`)
- [ ] Voice = `ballad` · Realtime = `gpt-realtime-2.1`
- [ ] Analyzer = **Opus (`claude-opus-5`), same as MC1 — do not change**, with the reasoning-effort guard in `WIRING.md`
- [ ] Checklist ids + pass threshold 7 from `scene-runtime.json`
- [ ] Live objective ticks follow `02-backend/OBJECTIVE_TRACKING.md` (3 ticks, settle-only)
- [ ] Scene id = `scene-mc5-amara-post`
- [ ] Turn recording keeps learner line before the character reply (see `WIRING.md`)

## Smoke
- [ ] Brief shows locked copy and the new portrait
- [ ] Live call opens; Amara speaks first with the full situation; feedback uses existing staging shell
- [ ] Ideal answers score 30/30; the QA playbooks in `03-qa/` behave as listed in `03-qa/README.md`

## Known gaps

- [ ] Transcript order: Realtime can store the learner line after the character reply. Fix before relying on push/hold scoring in production (see `02-backend/WIRING.md`).
- [ ] Live voice test of `ballad` not done yet (text-simulated QA only).
- [ ] QA results in the README were carried over from the MC05 QA log and **not re-run** while assembling this pack; shortcut/gives-in/prompted variants last passed on an earlier prompt version.
- [ ] Playbook runner scripts and run outputs are not part of this pack (internal Arena workspace).
- [ ] The story-design document (facts, beats, ideal transcript, scoring grid) is not in this pack; it lives with the MC05 pack in the GitLab roleplay repo.
- [ ] Copy in this pack uses typographic apostrophes (as in the app constants); the local scene JSON uses straight ones. Cosmetic only.
- [ ] Amara can repeat a return question after some fact answers (minor).
