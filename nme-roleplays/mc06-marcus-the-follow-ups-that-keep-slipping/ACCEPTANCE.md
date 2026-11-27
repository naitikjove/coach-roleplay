# Acceptance — variable items only

## Frontend
- [ ] MC1 headline replacement for this practice slot = **See how you'd coach your team to grow stronger** (not MC1 "See how you'd handle your first 1:1"); eyebrow, subtitle, chips unchanged where that modal exists
- [ ] Title = **The Follow-Ups That Keep Slipping**
- [ ] Scenario + 3 objectives + who cards = `01-frontend/COPY.md`
- [ ] Competencies + Must Watch = `01-frontend/VIDEO_MAPPING.md` (41970, 41978, 41975)
- [ ] Pass threshold = **7 / 10**
- [ ] Pack asset committed: `01-frontend/assets/marcus.jpg` (open on GitHub)
- [ ] App path for prod wiring: `/arena/exp4/characters/marcus.jpg`

## Backend
- [ ] Actor + analyzer prompts from `02-backend/prompts/` (`marcus_practice.actor.prompt.txt`, `marcus_practice.analyzer.prompt.txt`)
- [ ] Voice = `cedar` · Realtime = `gpt-realtime-2.1`
- [ ] Analyzer = **Opus (`claude-opus-5`), same as MC1 — do not change**, with the reasoning-effort guard in `WIRING.md`
- [ ] Checklist ids + pass threshold 7 from `scene-runtime.json` (`slipping_followups`, `handle_calls`, `repeat_callers`)
- [ ] Scene id = `scene-mc6-marcus-practice` · lock = `1.0.0-marcus-practice-v4-local`
- [ ] Live objective ticks follow `02-backend/OBJECTIVE_TRACKING.md` (3 ticks, settle-only)
- [ ] Turn recording keeps learner line before the character reply (see `WIRING.md`)

## Smoke
- [ ] Brief shows locked copy and the character image
- [ ] Live call opens; Marcus speaks first with the full situation; feedback uses existing staging shell
- [ ] Ideal answers score 30/30

## Known gaps
- The local scene JSON does not pin an analyzer model. "Opus (`claude-opus-5`), same as MC1" follows the MC03–MC05 pack convention and the Vercel demo config; confirm against production.
- The objective-judge criteria in `02-backend/OBJECTIVE_TRACKING.md` are copied from the live coverage judge in the Arena app; the judge's revision number is not recorded here.
- Lock version ends in `-local`: it is the locally locked build, not a released tag.
- Video 41978 is titled "…Feedback that Works" here (as in the practice scene config) and "…Feedback That Works" in the certificate pack (as in that scene config); same lesson id.
- The QA batch after 2026-11-25 has no recorded scores.
