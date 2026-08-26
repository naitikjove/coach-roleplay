# Exp 7 — Production UI Plan · Practice Simulation Shell

**Status:** PLAN (implementation next)  
**Lock date:** 2026-07-07  
**Design reference:** [`b2c-ui-main/src/app/arena/exp4/PRODUCTION_UI_GUIDE.md`](../../b2c-ui-main/src/app/arena/exp4/PRODUCTION_UI_GUIDE.md)  
**Experience spec:** [LOCKED_SPEC.md](./LOCKED_SPEC.md)

---

## 1. Goal

Build a **pixel-to-pixel production shell** (same approach as Exp 4 and the chat sandbox) for the Exp 7 **voice roleplay** — without forking layout, typography, or sidebar chrome.

Learner flow:

```
Sidebar: "Practice Simulation" (active)
    → Work skills picker (2 subjects)
        → NME micro-course chapter view (production shell, NO video thumbnails)
            → Voice roleplay panel (Alex · demo favor scene)
```

---

## 2. Core principle (copy from Exp 4)

| Do | Don't |
|----|--------|
| Embed in `b2c-ui-main` | Standalone HTML / separate React app |
| Reuse `SidebarLayout`, `MicroCourseChapterVideosClient`, `VideoListing` | Rebuild sidebar or chapter page |
| Add experiment UI only under `src/app/arena/exp7/` | Put exp7 logic in shared Cards/LibraryList |
| Optional props on production shell (`displayOnly`, `hideLibraryList`, slots) | Hardcode "exp7" in production components |

---

## 3. Routes

| Route | Screen |
|-------|--------|
| `/arena/exp7` | **Skill picker** — Work skills box (NME + ICE) |
| `/arena/exp7/new-manager-essentials` | Optional: chapter list for NME (v1 can skip and deep-link MC1) |
| `/arena/exp7/new-manager-essentials/transitioning-from-individual-contributor-to-manager` | **Chapter shell + practice panel** (primary screen) |

**v1 scope:** Only **NME → MC1** chapter is live. **Individual Contributor Excellence** appears in picker but **locked** (lock icon + tooltip "Coming soon").

Local URL: `http://localhost:3000/arena/exp7`

---

## 4. Layout architecture

```
/arena/exp7/.../page.tsx
  ArenaExp7Seed.tsx              ← guest user (copy Exp4Seed pattern)
  ArenaExp7Client.tsx            ← route state + composition
    SidebarLayout                ← production sidebar (+ Practice Simulation item)
      forceDesktopLayout
      skipAuthModals
      experimentNavKey="practice-simulation"
      onNavigateAttempt → block non-exp7 nav
    ┌─────────────────────────────────────────────┐
    │  Main content (route-dependent)              │
    │  A) Skill picker OR                          │
    │  B) MicroCourseChapterVideosClient           │
    │       displayOnly                            │
    │       hideLibraryList={true}   ← NO thumbs   │
    │       hideChapterCard={true}   ← optional    │
    │       chapterCardSlot={<Exp7PracticePanel />}│
    └─────────────────────────────────────────────┘
```

### What stays identical to Exp 4 / production

- JoVE sidebar width, logo, menu item height, icon size, active blue state
- Breadcrumb (`MicrocourseBreadcrumb`)
- Subject title row ("Transitioning from Individual Contributor to Manager")
- Left **chapter list** column on desktop (ChapterListing) — same scroll, selection, progress ticks
- Inter font, `#2183ed` primary, `#18181b` / `#52525b` text tokens
- `displayOnly` — no real navigation away from experiment

### What is different from Exp 4

| Exp 4 | Exp 7 |
|-------|-------|
| Diagnosis / growth cards | **Voice practice panel** |
| Video thumbnail grid visible | **`hideLibraryList={true}`** — no thumbnails |
| Default sidebar items | **Practice Simulation** highlighted; others blocked |
| Entry at `/arena/exp4` | Entry at skill picker → NME chapter |

---

## 5. Sidebar — "Practice Simulation"

### Behavior

