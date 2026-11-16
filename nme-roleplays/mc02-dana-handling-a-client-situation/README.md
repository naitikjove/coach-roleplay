# MC02 Practice — Dana · Handling a client situation (FINAL)

**Share this folder:**  
https://github.com/naitikjove/coach-roleplay/tree/main/nme-roleplays/mc02-dana-handling-a-client-situation

| | |
|---|---|
| Lock | `2.0.0-dana-brightway-vB-final` |
| Course | New Manager Essentials → Building a Managerial Mindset → Practice Roleplay |
| Brief | `…/building-a-managerial-mindset/practice-roleplay?step=brief` |
| Replaces | Old Dana practice (“Coordinating a Late Report” / Late Again) |

## Who reads what (keep FE and BE separate)

| Role | Open this folder | Ignore |
|---|---|---|
| **Frontend** | [`01-frontend/`](01-frontend/) | Actor/analyzer prompt text (unless displaying labels) |
| **Backend / AI** | [`02-backend/`](02-backend/) | Brief layout / copy polish (unless wiring checklist ids) |
| **Both / QA** | [`ACCEPTANCE.md`](ACCEPTANCE.md) | — |

```
mc02-dana-handling-a-client-situation/
├── README.md                 ← you are here
├── STAGING_VS_LOCAL.md       ← what not to copy from Arena
├── ACCEPTANCE.md             ← shared ship checklist
├── 01-frontend/              ← brief + video map + staging feedback notes
│   ├── README.md
│   ├── COPY.md
│   ├── brief-ui.json
│   ├── VIDEO_MAPPING.md      ← Must Watch lesson id ↔ competency
│   └── FEEDBACK_UI.md        ← staging FeedbackScreen (no Nailed it)
└── 02-backend/               ← prompts, models, scene runtime ONLY
    ├── README.md
    ├── WIRING.md
    ├── scene-runtime.json
    └── prompts/
        ├── dana_brightway.actor.vB.prompt.txt
        └── dana_brightway.analyzer.vB.prompt.txt
```

## One-line summary for each side

- **Frontend:** Title, scenario, objectives, who cards, entry card, image, Must Watch video table. Feedback chrome already exists on staging — only wire copy + video map.
- **Backend:** Actor prompt + voice `sage` + Realtime; analyzer prompt + scoring; checklist ids from `scene-runtime.json`.

**Do not ship from local Arena:** result headlines Nailed it / Solid / Try again.

Do **not** mix: frontend does not paste full prompts into the UI; backend does not invent brief copy — use `01-frontend` for learner-facing strings.
