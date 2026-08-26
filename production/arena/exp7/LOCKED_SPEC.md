# Exp 7 — Locked Spec · Alex Demo Boundary Roleplay

**Status:** LOCKED  
**Lock date:** 2026-07-07  
**lockVersion:** 1.0.0

---

## 1. Purpose

Practice **setting boundaries with a former peer** after promotion — grounded in lesson `41949` (blurred roles, casual requests, routing norms). Not a quiz. Not trivia. Observable **spoken behavior** under social pressure.

---

## 2. Product rules (LOCKED)

| Rule | Decision |
|------|----------|
| Characters in voice | **Alex only** |
| Story / context on screen | **None** — Alex is the only storyteller |
| Coach before scene | **None** (no Aria intro for this exp) |
| Named executives | **None** (no Dana; say "stakeholder demo" / "product review") |
| Mid-call scoring UI | **None** |
| Evaluation timing | **Once, after call ends** |
| Open-ended chat | **No** — bounded turns in code |
| Cave early exit | **No** — min turns even if they agree |

---

## 3. Scenario (LOCKED)

### Story spine (Alex reveals in parts)

| Layer | Content |
|-------|---------|
| **Now** | Tomorrow ~10am: integration review. Alex owns API walkthrough + Q3 feature-ask slide. Not ready. |
| **Past** | At launch: learner (then peer) stayed late, tightened Alex's demo flow; Alex presented. Unspoken habit. |
| **Ask** | Polish slides + feature narrative tonight — "like launch." Alex still presents; learner must not redo the work. |

### Why demo polish (not "take the call")

- Clearly **Alex's deliverable**
- Past callback is **specific and believable**
- Trap: *"I'm not asking you to present"* — still IC work for the manager
- Tied to lesson: blurred roles + casual peer favor

---

## 4. Learner UI (LOCKED)

**Show:** Alex identity, waveform, live captions (dialogue only), End scene  
**Hide:** context card, your task, lesson title, stakes text, mid-call checklist  

**Optional:** learner says *"catch me up"* or taps equivalent → Alex recaps in character (not a UI paragraph).

**After call:** headline + `coach_summary` (hero) + 6-item checklist (secondary) + Retake + lesson link if `try_again`

---

## 5. Alex story beats (LOCKED order)

| Alex beat | Delivers |
|-----------|----------|
| **1 — Open** | Concrete hook: tomorrow ~10, integration review, API section + Q3 feature slide, not ready, embarrassed. Ends: *"Want me to catch you up on the deck and what happened at launch—or you good?"* |
| **2 — Recap or stakes** | If asked: launch + deck contents (2–3 sentences). Else: why tomorrow hurts. |
| **3 — Past + ask** | Launch habit + polish slides / feature story tonight. |
| **4–6 — Refusal arc or cave** | See §6 |
| **Close** | Natural goodbye in character |

Opening **must** name the work — not only "demo tomorrow" + mood.

---

## 6. Refusal arc — 3 varied pushes (LOCKED)

When learner refuses to redo slides / prep for Alex:

| Push | Type | Angle |
|------|------|--------|
| **A** | Stakes | Tomorrow fixed; he'll look unprepared in review |
| **B** | History | Launch; habit; "we never reset after you became manager" |
| **C** | Minimize | Not presenting—just tighten slides + feature wording; "couple hours" |

**Rules:**
- Order: A → B → C. **Never same type twice.** Never same sentence twice.
- **Max 3 pushes.** No fourth push.
- After C + firm kind no → **soften**: *"What would actually help me not bomb tomorrow?"*
- If harsh (not firm) → one hurt beat, skip full A/B/C, move to close.

### If learner caves (LOCKED)

- Thank warmly.
- **One** follow-up ask (e.g. feature-ask bullet, slide four).
- Close in 1–2 more exchanges.
- Still honor **min learner turns** (§7).

---

## 7. Turn limits (LOCKED — code, not prompt)

| Setting | Value |
|---------|--------|
| `minLearnerTurns` | **4** |
| `softMaxLearnerTurns` | **7** |
| `hardMaxLearnerTurns` | **8** (absolute max **10** only if hints/STT retries) |

| Turns | Behavior |
|-------|----------|
| &lt; 4 | Block auto-close (except manual End scene) |
| 4–7 | Close when exchange resolved |
| ≥ 8 | Force Alex goodbye + end |

Count **learner turns** only. Do not show count to learner.

---

## 8. Evaluation (LOCKED)

### When

- **During call:** silent (optional light tagging for close logic only — not shown).
- **After call:** Prompt 2 on **full transcript** — authoritative grade.

### Checklist (6 items)

1. Acknowledged Alex without agreeing to repeat the old habit  
2. Made clear the demo and feature slide are **Alex's** to own  
3. Did **not** agree to redo slides or feature narrative for him  
4. Stayed calm when Alex pushed back about launch  
5. Said how Alex should ask and send work next time  
6. Offered help that doesn't do the work (review, dry run, structure)

### Headline

| Value | Rule |
|-------|------|
| `try_again` | #2 or #3 failed |
| `nailed_it` | all six passed |
| `solid` | otherwise |

### Coach summary (hero output)

One **120–180 word** flowing paragraph. **No section headers** ("What you did well:", etc.). Must naturally cover:

- How the conversation went  
- What they did right (quote when possible)  
- What was missing or wrong  
- One usable line to try on retake  

See `prompts/analyzer.prompt.txt`.

---

## 9. If learner doesn't answer well (LOCKED)

| Case | Alex | End |
|------|------|-----|
| Vague | One clarifying push | Close by turn cap |
| Wrong (cave) | Thanks + follow-up task | ≥ min turns, then close |
| Silent / STT fail | *"You still there?"* once | Close after 2–3 empty |
| Off-topic | Redirect to demo ask once | Close by cap |
| Harsh | One hurt beat | Close |

Never keep talking until checklist passes. **Retake = new conversation.**

---

## 10. What Alex never does (LOCKED)

- Coach or name the "correct" answer  
- Mention rubric, lesson, training, AI  
- Name Dana or specific execs  
- Repeat the same guilt line twice  
- Fourth push after A/B/C  
- Quiz lesson facts  

---

## 11. Implementation checklist

- [ ] Replace `scene-2-boundary` in `mission-mc1/scene-graph.json` per `config/scene.json`
- [ ] Wire `prompts/alex.prompt.txt` → Realtime instructions + `build_realtime_instructions`
- [ ] Wire `prompts/analyzer.prompt.txt` → post-scene complete endpoint
- [ ] Remove learner-facing context card / Aria intro for this scene
- [ ] Add `minLearnerTurns` to `scene_close.py`
- [ ] UI: show `coach_summary` as hero; checklist secondary
- [ ] Golden paths: strong refusal (4 turns), cave (4 turns), recap request

---

## 12. Open items (NOT locked — future)

- Exact voice ID for Alex in Realtime  
- Whether post-call lesson video auto-expands on `try_again`  
- Integration into Coach.jove.com route (local pilot first)