- Add **one** experiment nav item in the production sidebar (via optional prop — same pattern as `skipAuthModals`):
  - **Label:** `Practice Simulation`
  - **Icon:** professional practice/simulation icon (SVG in `arena/exp7/assets/` — e.g. speech-bubble + waveform or target/layers; match 24px sidebar icon style)
  - **Active** on all `/arena/exp7/*` routes
- **All other sidebar items** (Home, Explore, Chat, etc.): visible but **non-functional** — `onNavigateAttempt` blocks + no route change (Exp 4 pattern).
- Profile / help at bottom: blocked or inert for v1.

### Production change (minimal)

Extend `SidebarLayout` with optional:

```tsx
experimentNav?: {
  key: "practice-simulation";
  label: "Practice Simulation";
  icon: ReactNode;
  iconActive: ReactNode;
  href: "/arena/exp7";
};
experimentNavActive?: boolean;
```

When `experimentNav` is set, render it **below Explore** (or in the primary nav block per design review). Default `undefined` → unchanged prod.

---

## 6. Screen A — Work skills picker (`/arena/exp7`)

Shown when user clicks **Practice Simulation** (or lands on `/arena/exp7`).

### UI

- Same main content area width/padding as micro-course explore (measure `ExploreClient` / production subject grid).
- **Section title:** `Work skills` (production type scale: `type-h3` or match SubjectCard heading)
- **Two cards** in a row (desktop) / stack (mobile):

| Card | Title | Subtitle | v1 |
|------|-------|----------|-----|
| 1 | **New Manager Essentials** | Workplace skills for first-time managers | **Clickable** → chapter route |
| 2 | **Individual Contributor Excellence** | Skills for high-performing ICs | **Locked** (lock icon, no navigation) |

Card styling: match production **SubjectCard** / micro-course subject tiles — `border-radius: 8px`, `1.2px solid rgba(0,0,0,0.1)`, white surface. No custom purple/marketing styles.

### Component

`Exp7SkillPicker.tsx` + `Exp7SkillPicker.module.css` in `arena/exp7/`

Data: `exp7FallbackData.ts` (hardcoded slugs + labels; optional live API later).

---

## 7. Screen B — NME chapter + practice (`/arena/exp7/.../transitioning-from-individual-contributor-to-manager`)

### Production shell

Reuse **`MicroCourseChapterVideosClient`** exactly as Exp 4:

```tsx
<MicroCourseChapterVideosClient
  initialData={payload.initialData}
  microCourseOverviewData={payload.microCourseOverviewData}
  displayOnly
  experimentSlugs={{
    subjectSlug: "new-manager-essentials",
    chapterSlug: "transitioning-from-individual-contributor-to-manager",
  }}
  hideLibraryList={true}
  chapterCardSlot={<Exp7PracticePanel />}
/>
```

**Visual order on desktop:**

1. Breadcrumb  
2. Chapter title + Concepts count (production)  
3. **`Exp7PracticePanel`** (24px gap — same slot spacing as Exp4DiagnosisCard)  
4. ~~Video thumbnails~~ **hidden**  
5. Chapter overview (optional — keep if data present; below practice)

Left column: **chapter list** unchanged — user sees they're in NME MC1 context.

### Why `hideLibraryList` instead of removing videos from data

- Keeps breadcrumb / SubjectCard / chapter header fields production-accurate  
- Avoids breaking components that expect `videos.length`  
- One flag already exists in `VideoListing.tsx`

---

## 8. Screen B — right panel: `Exp7PracticePanel`

All new UI lives in `src/app/arena/exp7/`. Reuse **patterns** from Exp 4 voice UI where it saves time:

| Reuse from Exp 4 | Use in Exp 7 |
|------------------|--------------|
| `Exp4Waveform` | Listening / speaking indicator |
| `Exp4CharacterCard` / `Exp4SpeakerAvatar` | Alex card (monogram + name + role) |
| `Exp4RollingCaption` or karaoke text | Live captions |
| `exp4VoiceConfig` pattern | Alex voice mapping (separate constant file) |

### Panel states

| State | UI |
|-------|-----|
| **idle** | Scene title "The demo favor" · one line "Alex wants to talk" · primary CTA **Start** (pill button — `ds-btn--primary`) |
| **live** | Alex card + waveform + captions · **End scene** (secondary) · no on-screen rubric |
| **debrief** | Headline (Nailed it / Solid / Try again) · **coach_summary** paragraph · 6 tick rows · **Retake** · optional lesson link |

