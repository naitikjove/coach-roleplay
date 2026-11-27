# Acceptance — variable items only

## Frontend
- [ ] MC1 headline replacement for this practice slot = **Show how you’d help a team member who is new to client calls.** (not the MC1 first-1:1 headline)
- [ ] Title = **A Team Member’s First Client Calls**
- [ ] Scenario + about lines + 3 objectives + who cards = `01-frontend/COPY.md`
- [ ] Competencies + Must Watch = `01-frontend/VIDEO_MAPPING.md` (41968, 41963, 41966)
- [ ] Pass threshold = **7 / 10**
- [ ] Pack asset committed: `01-frontend/assets/jordan.jpg`
- [ ] App path for prod wiring: `/arena/exp4/characters/jordan-v2.jpg`

## Backend
- [ ] Actor + analyzer prompts from `02-backend/prompts/` (`jordan_first_calls.*.vA`)
- [ ] Voice = `verse` · Realtime = `gpt-realtime-2.1`
- [ ] Analyzer = **Opus (`claude-opus-5`), same as MC1 — do not change**, with the reasoning-effort guard in `WIRING.md`
- [ ] Checklist ids + pass threshold 7 from `scene-runtime.json`
- [ ] Live objective ticks follow `02-backend/OBJECTIVE_TRACKING.md` (3 ticks, settle-only)
- [ ] Scene id = `scene-mc5-first-calls-practice`
- [ ] Turn recording keeps learner line before the character reply (see `WIRING.md`)

## Smoke
- [ ] Brief shows locked copy and the new portrait
- [ ] Live call opens; Jordan speaks first with the full situation; feedback uses existing staging shell
- [ ] Ideal answers score 30/30

## Known gaps

- [ ] Transcript order: Realtime can store the learner line after the character reply. Fix before relying on push/hold scoring in production (see `02-backend/WIRING.md`).
- [ ] Live voice test of `verse` not done yet (text-simulated QA only).
- [ ] QA results in the README were carried over from the MC05 QA log and **not re-run** while assembling this pack; shortcut/gives-in/prompted variants last passed on an earlier prompt version.
- [ ] Playbook runner scripts and run outputs are not part of this pack (internal Arena workspace).
- [ ] The story-design document (facts, beats, ideal transcript, scoring grid) is not in this pack; it lives with the MC05 pack in the GitLab roleplay repo.
- [ ] Copy in this pack uses typographic apostrophes (as in the app constants); the local scene JSON uses straight ones. Cosmetic only.
- [ ] Jordan can skip a brief reaction to an unexpected learner suggestion before the scripted push (minor).
- [ ] After goodbye, Jordan can add an extra assistant-style line once the call has closed; no rule added yet.
- [ ] Pronouns: prompt and copy use “they”; the portrait and voice read male.
