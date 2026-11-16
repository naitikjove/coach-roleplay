# Staging feedback UI — what frontend already renders

Source: Coach `FeedbackScreen` on staging/prod (e.g. `?step=feedback`).

## Layout (practice)

1. Eyebrow + scenario title (roleplay title, not a “Nailed it” headline)
2. Status line (from backend feedback variant — pass/fail style copy when applicable)
3. **How it went** — summary paragraph
4. **Focus card** (next-step / recommended practice) — eyebrow, title, body, primary/secondary CTAs  
   - Often drives “watch this concept” / continue / retake via backend actions
5. **Score ring** — caption: `Practice Roleplay Score`
6. **Competency rows** (4) — score ring + label + note  
   - Expand → **You said** + **Try instead** (quotes)
7. **Up next** block when backend sends `upNext`
8. Transcript / “See examples” when provided

## Do **not** implement from this pack

- Result headlines: ~~Nailed it~~ · ~~Solid~~ · ~~Try again~~ (local Arena only)
- New feedback section names — keep existing staging labels

## What content owners still supply for FE

From `COPY.md` / `brief-ui.json`: brief title, scenario, objectives, who cards, image, competency **display** names, pass threshold **7**.

Video deep-links: `VIDEO_MAPPING.md`.
