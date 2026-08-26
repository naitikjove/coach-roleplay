# Exp 7 — Flow implementation status

**Locked spec:** [LOCKED_SPEC.md](./LOCKED_SPEC.md) · `lockVersion` 1.0.0  
**Last checked:** 2026-07-07

---

## End-to-end flow

```
Skill picker (/arena/exp7)
  → NME chapter shell (/arena/exp7/new-manager-essentials/…)
    → Practice panel (idle)
      → Start
      → Start → Next.js API session + OpenAI Realtime (Alex)
      → Live (Alex captions + waveform + End scene)
      → Analyzing
      → Debrief (headline + coach_summary + 6 checklist + Retake [+ lesson link if try_again])
```

---

## LOCKED_SPEC checklist

| Requirement | Status | Notes |
|-------------|--------|-------|
| Alex only in voice | ✅ | `alex.prompt.txt` via `/api/arena/exp7/sessions/{id}/realtime-token` |
| No on-screen story / context card | ✅ | Idle card: title + “Alex wants to talk.” only |
| No Aria intro | ✅ | No anchor in Exp7 UI |
| No named executives | ✅ | Spec + prompts |
| No mid-call scoring UI | ✅ | `commit-turn` tracks turns only |
| Post-call analyzer once | ✅ | `/api/arena/exp7/sessions/{id}/complete` + `analyzer.prompt.txt` |
| Bounded turns in code | ✅ | `sceneClose.ts` + `scene.json` turnLimits |
| Min 4 learner turns (no early Alex cave) | ✅ | `evaluate()` blocks actor close before min |
| 3 refusal pushes A/B/C | ✅ | In `alex.prompt.txt` |
| Learner UI: Alex, waveform, captions, End scene | ✅ | `Exp7PracticeLiveCard` + `Exp4CharacterCard` |
| Debrief: headline + coach_summary + 6 checklist | ✅ | `Exp7Debrief` |
| Retake | ✅ | Resets panel to idle |
| Lesson link on `try_again` | ✅ | Links to lesson 41949 microcourse URL |
| Production shell (Practice Simulation sidebar) | ✅ | `ArenaExp7Client` + `Exp7ExperimentTopHeader` |
| Work skills picker (NME row) | ✅ | `Exp7WorkSkillsCard` |

---

## Components

| Layer | Location |
|-------|----------|
| Locked spec + prompts | `arena/exp7/` |
| Production UI | `b2c-ui-main/src/app/arena/exp7/` |
| Backend API | `b2c-ui-main/src/app/api/arena/exp7/` (Next.js, prod-ready) |
| Legacy Python API | `arena/roleplay/services/arena-api/app/exp7_*.py` (optional) |
| API proxy | Not required — uses `/api/arena/exp7/*` in-process |

---

## API routes

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/arena/exp7/health` | `realtime_ready` / `llm_ready` |
| POST | `/api/arena/exp7/sessions` | Create session |
| POST | `/api/arena/exp7/sessions/{id}/realtime-token` | Mint Realtime client secret + Alex instructions |
| POST | `/api/arena/exp7/sessions/{id}/commit-turn` | Append transcript; return `shouldClose` |
| POST | `/api/arena/exp7/sessions/{id}/complete` | Run analyzer; return debrief JSON |

---

## Local dev

**One server — UI + voice API**

```bash
cd b2c-ui-main && npm run dev
```

OpenAI key is read from workspace `env.txt` (same as Exp4 TTS). No separate Python server required.

| URL | Purpose |
|-----|---------|
| http://localhost:3000/arena/exp7 | Skill picker |
| http://localhost:3000/arena/exp7/new-manager-essentials/transitioning-from-individual-contributor-to-manager | Practice chapter |
| http://localhost:3000/api/arena/exp7/health | API health (`realtime_ready`) |

---

## Not in scope / optional

| Item | Status |
|------|--------|
| Update legacy `mission-mc1/scene-graph.json` scene-2 | Skipped — dedicated `/exp7` API used instead |
| `EXP7_USE_LIVE_API` microcourse CDN payload | Optional; fallback data works offline |
| Prod deploy / GitLab | Out of scope for local sandbox |

---

## Change control

Behavior changes require [LOCKED_SPEC.md](./LOCKED_SPEC.md) update + `lockVersion` bump in `config/scene.json`.
