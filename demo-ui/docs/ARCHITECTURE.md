# Architecture — PRE v2 UI & shell

Live reference: https://jove-exp7-pre-post.vercel.app/arena/exp7/pre-post

## Mental model (two routes)

```
┌─────────────────────────────────────────────────────────────┐
│  Coach chrome (SidebarLayout / ArenaExp7Shell)              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ ENTRY  /arena/exp7/pre-post                           │  │
│  │   MicroCourseChapterVideosClient                      │  │
│  │     ├─ chapter header + video list                    │  │
│  │     └─ chapterCardSlot → PrePostEntryCard             │  │
│  │          CTA → 2s veil → navigate /session            │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ SESSION  /arena/exp7/pre-post/session                 │  │
│  │   Breadcrumb: Home > NME > MC1 title > Roleplay       │  │
│  │   PrePostSessionClient                                │  │
│  │     brief │ live │ analyzing │ debrief                │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Who owns what

| Layer | Production owner | This local package |
|-------|------------------|--------------------|
| App sidebar / header | `ArenaExp7Shell` → `SidebarLayout` | `src/shell/MockCoachShell.jsx` |
| Chapter page (entry) | `ArenaExp7PrePostClient` + videos client | `EntryPage` + fake video strip |
| Entry meta card | `PrePostEntryCard` | `src/components/EntryCard.jsx` |
| Session layout | `PrePostSessionClient` | `src/pages/SessionPage.jsx` |
| Voice + commit + analyze | `Exp7PracticePanel` + `/api/arena/exp7/*` | `MockPracticePanel` (phases only) |
| Copy / scene ids | `pre-post/constants.ts` | `src/data/content.js` |
| Actor / analyzer | `arena/exp7/prompts/*` | `reference/prompts/` |

## Session shell grid (important)

The white **conversation shell** is CSS grid, not the coach sidebar:

1. **Brief** — `1.35fr | divider | 1fr`  
   Left: About + Objectives · Right: Who + Join
2. **Live** — same grid; right becomes live stage; “Live conversation” pill above
3. **Analyzing / debrief** — `shellReport` → **one column** (briefing column removed)

Watch `panelPhase` from the practice panel: when it becomes `analyzing` or `debrief`, the session client sets `reportFullShell`.

## Data flow (production only)

```
Join → POST /sessions { sceneId: scene-mc1-jordan-pre }
     → POST …/realtime-token → WebRTC (Exp7RealtimeBridge)
     → commit-turn on each utterance
     → complete → analyzer → Exp7Debrief
```

Local mock skips APIs and advances phases on timers / **End scene**.

## Design tokens

- Font: Inter (`--main-font`)
- Primary: `#2183ed`
- Surfaces: `#fafafa` page, `#fff` cards, zinc neutrals
- Buttons: `.ds-btn` / `.ds-btn--primary` (stubbed in `global.css`)
