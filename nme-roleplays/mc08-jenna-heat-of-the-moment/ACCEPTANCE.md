# Acceptance — variable items only

## Frontend
- [ ] Title = **Heat of the Moment**
- [ ] Scenario + about lines + 2 objectives + who cards + entry card + image = `01-frontend/COPY.md`
- [ ] Competencies + Must Watch = `01-frontend/VIDEO_MAPPING.md` (Managing Emotions = **41989**, Demonstrating Awareness = **41995**)
- [ ] Pass threshold = **7 / 10**
- [ ] Pack asset committed: `01-frontend/assets/jenna.jpg`
- [ ] App path for wiring: `/arena/exp7/mc8/jenna.jpg`
- [ ] Character = Jenna (Senior analyst)

## Backend
- [ ] Actor + analyzer prompts from `02-backend/prompts/` (`jenna_heated_week.*.vA`)
- [ ] Voice = `sage` · Realtime = `gpt-realtime-2.1`
- [ ] Analyzer model = Opus (`claude-opus-5`), same as MC1 — do not change
- [ ] Scene id = `scene-mc8-jenna-cert` · characterId = `jenna` · lessonRef = `mc8-cert`
- [ ] Checklist ids: `team_email`, `kayla_request`
- [ ] Pass threshold 7 · lock `1.0.0-jenna-heated-week-vA-local`
- [ ] Mid-call coverage + How it went = `02-backend/OBJECTIVE_TRACKING.md`

## Smoke
- [ ] Brief shows locked copy and the portrait
- [ ] Live call opens; Jenna speaks first (greeting), then the whole situation in the second message
- [ ] Ideal answers score about 20/20; shortcuts score 0
- [ ] Feedback uses the existing staging shell; summary + per-skill notes fill How it went

## Known gaps (honest)
- [ ] No live Realtime voice call has been tested for this roleplay; all QA is a text simulation using the same prompts (actor `openai/gpt-4.1` in the harness, simulated learner and analyzer on Sonnet). Production uses `gpt-realtime-2.1` and the Opus analyzer, so scores can differ.
- [ ] The character portrait is AI generated.
- [ ] A production build currently needs `ARENA_DEMO_BUILD=1` because of a pre-existing type error in `src/app/api/arena/exp7/last-debrief/route.ts` (line ~312). It is not part of MC8.
- [ ] Beat A tests the employee half of video 41989 plus taking responsibility. The client half (explain, revised plan, status updates) is not in this story.
- [ ] The learner's own composure is inferred, not shown in a line.
- [ ] Beat B: short-term goals for two weeks are not asked in the call (stretch idea only). A midweek check-in counts only as a bonus.
- [ ] Playbooks gold_ideal, mixed_weak and folds_after_push were run before the final actor/analyzer fixes (nearly_there, all_shortcuts and chaos_edge were run on the final prompts)
