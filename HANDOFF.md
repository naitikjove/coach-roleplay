# HANDOFF — Exp7 PRE/POST roleplay (complete)

**Repo:** https://github.com/naitikjove/coach-roleplay  
**Live demo:** https://jove-exp7-pre-post.vercel.app/arena/exp7/pre-post  
**Snapshot date:** August 2026

## 10-minute path for a new engineer

1. Read this file, then [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
2. Skim [`docs/FILE_MAP.md`](docs/FILE_MAP.md) — where every file lives in `b2c-ui-main`
3. Run **mock UI**: `cd demo-ui && npm install && npm run dev` → click through brief → mock live → debrief
4. Run **full voice** (needs OpenAI key): follow [`docs/LOCAL_DEV.md`](docs/LOCAL_DEV.md)
5. Read [`docs/OBJECTIVES_COVERAGE.md`](docs/OBJECTIVES_COVERAGE.md) — live checkmarks during conversation
6. Read [`docs/REALTIME_AND_APIS.md`](docs/REALTIME_AND_APIS.md) — session lifecycle
7. Read [`docs/ANALYZER.md`](docs/ANALYZER.md) — post-session scoring

## What changed vs the old v2 kit

The previous handoff (`arena-local/exp7-pre-post-v2`) only included:

- Mock UI shell (no voice)
- Basic architecture + file map
- Reference prompts (partial)

**This repo adds:**

| Missing item | Where documented | Where implemented |
|--------------|------------------|-------------------|
| Live objectives tracking | `docs/OBJECTIVES_COVERAGE.md` | `production/src/lib/arena/exp7/coverageJudge.ts` |
| Realtime voice bridge | `docs/REALTIME_AND_APIS.md` | `Exp7RealtimeBridge.tsx`, `exp7Realtime.ts` |
| Session APIs | `docs/REALTIME_AND_APIS.md` | `production/src/app/api/arena/exp7/` |
| Analyzer / debrief | `docs/ANALYZER.md` | `analyzer.ts`, `Exp7Debrief.tsx` |
| Objectives UI + popover | `docs/OBJECTIVES_COVERAGE.md` | `ObjectivesCoverage.tsx` |
| Dev debug artifacts | `docs/LOCAL_DEV.md` | `.exp7-runs/`, coverage route |
| Latest actor + analyzer prompts | `reference/prompts/` | synced from prod |
| Eval benchmark scripts | `scripts/` | timing + coverage replay |

## Product scope

| In scope | Out of scope |
|----------|--------------|
| PRE Jordan 1:1 + POST Sam 1:1 | Replacing dual Practice Simulation cards |
| Voice roleplay + debrief | New Realtime infrastructure |
| Live objective markers (came up ≠ scored) | PRE→POST score persistence (v2) |
| Chapter entry inside MC1 shell | Pushing from this repo to GitLab prod |

## Scene IDs

```
scene-mc1-jordan-pre   →  Claire  →  Presentation Quality Miss (PRE)
scene-mc1-sam-post     →  Sam     →  Client Report Rejection (POST)
```

## Copy source of truth

1. Google Doc (canonical — see PRD)
2. `reference/CONTENT_FINAL.md` + `production/.../pre-post/constants.ts`

## Questions?

- Product: [`docs/PRD.md`](docs/PRD.md)
- Exec summary: [`docs/EXEC_BRIEF.md`](docs/EXEC_BRIEF.md)
- Deploy: [`docs/DEPLOY.md`](docs/DEPLOY.md)
