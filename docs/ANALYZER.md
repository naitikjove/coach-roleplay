# Post-session analyzer & debrief

After the learner ends the scene, the **analyzer** grades the conversation and renders the debrief UI.

## Flow

```
POST …/complete
  → load transcript + movesLedger + arc facts
  → build analyzer user message (FACTS block + TRANSCRIPT)
  → OpenAI chat completions (JSON mode)
  → parse + sanitize evidence
  → Exp7Debrief UI
```

**Model:** `ARENA_LLM_MODEL` (default `gpt-5.6-terra`)  
**Prompt:** `reference/prompts/jordan_presentation_quality_miss_analyzer.prompt.txt` (scene-specific)

## Output shape

| Field | UI use |
|-------|--------|
| `score` (1–10) | Headline badge |
| `headline` | try_again / solid / nailed_it |
| `percent`, `sumScore`, `maxScore` | Radar + summary |
| `competencies` × 4 | Building Trust, Setting Goals, Directing Work, Ensuring Accountability |
| `didWell`, `keyTakeaways` | Bullet lists |
| `transcriptImprovements` | Quote → suggested line |
| `strengths`, `improvements` | Evidence cards with learner quotes |

## Competencies (Jordan PRE)

Each competency has goal-level scoring (G1–G3) inside the analyzer JSON; UI shows aggregate score + level + note + learner quote.

Locked competency names match NME open catalog — see PRD.

## Retry logic

`analyzer.ts` calls with `reasoning_effort: medium`. If response is empty/unusable, retries once with `low` and higher token cap.

## Dev artifacts

On complete (non-production), writes to `b2c-ui-main/.exp7-runs/<sessionId>/`:

| File | Content |
|------|---------|
| `debrief.json` | Full debrief + raw analyzer response |
| `analyzer-input.txt` | Exact user message sent |
| `analyzer-raw.json` | Parsed competency breakdown |
| `turns.jsonl` | Per-turn commit log |
| `session.json` | Final transcript snapshot |

Console: `[exp7] analyzer debrief { model, transcriptEntries, … }`

## Benchmarking eval models

```bash
# Single session, multiple models
python3 scripts/time-eval-model.py <sessionId> gpt-5.6-terra o4-mini gpt-5.6-luna

# Multi-session bench (needs OPENROUTER for Claude)
python3 scripts/time-eval-models-multi.py
```

Prior bench (5 sessions): terra ~22s mean, o3 ~57s, haiku fast but downward drift on strong performances.

## UI component

`Exp7Debrief.tsx` — competency radar, evidence, retake CTA, lesson ref link.

During **analyzing** phase: `Exp7PracticeAnalyzingCard` spinner while `/complete` is in flight (~20–35s for terra).

## Environment

```bash
ARENA_LLM_MODEL=gpt-5.6-terra   # post-session analyzer
```

Faster alternatives tested: `o4-mini` + low effort (~14s, similar scores on test sessions).
