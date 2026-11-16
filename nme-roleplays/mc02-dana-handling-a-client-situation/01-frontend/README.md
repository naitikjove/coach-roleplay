# Frontend — Handling a client situation

**Scope:** brief page (`?step=brief`), entry card, who-is-in-conversation, objectives list, debrief section labels.  
**Not in scope:** Realtime prompts, analyzer prompts, model IDs (see `../02-backend/`).

## Files

| File | Use |
|---|---|
| [`COPY.md`](COPY.md) | Locked strings — implement exactly |
| [`brief-ui.json`](brief-ui.json) | Same fields as JSON for CMS / constants |

## Wire these UI surfaces

1. **Title** → `Handling a client situation`
2. **Scenario body** → `COPY.md` / `brief-ui.json` → `scenario`
3. **Your Objectives** → 4 items (same order as live checklist)
4. **Who is in the Conversation** → You + Dana cards
5. **Entry / join card** → `entryCardBody` + character image
6. **Results labels** (unchanged structure): How it went · You said · Try instead · Your next step
7. **Headline labels:** Nailed it / Solid / Try again

## Source of truth

If copy and JSON ever disagree, **`COPY.md` wins** for learner-facing text. Ask product before changing a word.
