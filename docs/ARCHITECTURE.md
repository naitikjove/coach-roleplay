# Architecture — Exp7 PRE/POST

## System overview

```
┌─────────────────────────────────────────────────────────────────┐
│  Coach chrome (SidebarLayout / ArenaExp7Shell)                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ ENTRY  /arena/exp7/pre-post                               │  │
│  │   MicroCourseChapterVideosClient + PrePostEntryCard       │  │
│  │   CTA → 2s veil → /session                                │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ SESSION  /arena/exp7/pre-post/session                     │  │
│  │   PrePostSessionClient                                    │  │
│  │     brief → live → analyzing → debrief                    │  │
│  │   Left: About + Objectives (live checkmarks)              │  │
│  │   Right: Who + Join / voice stage                         │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Runtime layers

| Layer | Components | Role |
|-------|------------|------|
| **Shell** | `ArenaExp7Shell`, breadcrumb | Coach sidebar + header |
| **Entry** | `ArenaExp7PrePostClient`, `PrePostEntryCard` | Chapter card slot, transition |
| **Session** | `PrePostSessionClient`, `ObjectivesCoverage` | Two-column grid, phase state |
| **Practice** | `Exp7PracticePanel`, `Exp7PracticeLiveCard` | Mic, turns, analyzing spinner |
| **Voice** | `Exp7RealtimeBridge`, `exp7Realtime.ts` | WebRTC to OpenAI Realtime |
| **Coverage** | `coverageJudge.ts` | Hidden judge on same Realtime session |
| **API** | `/api/arena/exp7/sessions/*` | Create, token, commit, complete, coverage |
| **Analyzer** | `analyzer.ts`, `Exp7Debrief` | Post-session JSON → UI debrief |

## Session shell grid (CSS)

1. **Brief** — `1.35fr | divider | 1fr` (About + Objectives | Who + Join)
2. **Live** — same grid; right = voice stage; “Live conversation” pill
3. **Analyzing / debrief** — single column (`reportFullShell`)

`PrePostSessionClient` watches `panelPhase` from `Exp7PracticePanel`. When `analyzing` or `debrief`, left briefing column collapses.

## Data flow (production)

```
Join
  → POST /api/arena/exp7/sessions { sceneId }
  → POST …/realtime-token → WebRTC (actor instructions)
  → learner speaks / Claire responds (Realtime)
  → after each Claire turn (skip opener):
       hidden response.create (conversation: "none") → coverage judge
       → monotonic merge → ObjectivesCoverage checkmarks
  → POST …/commit-turn on each utterance
  → End scene
  → POST …/complete → analyzer (gpt-5.6-terra) → Exp7Debrief
```

## Models

| Use | Env var | Default |
|-----|---------|---------|
| Live voice actor | `ARENA_REALTIME_MODEL` | `gpt-realtime-2.1` |
| Post-session analyzer | `ARENA_LLM_MODEL` | `gpt-5.6-terra` |
| Coverage judge | Same Realtime session | (no separate model) |

## demo-ui vs production

| | `demo-ui/` | `production/` + b2c-ui-main |
|--|------------|----------------------------|
| Layout / copy | ✅ | ✅ |
| OpenAI Realtime | ❌ mock timers | ✅ |
| Coverage judge | ❌ | ✅ |
| Analyzer debrief | ❌ mock scores | ✅ |

See [`REALTIME_AND_APIS.md`](REALTIME_AND_APIS.md) and [`OBJECTIVES_COVERAGE.md`](OBJECTIVES_COVERAGE.md).
