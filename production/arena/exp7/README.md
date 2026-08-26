# Arena Exp 7 — Alex Boundary Voice Roleplay

**Status:** LOCKED + **wired locally** (see [FLOW_STATUS.md](./FLOW_STATUS.md))  
**Owner:** Naitik  
**Lesson:** MC1 · `41949` — How to Set Boundaries With Former Peers  
**Implementation:** `arena/roleplay/services/arena-api` (`/exp7/*`) + `b2c-ui-main/src/app/arena/exp7/`

---

## What this experiment is

One **voice-only** scene. **Alex only** — no coach narrator, no on-screen context card, no named executives (no Dana).

The learner is a new manager. Alex (former peer) asks them to **polish tomorrow's integration review slides and Q3 feature-ask narrative** — reliving a **launch habit** where the learner fixed his deck. The learner must hold a boundary under **three varied pushes**, then receive a **coach-style debrief** after the call.

---

## Locked documents

| File | Purpose |
|------|---------|
| [LOCKED_SPEC.md](./LOCKED_SPEC.md) | Full product + conversation + turn + UI + eval rules |
| [UI_PLAN.md](./UI_PLAN.md) | **Production shell plan** — sidebar, routes, Exp4 parity, no thumbnails |
| [prompts/alex.prompt.txt](./prompts/alex.prompt.txt) | **Prompt 1** — Realtime / actor (whole conversation) |
| [prompts/analyzer.prompt.txt](./prompts/analyzer.prompt.txt) | **Prompt 2** — Post-call debrief (once, full transcript) |
| [prompts/close_evaluator.prompt.txt](./prompts/close_evaluator.prompt.txt) | **Close evaluator** — holistic auto-end (full transcript, not learner-facing) |
| [config/scene.json](./config/scene.json) | Scene metadata + turn limits (code, not prompt) |

Turn limits live in `config/scene.json` and backend code. Learner-facing LLM surfaces: **Alex + debrief analyzer**.

---

## Prompt map

```
┌─────────────────────────────────────────────────────────┐
│  PROMPT 1 — Alex (Realtime)                             │
│  Runs: entire conversation                              │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼  after each exchange (commit-turn)
┌─────────────────────────────────────────────────────────┐
│  Close evaluator — full transcript, “natural end?”      │
│  Code enforces min 4 / max 8 learner turns              │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼  scene ends (auto or End scene CTA)
┌─────────────────────────────────────────────────────────┐
│  PROMPT 2 — Analyzer (backend)                          │
│  Runs: once — headline + checklist + coach_summary      │
└─────────────────────────────────────────────────────────┘
```

---

## Local run

**Production UI + practice panel**

```bash
cd b2c-ui-main && npm run dev
# http://localhost:3000/arena/exp7
```

**Voice + debrief API** (built into Next.js — no separate server)

```bash
cd b2c-ui-main && npm run dev
# API: http://localhost:3000/api/arena/exp7/health
```

OpenAI key loads from workspace `env.txt`. Microphone required for live Alex.

---

## Relation to other Arena formats

| Format | Exp / location | Depth |
|--------|----------------|-------|
| Triage games | `arena/triage-games/` | Fast tap, breadth |
| Story + chat | `arena/experiment/` | Narrative + MC judgment |
| **Exp 7 roleplay** | `arena/exp7/` → `arena/roleplay/` | Voice performance |
| Exp 4 UI shell | `b2c-ui-main/.../exp4/` | Separate judgment UI experiment |

---

## Change control

Edits to locked behavior require updating `LOCKED_SPEC.md` and bumping the `lockVersion` in `config/scene.json`. Prompt changes must stay in sync with the spec.
