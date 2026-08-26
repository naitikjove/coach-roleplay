# Changelog — handoff repo vs exp7-pre-post-v2 kit

## 2026-08-26 — coach-roleplay (this repo)

Initial complete handoff to https://github.com/naitikjove/coach-roleplay

### Added

- Full `production/` snapshot of Exp7 source (UI, lib, API, prompts)
- `docs/OBJECTIVES_COVERAGE.md` — live LLM judge during conversation
- `docs/REALTIME_AND_APIS.md` — WebRTC + session API lifecycle
- `docs/ANALYZER.md` — post-session debrief + model benchmarks
- `docs/LOCAL_DEV.md` — run full experience on localhost:3000
- `docs/PRD.md`, `docs/EXEC_BRIEF.md` — product context
- Latest prompts (Jordan + Sam actor + analyzer)
- Scene configs, `vercel.exp7-pre-post.json`, `.env.example`
- Eval scripts: `time-eval-model.py`, `time-eval-models-multi.py`, `replay-coverage-judge.py`

### Updated from v2 kit

- Architecture doc includes coverage judge + analyzer paths
- File map covers all new files (ObjectivesCoverage, coverage route, etc.)
- README clarifies full vs mock run paths

### Known gaps (future)

- POST Sam flow documented but less QA than PRE Jordan
- PRE→POST score persistence not implemented
- Production session/transcript persistence on Vercel
- `ARENA_LLM_REASONING_EFFORT` env not yet wired (hardcoded medium/low retry)

## Prior — exp7-pre-post-v2 (arena-local)

- Mock UI shell only
- ARCHITECTURE + FILE_MAP + DEPLOY
- Partial reference prompts
- No objectives judge docs
- No production code snapshot
