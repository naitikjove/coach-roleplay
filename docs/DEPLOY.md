# Deploy — Vercel demo (PRE/POST)

| Field | Value |
|-------|-------|
| Vercel project | `jove-exp7-pre-post` |
| Production URL | https://jove-exp7-pre-post.vercel.app |
| Entry | `/arena/exp7/pre-post` |
| Session | `/arena/exp7/pre-post/session` |

## Config file

`reference/vercel.exp7-pre-post.json`:

```json
{
  "buildCommand": "cp src/middleware.demo.ts src/middleware.ts && npm run build",
  "env": {
    "ARENA_LLM_MODEL": "gpt-5.6-terra",
    "ARENA_REALTIME_MODEL": "gpt-realtime-2.1"
  },
  "redirects": [{ "source": "/", "destination": "/arena/exp7/pre-post" }]
}
```

## Deploy from b2c-ui-main

```bash
cd b2c-ui-main
vercel deploy --prod --yes --local-config vercel.exp7-pre-post.json
```

Requires:

- Vercel project linked to `jove-exp7-pre-post`
- `OPENAI_API_KEY` in Vercel env (Production)

## Production limitations (current)

| Feature | Dev/local | Vercel prod |
|---------|-----------|-------------|
| Voice + debrief | ✅ | ✅ |
| Live objectives UI | ✅ | ✅ |
| `.exp7-runs/` debug | ✅ | ❌ |
| `/coverage` API log | ✅ | 404 |
| Session transcript persistence | local files only | not persisted |

## coach.jove.com integration

Production ship path is GitLab `b2c-ui` → normal CI/CD — **not** from this handoff repo.

See [`PRD.md`](PRD.md) for integration requirements.
