# Exp7 PRE/POST — separate Vercel deploy

Existing dual-card exp7 stays on **https://jove-exp7-roleplay.vercel.app** (do not overwrite).

This PRE one-card flow is a **new** project:

| | |
|--|--|
| Project | `jove-exp7-pre-post` |
| Production | https://jove-exp7-pre-post.vercel.app |
| Entry | https://jove-exp7-pre-post.vercel.app/arena/exp7/pre-post |
| Session | https://jove-exp7-pre-post.vercel.app/arena/exp7/pre-post/session |

## Redeploy

From `b2c-ui-main` (linked to `jove-exp7-pre-post`):

```bash
vercel deploy --prod --yes --local-config vercel.exp7-pre-post.json
```

Config: `vercel.exp7-pre-post.json` (root `/` → `/arena/exp7/pre-post`).  
Demo middleware: `src/middleware.demo.ts` (copied over auth middleware at build time only on Vercel).

Required env (Production): `OPENAI_API_KEY`, optional `ARENA_LLM_MODEL=gpt-5.6-terra`.

Backup of the old project link: `.vercel/project.json.jove-exp7-roleplay.bak`.
