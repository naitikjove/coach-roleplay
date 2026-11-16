# Staging feedback UI — verified on coach.dev

Checked live (signed in):  
`…/transitioning-from-individual-contributor-to-manager/practice-roleplay?step=feedback`  
(MC1 Claire practice — **same FeedbackScreen chrome** Dana MC02 will use.)

## Confirmed layout (top → bottom)

| # | Staging element | Notes |
|---|---|---|
| 1 | Eyebrow | e.g. `Practice Roleplay Feedback` |
| 2 | Title | Roleplay title (not a pass/fail headline) |
| 3 | Status line | e.g. `Your starting point before you begin the micro-course` |
| 4 | **HOW IT WENT** | Summary paragraph |
| 5 | **YOUR NEXT STEP** (focus card) | Eyebrow + title + body + primary CTA (e.g. Start Micro-course) + optional “See examples from the conversation” |
| 6 | Score ring | Caption: **Practice Roleplay Score** · score /10 |
| 7 | **SKILLS OVERVIEW** | Competency chart / rings |
| 8 | **INSIGHTS** | Per competency: note (“How it went” for that skill) → expand **You said** / **Try instead** |
| 9 | **YOUR NEXT STEP** (up next) | Next micro-course card (title · video count · duration · CTA) |

## Confirmed: do **not** ship

- ~~Nailed it~~ · ~~Solid~~ · ~~Try again~~ — **not present** on staging feedback

## Labels content owners must keep

- How it went  
- You said  
- Try instead  
- Your next step *(focus + up-next cards — backend variant copy)*  
- Practice Roleplay Score  
- Skills overview / Insights *(existing FE chrome)*

## What this pack still supplies for FE (Dana)

Brief copy + objectives + who cards + image + competency names + Must Watch table (`VIDEO_MAPPING.md`).  
Do **not** redesign this feedback shell — only swap scenario/competency content for MC02.
