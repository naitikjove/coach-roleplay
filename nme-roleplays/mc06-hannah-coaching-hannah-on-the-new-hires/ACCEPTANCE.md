# Acceptance — variable items only

## Frontend
- [ ] No certificate headline or entry line added (keep production)
- [ ] Title = **Coaching Hannah on the New Hires**
- [ ] Scenario + about lines + 3 objectives + who cards = `01-frontend/COPY.md`
- [ ] Competencies + Must Watch = `01-frontend/VIDEO_MAPPING.md` (41970, 41978, 41975)
- [ ] Pass threshold = **7 / 10**
- [ ] Pack asset committed: `01-frontend/assets/hannah.jpg` (open on GitHub)
- [ ] App path for prod wiring: `/arena/exp4/characters/hannah.jpg`

## Backend
- [ ] Actor + analyzer prompts from `02-backend/prompts/` (`hannah_mc6_cert.actor.vA.prompt.txt`, `hannah_mc6_cert.analyzer.vA.prompt.txt`)
- [ ] Voice = `marin` · Realtime = `gpt-realtime-2.1`
- [ ] Analyzer = **Opus (`claude-opus-5`), same as MC1 — do not change**, with the reasoning-effort guard in `WIRING.md`
- [ ] Checklist ids + pass threshold 7 from `scene-runtime.json` (`course_request`, `welcome_new_hires`, `learn_from_team`)
- [ ] Scene id = `scene-mc6-hannah-cert` · lock = `1.0.0-hannah-cert-v1-local`
- [ ] Live objective ticks follow `02-backend/OBJECTIVE_TRACKING.md` (3 ticks, settle-only)
- [ ] Turn recording keeps learner line before the character reply (see `WIRING.md`)

## Smoke
- [ ] Brief shows locked copy and the character image
- [ ] Live call opens; Hannah speaks first with the full situation; feedback uses existing staging shell
- [ ] Ideal answers score 30/30; the QA playbooks in `03-qa/` behave as listed in `03-qa/README.md`

## Known gaps
- The local scene JSON does not pin an analyzer model. "Opus (`claude-opus-5`), same as MC1" follows the MC03–MC05 pack convention and the Vercel demo config; confirm against production.
- The objective-judge criteria in `02-backend/OBJECTIVE_TRACKING.md` are copied from the live coverage judge in the Arena app; the judge's revision number is not recorded here.
- Lock version ends in `-local`: it is the locally locked build, not a released tag.
- `02-backend/STORY_PACK.md` is the local story bible v1 (2026-11-26); it was not re-checked line by line against later prompt edits.
- Thinner QA than MC05: 3 playbooks (ideal, passive, mixed); only the ideal run has an analyzer score (30/30); mixed and passive were conversation-only.
- The app defines no MC1 headline replacement for the MC6 certificate slot — keep production copy.
