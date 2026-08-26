# JoVE Coach — Exp7 PRE/POST Roleplay Handoff

Complete engineering handoff for the **Exp7 roleplay experience** (Jordan PRE + Sam POST) as it runs locally and on Vercel demo.

| Environment | URL |
|-------------|-----|
| **Local (full voice + debrief)** | http://localhost:3000/arena/exp7/pre-post/session |
| **Vercel demo** | https://jove-exp7-pre-post.vercel.app/arena/exp7/pre-post |
| **Mock UI kit (no OpenAI)** | http://localhost:5177/arena/exp7/pre-post (see `demo-ui/`) |

## What's in this repo

| Path | Purpose |
|------|---------|
| [`HANDOFF.md`](HANDOFF.md) | Start here — 10-minute engineer onboarding |
| [`docs/`](docs/) | Architecture, APIs, objectives judge, analyzer, deploy, PRD |
| [`production/`](production/) | **Snapshot** of Exp7 source from `b2c-ui-main` (Aug 2026) |
| [`reference/`](reference/) | Prompts, scene JSON, copy mirror, Vercel config |
| [`demo-ui/`](demo-ui/) | Runnable Vite mock of shell/layout (phases only) |
| [`scripts/`](scripts/) | Coverage replay, eval timing benchmarks |

This replaces the earlier `arena-local/exp7-pre-post-v2` kit with **everything** that was missing: live objectives tracking, Realtime voice path, analyzer/debrief, API routes, and up-to-date prompts.

## Two ways to run

### A) Full experience (recommended for QA)

Requires OpenAI key. Runs inside a full Next.js app (`b2c-ui-main` in the JoVE sandbox).

```bash
# In your b2c-ui-main clone:
cp .env.example .env.local   # add OPENAI_API_KEY
npm install && npm run dev -- -p 3000
```

Open http://localhost:3000/arena/exp7/pre-post/session

See [`docs/LOCAL_DEV.md`](docs/LOCAL_DEV.md) for details, env vars, and debug artifacts (`.exp7-runs/`).

### B) UI shell only (no mic / no LLM)

Self-contained mock for layout and copy review:

```bash
cd demo-ui && npm install && npm run dev
```

Open http://localhost:5177/arena/exp7/pre-post

## Scenes

| Phase | `sceneId` | Character | Scenario |
|-------|-----------|-----------|----------|
| PRE | `scene-mc1-jordan-pre` | Claire (Jordan) | Presentation Quality Miss |
| POST | `scene-mc1-sam-post` | Sam | Client Report Rejection |

## Key features (current)

- **Voice 1:1** — OpenAI Realtime (`gpt-realtime-2.1`) via WebRTC
- **Live objectives** — hidden LLM judge marks 4 objectives during conversation (checkmarks ≠ score)
- **Post-session debrief** — analyzer (`gpt-5.6-terra`) scores 4 competencies
- **Chapter shell** — entry card inside NME MC1 chrome; session uses two-column brief → live → debrief

## Production integration target

Integrate into **coach.jove.com** (`b2c-ui-main` / GitLab `MyJove/engineering/b2c-ui`) as a **sibling** route — do not replace the existing dual Practice Simulation cards.

See [`docs/PRD.md`](docs/PRD.md) and [`docs/FILE_MAP.md`](docs/FILE_MAP.md).

## Policy

This repo is a **handoff mirror**, not the production deploy source. Sync changes from `b2c-ui-main` when updating; prod ships via GitLab + Vercel pipelines.
