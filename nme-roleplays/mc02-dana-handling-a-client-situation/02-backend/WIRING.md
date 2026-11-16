# Backend wiring

## Models

| Piece | Value |
|---|---|
| Actor | `gpt-realtime-2.1` |
| Voice | `sage` |
| Analyzer | Same Chat Completions model as other NME roleplays (e.g. `gpt-5.6-terra`) |

## Realtime

```
POST https://api.openai.com/v1/realtime/client_secrets
session.model = gpt-realtime-2.1
session.instructions = <entire dana_brightway.actor.vB.prompt.txt>
session.audio.output.voice = sage
```

Keep existing NME VAD / PCM settings unless prod already differs.

## Analyzer

```
POST /v1/chat/completions
messages = [
  { role: "system", content: <entire dana_brightway.analyzer.vB.prompt.txt> },
  { role: "user", content: <transcript> }
]
response_format = { type: "json_object" }
```

Feedback payload must still expose: How it went / You said / Try instead / Your next step.  
**Try instead** = ideal quote to Dana (not habit essays).

## Runtime ids (`scene-runtime.json`)

- `id`: `scene-mc2-dana-brightway-practice`
- `characterId`: `dana`
- `lockVersion`: `2.0.0-dana-brightway-vB-final`
- Checklist: `la_weekend_catch_up`, `mc_missed_request`, `lc_new_dashboard`, `dq_dashboard_owner`
- Skills: `learning_agility`, `managing_complexity`, `leading_change`, `decision_quality`
- `passThreshold`: 7
- Turn limits: min 6 · softMax 14 · hardMax 18 · absoluteMax 22

## Must-watch lesson refs (if still used)

- 41955 → Learning Agility  
- 41952 → Managing Complexity  
- 41954 → Leading Change  
- 41953 / 42030 → Decision Quality  

Use prod’s existing lesson mapping for this practice slot if IDs already differ.
