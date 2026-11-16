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
├── ACCEPTANCE.md             ← shared ship checklist
├── 01-frontend/              ← brief UI + learner-facing copy ONLY
│   ├── README.md
│   ├── COPY.md               ← human-readable locked copy
│   └── brief-ui.json         ← machine-readable same fields
└── 02-backend/               ← prompts, models, scene runtime ONLY
    ├── README.md
    ├── WIRING.md             ← Realtime + analyzer API shape
    ├── scene-runtime.json    ← ids, voice, turn limits, checklist ids
    └── prompts/
        ├── dana_brightway.actor.vB.prompt.txt
        └── dana_brightway.analyzer.vB.prompt.txt
```

## One-line summary for each side

- **Frontend:** Title, scenario paragraph, 4 objectives, who cards, entry card, Dana image, feedback section labels, pass threshold display.
- **Backend:** Wire actor prompt + voice `sage` + Realtime model; wire analyzer prompt + scoring JSON; use checklist ids from `scene-runtime.json`.

Do **not** mix: frontend does not paste full prompts into the UI; backend does not invent brief copy — use `01-frontend` as the only source for learner-facing strings.
