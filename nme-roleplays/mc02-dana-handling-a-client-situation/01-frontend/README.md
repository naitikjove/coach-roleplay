# Frontend — Handling a client situation

**Scope:** brief (`?step=brief`) + learner-facing strings. Feedback chrome already exists on staging — do not reinvent it.  
**Not in scope:** Actor/analyzer prompts (see `../02-backend/`).

## Files

| File | Use |
|---|---|
| [`COPY.md`](COPY.md) | Locked brief / who / objectives strings |
| [`brief-ui.json`](brief-ui.json) | Same fields as JSON (+ competency → lesson ids) |
| [`VIDEO_MAPPING.md`](VIDEO_MAPPING.md) | Must Watch table (lesson id ↔ competency) |
| [`FEEDBACK_UI.md`](FEEDBACK_UI.md) | What staging feedback already shows |

## Wire

1. Title → **Handling a client situation**
2. Scenario + 4 objectives + who cards + entry card + image from `COPY.md`
3. Competency display names + Must Watch ids from `VIDEO_MAPPING.md`
4. Keep staging feedback labels: How it went / You said / Try instead / Practice Roleplay Score
5. **Do not** add Nailed it / Solid / Try again

## Source of truth
`COPY.md` for learner text. Staging `FeedbackScreen` for feedback layout.
