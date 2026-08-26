# PRD: PRE/POST roleplay — Coach integration

| Field | Value |
|--------|--------|
| **Status** | Draft |
| **Owner** | PM (Arena / New Manager Essentials) |
| **Last updated** | 2026-08-13 |
| **Target product** | coach.jove.com (`b2c-ui-main` / JoVE Coach) |
| **Live reference** | https://jove-exp7-pre-post.vercel.app/arena/exp7/pre-post |
| **Content source of truth** | [PRE/POST Coach copy (Google Doc)](https://docs.google.com/document/d/1QycNW09Hf0FileBarxSgWelzgxju0dSIRTzKI4k6TVA/edit?tab=t.0) — engineering syncs learner-facing copy from this doc into local mirrors (`CONTENT_FINAL.md` / `pre-post/constants.ts`). This PRD does not reproduce the doc body. |
| **Scenes** | PRE: `scene-mc1-jordan-pre` · POST: `scene-mc1-sam-post` |

---

## 1. Problem / opportunity

**New Manager Essentials** · *Transitioning from IC to Manager* teaches IC→manager skills through videos. Learners need a **baseline check before** the chapter and a **growth check after**—so they can see how their 1:1 skills change.

PRE/POST roleplay is a **one-card voice journey** on Coach:

1. **Jordan 1:1 (PRE)** — Presentation Quality Miss (baseline before videos)
2. Chapter videos (existing MC1 content)
3. **Sam 1:1 (POST)** — Client Report Rejection (measure growth after videos)

This ships as a **sibling** Arena surface next to the existing dual-card **Practice Simulation**—not a swap or replacement. v1 includes **both PRE and POST**.

---

## 2. Goals / non-goals

### Goals

1. Ship the full **PRE → videos → POST** journey on **coach.jove.com**.
2. Match learner copy to the **Google Doc** (synced into local mirrors).
3. Reuse the existing voice roleplay stack (session APIs, practice panel, debrief) for both scenes.
4. Host entry inside the **microcourse chapter shell** (NME MC1 chrome + chapter card slot), with phase-aware PRE vs POST entry/session.
5. Leave dual-card Practice Simulation unchanged and regression-free.

### Non-goals

| Out of scope | Notes |
|--------------|--------|
| Replace Practice Simulation | PRE/POST is a **sibling** (`/arena/exp7/pre-post`), not a swap for `/arena/exp7`. |
| New voice/session infrastructure | No parallel realtime stack; call existing APIs with the two scene ids below. |
| Inventing learner copy in eng | Ownership is the Google Doc; local files are mirrors after sync. |
| Score persistence PRE→POST | Nice-to-have; v1 may be session-local debrief only (see open questions). |
| Deferring Sam POST | **In scope for this PRD** — not a later phase. |

---

## 3. Users & use case

| Who | When | Why |
|-----|------|-----|
| Authenticated Coach learner on **New Manager Essentials** | **Before** MC1 chapter videos (PRE) | Baseline 1:1 skills with Jordan |
| Same learner | **After** MC1 chapter videos (POST) | Re-measure with Sam; see growth vs baseline |

**Primary use case:** Learner opens PRE on the MC1 chapter surface → completes Jordan 1:1 + debrief → watches chapter videos → returns for POST → completes Sam 1:1 + debrief.

---

## 4. Product experience

### Content source of truth

| Layer | Source |
|-------|--------|
| **Canonical product copy** | [Google Doc](https://docs.google.com/document/d/1QycNW09Hf0FileBarxSgWelzgxju0dSIRTzKI4k6TVA/edit?tab=t.0) |
| **Local mirrors (after sync)** | `b2c-ui-main/src/app/arena/exp7/pre-post/CONTENT_FINAL.md`, `pre-post/constants.ts` |

Engineering must sync Coach copy from the Google Doc into those mirrors before ship. Do not invent learner text in PRs.

### Learner journey

```
PRE entry (Jordan 1:1 · Presentation Quality Miss)
  → short transition (“Entering 1:1 with Jordan”)
    → Session brief → Join → voice 1:1 → debrief
      → Chapter videos (MC1)
        → POST entry (Sam 1:1 · Client Report Rejection)
          → transition → Session brief → Join → voice 1:1 → debrief
```

### Jordan 1:1 (PRE) — Presentation Quality Miss

| Item | Value |
|------|--------|
| Routes (codebase) | `/arena/exp7/pre-post` (+ `/session`); nested slug redirect → entry |
| Scene id | `scene-mc1-jordan-pre` |
| Character | Jordan · Former peer |
| Assessed on | Building Trust, Setting Goals, Directing Work, Ensuring Accountability |
| Entry purpose | *Check your current skills before the videos, then come back after to see the difference.* (sync from Google Doc / mirrors) |
| Status | Wired on live demo (scene JSON, prompts, session UI) |

### Sam 1:1 (POST) — Client Report Rejection

| Item | Value |
|------|--------|
| Routes (codebase) | Same `/arena/exp7/pre-post` family, phase = POST |
| Scene id | `scene-mc1-sam-post` |
| Character | Sam · Former peer and work friend |
| Assessed on | Same four competencies |
| Copy | Present in local mirrors; must stay synced to Google Doc |
| Eng gap | **Not fully wired** — needs scene JSON, Sam actor/analyzer prompts, content resolve for `scene-mc1-sam-post`, and session/entry phase switching (today hard-wired to PRE) |

### Shared UX (both phases)

- **Entry:** NME · *Transitioning from IC to Manager* chapter chrome + one meta card (Jordan or Sam).
- **Session:** breadcrumb Home → New Manager Essentials → Transitioning… → Roleplay → brief (About + Objectives | Who + Join) → live voice → debrief (radar, did well, takeaways, transcript improvements).

---

## 5. What to build (Coach)

### In scope (v1)

- Jordan PRE one-card flow on Coach (parity with live demo).
- Sam POST one-card flow on Coach after videos (copy + full session/API/scene wiring).
- Phase-aware entry/session so learners can complete **PRE then POST**.
- Feature flag / gating for this surface without breaking Practice Simulation.

### Where in Coach

| Route (codebase) | Role |
|------------------|------|
| `/arena/exp7/pre-post` | Entry: chapter shell + phase meta card (PRE Jordan / POST Sam) |
| `/arena/exp7/pre-post/session` | Brief → live → debrief for active phase |
| `/arena/exp7/pre-post/[subjectSlug]/[chapterSlug]` | Redirect → `/arena/exp7/pre-post` |

**Decision:** Keep these paths for v1. Do not relocate under `/microcourse/...`. A future deep-link from the real MC1 microcourse URL can point here without renaming routes.

**Do not change:** `/arena/exp7` dual-card Practice Simulation.

### Sibling surfaces

| Surface | URL (codebase) | What learners see |
|---------|----------------|-------------------|
| Practice Simulation | `/arena/exp7` | Dual cards (existing) |
| PRE/POST roleplay (this PRD) | `/arena/exp7/pre-post` | Jordan PRE + Sam POST |

### Reuse existing voice roleplay stack

| Layer | Reuse |
|-------|--------|
| Voice UI | Practice panel, realtime helpers, idle/live cards |
| APIs | Session create / realtime-token / commit-turn / complete under `/api/arena/exp7/*` with `sceneId` = PRE or POST scene |
| Content loader | `src/lib/arena/exp7/content.ts` — extend for Sam POST (PRE already mapped) |
| Debrief | Existing debrief + competency radar + analyzer |
| Shell | Entry: microcourse chapter client + entry card; Session: existing Arena shell |

### Env

| Variable | Required | Notes |
|----------|----------|--------|
| `OPENAI_API_KEY` | Yes | Sessions return 503 without it |
| `ARENA_LLM_MODEL` | Optional | Analyzer default if unset |

Demo-only middleware used on the Vercel preview must **not** replace Coach production auth when integrating.

### Feature flag / gating

Recommend a Coach flag (e.g. `NEXT_PUBLIC_ARENA_PRE_POST=true` or remote-config equivalent):

- Default **off** in production until QA sign-off; **on** for internal / early cohorts.
- When off: hide the chapter card slot or 404/redirect PRE/POST routes; Practice Simulation stays up.

---

## 6. Technical map (eng pointers)

### Already in `b2c-ui-main`

| Area | Path | PRE | POST |
|------|------|-----|------|
| Entry | `src/app/arena/exp7/pre-post/` (`page.tsx`, client, entry card) | Wired (Jordan) | Needs phase UI (Sam card / swap) |
| Session | `…/session/`, `PrePostSessionClient.tsx` | Wired | Needs POST wiring |
| Copy / constants | `pre-post/constants.ts`, `CONTENT_FINAL.md` | Present | Copy present; runtime not driven |
| Shared UI | `prePost.module.css`, chapter data loader, Arena shell | Shared | Shared |
| Practice Simulation (do not regress) | `ArenaExp7Client.tsx`, dual-card pages | n/a | n/a |
| Scene resolve / APIs | `src/lib/arena/exp7/content.ts`, `src/app/api/arena/exp7/**` | `scene-mc1-jordan-pre` mapped | **Not mapped** |
| Scene JSON | `arena/exp7/config/scene-jordan-pre.json` | Exists | **Missing** Sam scene JSON |
| Prompts | Jordan Presentation Quality Miss actor + analyzer | Exists | **Missing** Sam actor + analyzer |

### Scene IDs

| Phase | Character | Title | Scene id | Status |
|-------|-----------|-------|----------|--------|
| PRE | Jordan | Presentation Quality Miss | `scene-mc1-jordan-pre` | Wired |
| POST | Sam | Client Report Rejection | `scene-mc1-sam-post` | Declared in constants only; eng must add config, prompts, content resolve, UI phase |

### Eng checklist

1. Sync learner copy from the [Google Doc](https://docs.google.com/document/d/1QycNW09Hf0FileBarxSgWelzgxju0dSIRTzKI4k6TVA/edit?tab=t.0) → `CONTENT_FINAL.md` + `constants.ts`.
2. Confirm Jordan PRE ships with the Coach build.
3. **Add Sam POST:** scene JSON, actor + analyzer prompts, content resolve for `scene-mc1-sam-post`, entry + session phase switching.
4. Gate PRE/POST with agreed flag; Practice Simulation remains independent.
5. Ensure Coach auth covers `/arena/exp7/pre-post*`.
6. Smoke Practice Simulation `/arena/exp7` after merge.
7. QA full journey: PRE → (videos) → POST.

---

## 7. Acceptance criteria (QA on coach.jove.com)

### Functional — Jordan 1:1 (PRE)

- [ ] With flag **on**, `/arena/exp7/pre-post` shows NME MC1 chapter chrome + Jordan meta card (title, purpose, four competencies, Enter CTA).
- [ ] Enter CTA shows short transition, then lands on `/arena/exp7/pre-post/session` (PRE phase).
- [ ] Session brief shows About, Objectives, Who (You + Jordan), mic note, Join Conversation.
- [ ] Join starts voice session for `scene-mc1-jordan-pre`.
- [ ] End scene → analyzing → debrief (radar, did-well, takeaways, transcript improvements).
- [ ] Copy matches Google Doc sync / local mirrors (no invented learner text).

### Functional — Sam 1:1 (POST) and journey

- [ ] After PRE (and chapter videos per product rules), learner can open **POST** for Sam · Client Report Rejection.
- [ ] POST session brief shows About, Objectives, Who (You + Sam), Join Conversation.
- [ ] Join starts voice session for `scene-mc1-sam-post`.
- [ ] End scene → analyzing → debrief (same components as PRE).
- [ ] Copy matches Google Doc sync / local mirrors.
- [ ] Full path works: **PRE → videos → POST** without breaking chapter chrome.
- [ ] With flag **off**, PRE/POST entry is not shown; Practice Simulation still works.

### Non-regression

- [ ] `/arena/exp7` still shows **two** practice cards; both sessions still start and debrief.
- [ ] Health endpoint for the Arena voice APIs OK when OpenAI key configured.

### Platforms

- [ ] Desktop Chrome/Safari: mic permission + live audio + debrief scroll for **both** PRE and POST.
- [ ] Document mobile: if Coach forces desktop layout on Arena, confirm expected behavior; no hard requirement for full mobile voice polish in v1 unless product expands scope.

---

## 8. Analytics / success metrics (lightweight)

Minimum recommended events (names to match Coach telemetry conventions):

| Event | When |
|-------|------|
| `arena_pre_entry_view` | PRE entry rendered |
| `arena_pre_session_start` | PRE voice session created / Join |
| `arena_pre_session_complete` | PRE debrief returned |
| `arena_post_entry_view` | POST entry rendered |
| `arena_post_session_start` | POST voice session created / Join |
| `arena_post_session_complete` | POST debrief returned |
| Optional payload | `sceneId`, `phase` (`pre` \| `post`), competency score summary |

**Success signals (first 2–4 weeks of flagged cohort):** PRE and POST start rates from entry; completion rates; optional PRE→POST return rate; score distribution (not a hard gate).

---

## 9. Rollout plan

| Stage | Action |
|-------|--------|
| 1 | Keep validating PRE on the live reference URL; finish Sam POST wiring + copy sync from Google Doc |
| 2 | Merge PRE/POST tree to Coach; set `OPENAI_API_KEY` / `ARENA_LLM_MODEL` in Coach env |
| 3 | Ship with PRE/POST flag **off**; internal QA of PRE + POST on coach.jove.com |
| 4 | Enable flag for early cohort; optional chapter card slot as PRE/POST entry |
| 5 | Default for **MC1 PRE/POST** once metrics look healthy |

---

## 10. Open questions

1. **Auth:** Who may hit PRE/POST on Coach—all NME learners, early cohort only, or internal until flag default-on?
2. **Discovery:** Deep-link only vs replace/augment default chapter card on real MC1 microcourse URL?
3. **POST unlock:** Same visit after “mark videos watched,” manual return URL, or always-available phase toggle?
4. **Score storage:** Persist PRE baseline per user for POST comparison, or v1 session-only debriefs?
5. **Sidebar:** Distinct PRE/POST nav item, or entry only via chapter card / URL?
6. **Middleware:** Confirm production Coach middleware covers these Arena routes and API auth.
7. **Sam assets:** Final voice id, avatar path, and prompt filenames for `scene-mc1-sam-post` (product + eng).

---

## 11. Appendix

### Content source of truth

| | |
|--|--|
| **Google Doc (canonical)** | https://docs.google.com/document/d/1QycNW09Hf0FileBarxSgWelzgxju0dSIRTzKI4k6TVA/edit?tab=t.0 |
| Local mirrors | `b2c-ui-main/src/app/arena/exp7/pre-post/CONTENT_FINAL.md`, `pre-post/constants.ts` |

### Live reference

| | URL |
|--|-----|
| Entry | https://jove-exp7-pre-post.vercel.app/arena/exp7/pre-post |
| Session | https://jove-exp7-pre-post.vercel.app/arena/exp7/pre-post/session |
| Deploy notes | `b2c-ui-main/arena/exp7/DEPLOY_PRE_POST.md` |

### Copy & scenes

| Asset | Location |
|-------|----------|
| Canonical copy | [Google Doc](https://docs.google.com/document/d/1QycNW09Hf0FileBarxSgWelzgxju0dSIRTzKI4k6TVA/edit?tab=t.0) |
| Local copy mirrors | `CONTENT_FINAL.md`, `constants.ts` |
| PRE scene id | `scene-mc1-jordan-pre` |
| PRE scene JSON | `b2c-ui-main/arena/exp7/config/scene-jordan-pre.json` |
| POST scene id | `scene-mc1-sam-post` |
| POST scene JSON / prompts | **To be added** (eng) |
| Handoff (local) | `b2c-ui-main/src/app/arena/exp7/pre-post/HANDOFF.md` |
