# Acceptance — variable items only

## Frontend
- [ ] Practice modal headline = **See how you'd think like a manager under pressure** (not MC1 "See how you'd handle your first 1:1"); eyebrow, subtitle, chips unchanged
- [ ] Title = **Planning Ethan's Next Month**
- [ ] Scenario + 3 objectives + who cards + entry card + image = `01-frontend/COPY.md`
- [ ] Locked scenario uses “shown interest”, “your only advice was…”, “any other guidance”, and ends with “Help him plan his next month.”
- [ ] whoThem uses “shown interest” (aligned with locked scenario)
- [ ] Competencies + Must Watch = `01-frontend/VIDEO_MAPPING.md`
- [ ] Character = Ethan (Direct report), not Rachel

## Backend
- [ ] Actor + analyzer prompts from `02-backend/prompts/` (vA 1.1 — no missing-piece quiz)
- [ ] Voice = `verse` · Realtime = `gpt-realtime-2.1`
- [ ] Analyzer model = Opus (`claude-opus-5`), same as MC1 — do not change
- [ ] Scene id = `scene-mc3-rachel-practice` (legacy rachel id; characterId = `ethan`)
- [ ] Checklist ids + pass threshold 7 from `scene-runtime.json`
- [ ] Lock = `1.0.0-ethan-practice-vA.1.1`
- [ ] Mid-call coverage + How it went = `02-backend/OBJECTIVE_TRACKING.md`

## Smoke
- [ ] Brief shows locked copy
- [ ] Live call opens; mid-call objective ticks settle/decision-based (3 objs)
- [ ] Feedback uses existing staging shell; summary + per-skill notes fill How it went
