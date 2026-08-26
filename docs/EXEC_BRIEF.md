# JoVE Arena — Voice Roleplay (PRE / POST)
**Executive brief for leadership · 2 pages**  
**Product:** New Manager Essentials · *Transitioning from Individual Contributor to Manager*  
**Date:** 19 August 2026 · **Status:** Working prototype on Coach-shaped UI (not yet the production GitLab ship)

---

## 1. Why this exists

New Manager Essentials teaches IC→manager skills through video. Learners also need to **practice a real 1:1 out loud** and see how they did.

This feature is a **voice conversation with a former peer who now reports to them**, then **written feedback on four management competencies**. It is a **sibling** to the existing Practice Simulation — not a replacement.

The chapter journey is:

**PRE 1:1 (baseline)** → watch MC1 videos → **POST 1:1 (growth check)**

Same skills, two different incidents, so the second conversation is not a memorized replay of the first.

---

## 2. What the learner sees

1. Chapter entry (“Join Conversation”).
2. Short brief: who is in the 1:1, what happened, four objectives.
3. Live voice call (microphone). The character speaks first. The learner talks; the character answers in real time.
4. Learner taps **End scene**.
5. Debrief: overall headline (Nailed it / Solid / Try again), score 1–10, four competency scores, what they did well, what to try next, and a few “better line” suggestions from their own words.

**PRE — Claire · Presentation Quality Miss**  
First 1:1 after senior leadership sent back a client deck Claire owned.

**POST — Sam · Client Report Rejection**  
First 1:1 after the client flagged a report with numbers Sam owned.

Both scenes score the same four skills: **Building Trust, Setting Goals, Directing Work, Ensuring Accountability.**

---

## 3. How it works (architecture)

One stack. Two scenes. Two prompt files per scene.

```
Learner (browser)
    │  Join Conversation
    ▼
Coach UI  →  POST /api/arena/exp7/sessions          create session + scene id
          →  POST /api/arena/exp7/sessions/:id/realtime-token
                │
                │  loads ACTOR prompt + voice for that scene
                ▼
         OpenAI Realtime (speech-to-speech)
                │  character audio + captions
                ▼
          live 1:1 (turns saved on our server)
                │  End scene
                ▼
          POST /api/arena/exp7/sessions/:id/complete
                │  loads ANALYZER prompt + full transcript
                ▼
         OpenAI chat (JSON debrief)
                ▼
          Feedback screen
```

**Scene config** (JSON) is the switchboard: character, voice, actor file, analyzer file, turn limits. The UI does not hardcode Claire vs Sam speech.

**Split of labor (important):**

| File | Who reads it | Job |
|------|----------------|-----|
| **Actor prompt** | The character on the call | Be Claire or Sam. Put pressure on the table. Never coach. Never mention scores. |
| **Analyzer prompt** | The coach **after** the call | Score the **learner** on the four competencies from the transcript only. |
| **Locked competency goals** | Design / analyzer only | What “good” looks like. **Not** shown to the learner. **Not** in the character’s mouth. |
| **Learner copy** (brief + objectives) | The human before they join | Story + what we hope they practice. |

That split is why the character sounds like a coworker, not a quiz.

---

## 4. Models and audio

| Step | Model | Role |
|------|--------|------|
| Live conversation | **gpt-realtime-2.1** (override: `ARENA_REALTIME_MODEL`) | Speech in / speech out. Character follows the actor prompt. |
| Character voice | PRE **marin** (Claire) · POST **sage** (Sam) | Distinct voices so PRE/POST do not sound like the same person. |
| Speech captions | **whisper-1** | Transcribe the learner for the transcript we score. |
| Debrief | **o3** (override: `ARENA_LLM_MODEL`) | Read transcript + analyzer prompt → JSON scores and coaching lines. |
| API key | `OPENAI_API_KEY` | Required. No key → session cannot start. |

Turn-taking is server VAD (voice activity): the model waits ~0.9s of silence before answering. The learner ends the scene; we do **not** auto-hang-up on a pause.

---

## 5. Prompt design (same for PRE and POST)

Both actor prompts use the **same skeleton**. Only the incident changes.

1. **Who you are** — Claire or Sam; learner is the new manager.
2. **Facts fence** — five closed facts. No invented names, numbers, or side plots.
3. **Guardrails** — English only; refuse off-topic; one “you still there?” on silence then wait; do not match abuse.
4. **Voice** — 1–3 short sentences; answer first; one new thing; no A-or-B menus; no trainer questions.
5. **The 1:1** — four beats in order, spoken as **character needs**, not as “goals we test”:
   - Trust (be heard before they start fixing)
   - Goals (what they want done **this week**, with a real time)
   - Directing work (who does the rework; old peer-rescue habit as a hope, not a quiz)
   - Accountability (miss stays real; how you will know it is ready before it goes out again)
6. **Close** — recap + goodbye. No homework. No coaching.

Analyzer prompts use the **same rubric and JSON**. Only names and objects change (deck/leadership vs report/client). Score **learner lines only**. If a competency never came up, mark `not_observed` — do not invent failure.

Verbatim actor + analyzer text: **`EXP7_ROLEPLAY_PROMPT_APPENDIX.md`** (same folder). Too long for this brief.

---

## 6. What “good” means (locked, not on screen)

Goals are grounded in MC1 video teaching (listen before redesign; short-term goal + time; assign don’t do; name the miss and check before it goes out again). Compressed to **this week’s recovery**, not a 90-day plan.

PRE object: Claire’s **deck** back from **leadership**.  
POST object: Sam’s **report** flagged by the **client**.

Overall score = mean of observed competencies. Headlines: ≥8 Nailed it · ≥5 Solid · else Try again.

---

## 7. Status and ask

**Working now (local / demo UI):** PRE Claire voice 1:1 + debrief; POST Sam scene wired the same way (`/arena/exp7/pre-post/session` and `?phase=post`).

**Not this brief:** replacing Practice Simulation; saving PRE vs POST scores for a growth chart; production GitLab deploy from this sandbox.

**Ask:** confirm this PRE→videos→POST shape and the actor/analyzer split, then we run a live POST pass and lock copy for Coach.

**Demo (existing PRE/POST project):** https://jove-exp7-pre-post.vercel.app/arena/exp7/pre-post  
**Local:** `http://localhost:3001/arena/exp7/pre-post`
