# Acceptance — variable items only

## Frontend
- [ ] Title = **When Mistakes Get Emotional**
- [ ] Scenario + about lines + 2 objectives + who cards + entry card + image = `01-frontend/COPY.md`
- [ ] Competencies + Must Watch = `01-frontend/VIDEO_MAPPING.md` (Managing Emotions = **41989**, Demonstrating Awareness = **41995**)
- [ ] Pass threshold = **7 / 10**
- [ ] Pack asset committed: `01-frontend/assets/theo.jpg`
- [ ] App path for wiring: `/arena/exp7/mc8/theo.jpg`
- [ ] Character = Theo (Team member)

## Backend
- [ ] Actor + analyzer prompts from `02-backend/prompts/` (`theo_late_report.*.vA`)
- [ ] Voice = `ash` · Realtime = `gpt-realtime-2.1`
- [ ] Analyzer model = Opus (`claude-opus-5`), same as MC1 — do not change
- [ ] Scene id = `scene-mc8-theo-practice` · characterId = `theo` · lessonRef = `mc8-practice`
- [ ] Checklist ids: `client_reply`, `devon_talk`
- [ ] Pass threshold 7 · lock `1.1.0-theo-late-report-vA-local`
- [ ] Mid-call coverage + How it went = `02-backend/OBJECTIVE_TRACKING.md`

## Smoke
- [ ] Brief shows locked copy and the portrait
- [ ] Live call opens; Theo speaks first (greeting), then the whole situation in the second message
- [ ] Ideal answers score about 20/20; shortcuts score 0
- [ ] Feedback uses the existing staging shell; summary + per-skill notes fill How it went

## Known gaps (honest)
- [ ] No live Realtime voice call has been tested for this roleplay; all QA is a text simulation using the same prompts (actor `openai/gpt-4.1` in the harness, simulated learner and analyzer on Sonnet). Production uses `gpt-realtime-2.1` and the Opus analyzer, so scores can differ.
- [ ] The character portrait is AI generated.
- [ ] A production build currently needs `ARENA_DEMO_BUILD=1` because of a pre-existing type error in `src/app/api/arena/exp7/last-debrief/route.ts` (line ~312). It is not part of MC8.
- [ ] Beat A follows the client half of video 41989; the employee-reaction half (listen, acknowledge, reset priorities) is touched only lightly.
- [ ] The learner's own deep breath / composure is implied, never demonstrated in a line.
- [ ] Beat B: short-term goals and midweek check-ins are not asked in the call (used as the 10/10 stretch idea).
- [ ] Theo's opening entry is ~114 words against the 110-word limit (cosmetic)
- [ ] Theo's concession sometimes repeats "what I've noticed" when the learner only said "ask what's going on" (seen in the garble and give-in runs)
- [ ] Playbooks other than gold_ideal, nearly_there, folds_after_push and chaos_edge were last run before the final prompt changes
