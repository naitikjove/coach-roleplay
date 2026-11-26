# Locked learner-facing copy (variable only)

Static feedback chrome (How it went, Your next step, You said, Try instead, score ring labels, Nailed it / Solid / Try again, etc.) already exists on staging — **do not re-specify it here**.

## MC1 headline replacement (practice slot)
Shown when the learner opens MC4 practice (modal / purpose line). Production may still show MC1 copy here; replace only this headline.

| Field | Copy |
|---|---|
| Eyebrow | Practice Roleplay |
| Headline | Show how you'd set clear roles on your team |
| Subtitle | Unchanged — keep as in production |
| Chips | Unchanged — keep as in production (Voice Roleplay \| No Preparation \| Instant Feedback) |

- **Replaces the MC1 headline "See how you'd handle your first 1:1" for this slot.**
- The headline is **not** the scenario title. Keep the title below as **Planning the Harper Handover**.
- Do **not** call this string "Entry card body".

## Title
Planning the Harper Handover

## Scenario (brief card)
You manage a team of five people. Harper is one of your company's biggest clients, and another team has always looked after them. In three weeks, that work moves to your team. No one on your team has worked with Harper before, and your first delivery to them is due in the second month. Your manager, Rebecca, made this decision with leadership. She has set up a short meeting with you to walk through how your team will handle it. Share your plan with her.

## Your Objectives
1. Your team takes over Harper in three weeks. Tell Rebecca how you'll get your team ready.
2. Harper got two different answers from your team. Agree with Rebecca how to make sure Harper gets one clear answer.
3. You're interviewing two finalists tomorrow. Tell Rebecca how you'll choose.

## Who is in the Conversation

**You — Team lead**  
You lead a team of five. Rebecca is your manager.

**Rebecca — Your manager**  
Busy, direct and fair. She made the decision to move Harper to your team and wants it to go well.

## Character image
- Pack (GitHub — open this): [`assets/rebecca.png`](assets/rebecca.png)
- App path (prod wiring): `/arena/exp4/characters/reporting-manager.png`
- Same image for MC4 practice and certificate (temporary Rebecca avatar until a portrait lands).

## Pass threshold
7 / 10

## Competencies (display + id)
| Display | id |
|---|---|
| Building Effective Teams | `team_setup` |
| Managing Stakeholders | `client_contact` |
| Attracting Top Talent | `attracting_top_talent` |

## Course placement
- Program: New Manager Essentials  
- Lesson: Aligning People and Roles in Teams  
- Slot: Practice Roleplay (`scene-mc4-rebecca-practice`)

## Videos
See [`VIDEO_MAPPING.md`](VIDEO_MAPPING.md).
