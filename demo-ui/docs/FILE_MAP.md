# File map — local ↔ production

Root of production app: `b2c-ui-main/`

## Runnable UI (this package)

| Local | Production |
|-------|------------|
| `src/pages/EntryPage.jsx` | `src/app/arena/exp7/pre-post/page.tsx` + `ArenaExp7PrePostClient.tsx` |
| `src/components/EntryCard.jsx` | `src/app/arena/exp7/pre-post/PrePostEntryCard.tsx` |
| `src/pages/SessionPage.jsx` | `src/app/arena/exp7/pre-post/PrePostSessionClient.tsx` + `session/page.tsx` |
| `src/components/MockPracticePanel.jsx` | `src/app/arena/exp7/Exp7PracticePanel.tsx` (+ RealtimeBridge, Debrief) |
| `src/shell/MockCoachShell.jsx` | `src/app/arena/exp7/ArenaExp7Shell.tsx` → `SidebarLayout` |
| `src/data/content.js` | `src/app/arena/exp7/pre-post/constants.ts` |
| `src/styles/prePost.css` | `src/app/arena/exp7/pre-post/prePost.module.css` |
| `src/styles/global.css` | Design system + Inter (partial stub) |

## Reference artifacts (read-only copies)

| Local | Production |
|-------|------------|
| `reference/prompts/jordan_presentation_quality_miss.prompt.txt` | `arena/exp7/prompts/jordan_presentation_quality_miss.prompt.txt` |
| `reference/prompts/jordan_presentation_quality_miss_analyzer.prompt.txt` | `arena/exp7/prompts/jordan_presentation_quality_miss_analyzer.prompt.txt` |
| `reference/scenes/scene-jordan-pre.json` | `arena/exp7/config/scene-jordan-pre.json` |
| `reference/CONTENT_FINAL.md` | `src/app/arena/exp7/pre-post/CONTENT_FINAL.md` |
| `reference/vercel.exp7-pre-post.json` | `vercel.exp7-pre-post.json` |
| `docs/DEPLOY.md` | `arena/exp7/DEPLOY_PRE_POST.md` |

## APIs (production — not in this package)

| Endpoint | Role |
|----------|------|
| `GET /api/arena/exp7/health` | Realtime readiness |
| `POST /api/arena/exp7/sessions` | Create session (`sceneId`) |
| `POST …/realtime-token` | OpenAI client secret + actor instructions |
| `POST …/commit-turn` | Persist learner/character lines |
| `POST …/complete` | Run analyzer → debrief JSON |

Lib: `src/lib/arena/exp7/` (`content.ts`, `analyzer.ts`, `sessionStore.ts`, …)

## Scene identity

| Field | Value |
|-------|-------|
| `sceneId` | `scene-mc1-jordan-pre` |
| `scenarioKey` | `jordan-pre` |
| `characterId` | `jordan` |
| Voice (prod) | `coral` |

## When porting changes into prod

1. Edit copy in `constants.ts` (and sync `content.js` here if you keep the kit updated).
2. Layout/CSS → `prePost.module.css` / `PrePostSessionClient.tsx`.
3. Voice/debrief → `Exp7PracticePanel` / `Exp7Debrief` / analyzer prompt.
4. Redeploy Vercel with `vercel.exp7-pre-post.json` (see `docs/DEPLOY.md`).
