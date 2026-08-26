# Local development — full Exp7 experience

The **full** roleplay (mic + Claire + objectives + debrief) runs inside `b2c-ui-main`, not inside this handoff repo alone.

## Prerequisites

- Node 18+
- OpenAI API key with Realtime + chat access
- Clone or use existing `b2c-ui-main` from the JoVE sandbox

## Setup

```bash
cd b2c-ui-main

# Create local env (see coach-roleplay/.env.example)
cat > .env.local <<'EOF'
ARENA_LLM_MODEL=gpt-5.6-terra
ARENA_REALTIME_MODEL=gpt-realtime-2.1
EOF

# OPENAI_API_KEY — either export or add to workspace env.txt (loadOpenAiKey reads it)
export OPENAI_API_KEY=sk-...

npm install
npm run dev -- -p 3000
```

## URLs

| Page | URL |
|------|-----|
| Entry | http://localhost:3000/arena/exp7/pre-post |
| Session (voice) | http://localhost:3000/arena/exp7/pre-post/session |
| POST phase | http://localhost:3000/arena/exp7/pre-post/session?phase=post |

## Verify it's working

1. **Join Conversation** → mic permission → Claire speaks opener
2. Left column **Objectives** — checkmarks appear as topics resolve (not on opener)
3. **End scene** → analyzing spinner ~20–35s → debrief with 4 competencies
4. Terminal: `[exp7] analyzer debrief { model: 'gpt-5.6-terra', … }`

## Debug artifacts

Written under `b2c-ui-main/.exp7-runs/<sessionId>/` (dev only):

```
meta.json
session.json
turns.jsonl
coverage.jsonl      ← live objective verdicts
debrief.json
analyzer-input.txt
analyzer-raw.json
```

Replay coverage timing:

```bash
python3 coach-roleplay/scripts/replay-coverage-judge.py <sessionId>
```

## Syncing this handoff repo

After editing prod code, refresh the snapshot:

```bash
# From workspace root — re-run the sync script or copy paths listed in docs/FILE_MAP.md
```

## Mock UI only (no OpenAI)

```bash
cd coach-roleplay/demo-ui
npm install && npm run dev
# http://localhost:5177/arena/exp7/pre-post
```

Use for layout/copy review; does not exercise voice, judge, or analyzer.

## Common issues

| Symptom | Fix |
|---------|-----|
| `ERR_CONNECTION_REFUSED` | Dev server not running — `npm run dev` in b2c-ui-main |
| `OPENAI_API_KEY not configured` | Set key in env or `env.txt` |
| Debrief "could not run" | Check key + model name; see server logs |
| No coverage checkmarks | Dev only logs; judge runs on Realtime — check console `[exp7] coverage verdict` |