No context card, no story text, no thumbnails — story comes from Alex voice only ([LOCKED_SPEC](./LOCKED_SPEC.md)).

### API

- v1: `arena/roleplay/services/arena-api` (local) or Next proxy route `/api/arena/exp7/...`
- Prompts: [`prompts/alex.prompt.txt`](./prompts/alex.prompt.txt), [`prompts/analyzer.prompt.txt`](./prompts/analyzer.prompt.txt)

---

## 9. File structure (to create)

```
b2c-ui-main/src/app/arena/exp7/
├── README.md                    ← pointer to arena/exp7 + PRODUCTION_UI_GUIDE
├── PRODUCTION_UI_GUIDE.md       ← exp7-specific deltas (this plan condensed)
├── page.tsx                     ← /arena/exp7 skill picker
├── ArenaExp7Seed.tsx
├── ArenaExp7Client.tsx
├── Exp7SkillPicker.tsx + .module.css
├── Exp7PracticePanel.tsx + .module.css
├── Exp7Debrief.tsx + .module.css
├── exp7FallbackData.ts
├── constants.ts
├── loadExp7ChapterData.ts
└── assets/
    └── practice-simulation.svg (+ active variant)

b2c-ui-main/src/app/arena/exp7/new-manager-essentials/
└── [chapterSlug]/page.tsx       ← chapter + practice shell
```

Spec + prompts remain in **`arena/exp7/`** (repo root) — implementation imports prompts or duplicates path reference in API.

---

## 10. Production files to touch (minimal)

| File | Change |
|------|--------|
| `SidebarLayout/index.tsx` | Optional `experimentNav` item |
| `MicroCourseChapterVideosClient.tsx` | Already has `hideLibraryList`, `chapterCardSlot` — **no change** if sufficient |
| `VideoListing.tsx` | Already supports `hideLibraryList` — **no change** |
| `ConditionalHeader.tsx` | Already hides marketing header on `/arena/*` — verify `/arena/exp7` |

**Do not** add exp7 imports to production Cards or LibraryList.

---

## 11. Data & auth

Same as Exp 4:

- `ArenaExp7Seed` + guest prototype user  
- `exp7FallbackData.ts` for offline dev (NME MC1 chapter metadata — **thumbnails in data OK but not rendered**)  
- `EXP7_USE_LIVE_API=true` optional  
- `displayOnly` + `skipAuthModals`

---

## 12. Implementation phases

### Phase 1 — Shell (pixel parity)

- [ ] Routes + Seed + Skill picker  
- [ ] Sidebar Practice Simulation item + block other nav  
- [ ] NME MC1 chapter page with `hideLibraryList` + empty slot placeholder  

### Phase 2 — Practice panel

- [ ] Exp7PracticePanel idle + live UI (mock Alex lines)  
- [ ] Wire Realtime / arena-api + exp7 Alex prompt  

### Phase 3 — Debrief

- [ ] Analyzer prompt → coach_summary + checklist UI  
- [ ] Retake flow  

### Phase 4 — Polish

- [ ] ICE card locked state  
- [ ] Mobile layout pass  
- [ ] Golden path QA (strong / cave / recap)

---

## 13. Acceptance criteria

- [ ] Side-by-side with `/arena/exp4`, sidebar and chapter header are indistinguishable at pixel level  
- [ ] No video thumbnails on exp7 chapter route  
- [ ] Practice Simulation is the only functional sidebar item  
- [ ] NME → MC1 opens chapter view with left chapter list intact  
- [ ] Voice practice runs without on-screen story/context card  
- [ ] Debrief shows flowing coach_summary (not labeled sections)  
- [ ] Works offline with fallback data  

---

## 14. Related docs

| Doc | Path |
|-----|------|
| Exp 7 locked experience | `arena/exp7/LOCKED_SPEC.md` |
| Alex + analyzer prompts | `arena/exp7/prompts/` |
| Exp 4 production UI bible | `b2c-ui-main/.../exp4/PRODUCTION_UI_GUIDE.md` |
| Chat sandbox pattern | `expv5-chat-improvement/README.md` |
