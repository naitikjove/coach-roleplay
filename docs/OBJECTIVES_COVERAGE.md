# Live objectives coverage

During a live roleplay, the **Objectives** list on the left shows checkmarks when each topic has been **genuinely resolved** in conversation. This is **not** the post-session score — it only tracks whether the topic came up and landed.

## UX

- Fixed heading: **"Objectives"** (no dynamic "N of 4" title)
- Checkmark replaces the number when covered
- **(i)** popover during live: *"Items light up when that topic comes up… How well you handled each one is scored after you finish."*
- Covered state is **monotonic** — once true, never flips back

Component: `production/src/app/arena/exp7/pre-post/ObjectivesCoverage.tsx`

## How it works (Option A — out-of-band judge)

After each **Claire/Sam turn completes** (skip the opening greeting), the client fires a hidden Realtime request on the **same WebRTC session**:

```
response.create
  conversation: "none"
  instructions: coverageJudgeInstructions(sceneId)
  metadata.topic: "exp7_coverage"
```

The judge reads the conversation context the model already holds, returns JSON only:

```json
{"1": true, "2": false, "3": true, "4": false}
```

Judge events are intercepted by response id in `exp7Realtime.ts` so they never speak aloud or append to the learner transcript.

## Resolution criteria (Jordan PRE)

Defined in `coverageJudge.ts`:

1. Rejected presentation explained; manager engaged with substance
2. Concrete path/timing for the deck this week expressed and acknowledged
3. Who does the rewrite — settled after any help back-and-forth (asking alone ≠ covered)
4. Who represents the work in the leadership conversation — **decided**, not merely offered

Sam POST has parallel criteria for the client report scenario.

## Code path

```
Exp7RealtimeBridge (onResponseDone, characterResponseCount >= 2)
  → session.requestJudgeResponse(instructions)
  → onJudgeResponseDone(text)
  → parseCoverageVerdict(text)
  → Exp7PracticePanel.handleCoverageVerdict
  → mergeTopicCoverage (monotonic)
  → onTopicCoverageChange → PrePostSessionClient → ObjectivesCoverage
```

Judge stops when all 4 objectives are covered (`activeJudgeInstructions` becomes null).

## Dev debugging

Each verdict is POSTed to `/api/arena/exp7/sessions/:id/coverage` (404 in production).

Logs append to `b2c-ui-main/.exp7-runs/<sessionId>/coverage.jsonl`:

```json
{"ts":"…","verdict":[true,true,false,false],"merged":[true,true,false,false],"newlyCovered":[2],…}
```

Replay offline: `scripts/replay-coverage-judge.py <sessionId>`

## What we replaced

Previously, live markers used regex/beat signals (`topicCoverageFromBeatProgress` in `beatProgress.ts`). That path is **not** wired to the UI anymore — the LLM judge drives markers.

## Porting checklist

- [ ] `coverageJudge.ts` — criteria match product copy for each scene
- [ ] `Exp7RealtimeBridge` — fire after character turn, skip opener
- [ ] `exp7Realtime.ts` — intercept judge response ids
- [ ] `ObjectivesCoverage.tsx` — learner-facing list + popover
- [ ] `PrePostSessionClient` — pass `covered` flags when live
