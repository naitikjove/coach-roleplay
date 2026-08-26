# Exp7 PRE v2 — UI mock (part of coach-roleplay)

Runnable **layout-only** mock. For the full voice + objectives + debrief experience, see the repo root [`README.md`](../README.md) and [`docs/LOCAL_DEV.md`](../docs/LOCAL_DEV.md).

Live reference: https://jove-exp7-pre-post.vercel.app/arena/exp7/pre-post

## Run

```bash
npm install
npm run dev
```

→ http://localhost:5177/arena/exp7/pre-post

| Route | What you see |
|-------|----------------|
| `/arena/exp7/pre-post` | Chapter shell + entry card |
| `/arena/exp7/pre-post/session` | Brief → mock live → debrief |

## Docs (repo root)

- [`../HANDOFF.md`](../HANDOFF.md)
- [`../docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md)
- [`../docs/FILE_MAP.md`](../docs/FILE_MAP.md)

## What this mock includes / excludes

| Included | Not included |
|----------|--------------|
| Entry + session layouts, real copy | OpenAI Realtime / mic |
| Mock coach shell | Live objectives judge |
| Phase transitions (timers) | Real analyzer debrief |

Production code snapshot: [`../production/`](../production/)
