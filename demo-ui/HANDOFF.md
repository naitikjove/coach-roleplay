# HANDOFF — Exp7 PRE v2 developer kit

## Purpose

Give another engineer a **zippable folder** that runs locally and explains how the live PRE v2 UI/shell works.

Live: https://jove-exp7-pre-post.vercel.app/arena/exp7/pre-post

## 5-minute path

1. `npm install && npm run dev`
2. Click **Enter 1:1 Conversation** → wait for veil → session brief
3. **Join Conversation** → mock live → **End scene** → mock debrief
4. Read `docs/ARCHITECTURE.md` then `docs/FILE_MAP.md`

## Key behavior to notice

- Entry lives **inside chapter chrome** (card above videos).
- Session uses a **two-column conversation shell**; debrief collapses to **one column**.
- Production voice is separate (`Exp7PracticePanel`); this kit only mocks phases.

## Out of scope

- Do not push this kit into GitLab `b2c-ui` / `b2c-service`.
- Do not treat mock debrief scores as product truth.
