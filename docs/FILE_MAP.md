# File map — handoff repo ↔ b2c-ui-main

Production app root: `b2c-ui-main/` (GitLab `MyJove/engineering/b2c-ui`)

## This repo layout

```
coach-roleplay/
├── production/          ← snapshot; paths mirror b2c-ui-main/src/...
├── reference/           ← prompts, scenes, copy, vercel config
├── demo-ui/             ← runnable mock (maps to pre-post UI only)
├── docs/
└── scripts/
```

## PRE/POST UI

| Handoff (`production/`) | Production |
|-------------------------|------------|
| `src/app/arena/exp7/pre-post/page.tsx` | same |
| `src/app/arena/exp7/pre-post/session/page.tsx` | same |
| `src/app/arena/exp7/pre-post/ArenaExp7PrePostClient.tsx` | same |
| `src/app/arena/exp7/pre-post/PrePostEntryCard.tsx` | same |
| `src/app/arena/exp7/pre-post/PrePostSessionClient.tsx` | same |
| `src/app/arena/exp7/pre-post/ObjectivesCoverage.tsx` | same |
| `src/app/arena/exp7/pre-post/constants.ts` | same |
| `src/app/arena/exp7/pre-post/prePost.module.css` | same |
| `src/app/arena/exp7/pre-post/CONTENT_FINAL.md` | same |

## Voice + practice

| Handoff | Production |
|---------|------------|
| `src/app/arena/exp7/Exp7PracticePanel.tsx` | same |
| `src/app/arena/exp7/Exp7RealtimeBridge.tsx` | same |
| `src/app/arena/exp7/exp7Realtime.ts` | same |
| `src/app/arena/exp7/Exp7Debrief.tsx` | same |
| `src/app/arena/exp7/Exp7PracticeLiveCard.tsx` | same |
| `src/app/arena/exp7/exp7Api.ts` | same |
| `src/app/arena/exp7/exp7Types.ts` | same |

## Lib (business logic)

| Handoff | Production |
|---------|------------|
| `src/lib/arena/exp7/coverageJudge.ts` | **Live objectives judge** |
| `src/lib/arena/exp7/analyzer.ts` | Post-session scoring |
| `src/lib/arena/exp7/content.ts` | Scene + prompt loading |
| `src/lib/arena/exp7/sessionStore.ts` | In-memory session state |
| `src/lib/arena/exp7/runPersistence.ts` | Dev `.exp7-runs/` artifacts |
| `src/lib/arena/exp7/beatProgress.ts` | Legacy beat signals (not used for live markers) |
| `src/lib/arena/exp7/closeEvaluator.ts` | Turn close / arc tracking |
| `src/lib/arena/exp7/debriefEvidence.ts` | Evidence sanitization |
| `src/lib/arena/loadOpenAiKey.ts` | Key from env or workspace env.txt |

## API routes

| Handoff | Production |
|---------|------------|
| `src/app/api/arena/exp7/sessions/route.ts` | Create session |
| `…/realtime-token/route.ts` | OpenAI client secret + actor prompt |
| `…/commit-turn/route.ts` | Persist utterances |
| `…/complete/route.ts` | Run analyzer → debrief |
| `…/coverage/route.ts` | Dev-only coverage.jsonl log |
| `…/debug/route.ts` | Dev session debug |
| `health/route.ts` | Realtime readiness |

## Prompts & scenes

| Handoff (`reference/`) | Production |
|------------------------|------------|
| `prompts/jordan_presentation_quality_miss.prompt.txt` | `arena/exp7/prompts/` |
| `prompts/jordan_presentation_quality_miss_analyzer.prompt.txt` | same |
| `prompts/sam_client_report_rejection.prompt.txt` | same |
| `prompts/sam_client_report_rejection_analyzer.prompt.txt` | same |
| `scenes/scene-jordan-pre.json` | `arena/exp7/config/` |
| `scenes/scene-mc1-sam-post.json` | same |

## demo-ui mock mapping

| demo-ui | Production equivalent |
|---------|----------------------|
| `src/pages/EntryPage.jsx` | `pre-post/page.tsx` + entry card |
| `src/pages/SessionPage.jsx` | `PrePostSessionClient.tsx` |
| `src/components/MockPracticePanel.jsx` | `Exp7PracticePanel.tsx` |
| `src/data/content.js` | `pre-post/constants.ts` |

## When porting changes

1. **Copy** → edit in `b2c-ui-main`, then re-sync this handoff repo
2. **Copy** → `constants.ts` / `CONTENT_FINAL.md` for learner text
3. **Layout** → `prePost.module.css`, `PrePostSessionClient.tsx`
4. **Voice/debrief** → `Exp7PracticePanel`, prompts, `analyzer.ts`
5. **Objectives** → `coverageJudge.ts`, `ObjectivesCoverage.tsx`, bridge wiring
6. **Deploy** → `reference/vercel.exp7-pre-post.json` (see DEPLOY.md)
