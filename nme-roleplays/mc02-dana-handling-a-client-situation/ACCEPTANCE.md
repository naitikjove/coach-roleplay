# Acceptance checklist — Dana practice

## Frontend
- [ ] Brief title = **Handling a client situation**
- [ ] Scenario paragraph matches `01-frontend/COPY.md` exactly
- [ ] All 4 objectives shown in order
- [ ] Who cards: You (Manager) + Dana (Direct report) with locked bodies
- [ ] Character image loads from Drive link in COPY
- [ ] Old “Coordinating a Late Report” / Late Again copy removed from this slot
- [ ] Results still show How it went / You said / Try instead / Your next step

## Backend
- [ ] Actor prompt = `02-backend/prompts/dana_brightway.actor.vB.prompt.txt` (full file)
- [ ] Analyzer prompt = `02-backend/prompts/dana_brightway.analyzer.vB.prompt.txt` (full file)
- [ ] Voice = `sage`
- [ ] Realtime model = `gpt-realtime-2.1`
- [ ] Checklist ids match `scene-runtime.json`
- [ ] Pass threshold 7; four competencies score 0–10

## Smoke
- [ ] Join conversation → Dana opens (short notice / on edge)
- [ ] End session → debrief returns with scores + try-instead quotes
