# Locked learner-facing copy (variable only)

Static feedback chrome (How it went, Your next step, You said, Try instead, score ring labels, Nailed it / Solid / Try again, etc.) already exists on staging — **do not re-specify it here**.

## MC1 headline replacement (practice slot)
Shown when the learner opens MC6 practice (modal / purpose line). Production may still show MC1 copy here; replace only this headline.

| Field | Copy |
|---|---|
| Eyebrow | Practice Roleplay |
| Headline | Show how you'd help a team member whose customers keep calling in again |
| Subtitle | Unchanged — keep as in production |
| Chips | Unchanged — keep as in production (Voice Roleplay \| No Preparation \| Instant Feedback) |

- **Replaces the MC1 headline "See how you'd handle your first 1:1" for this slot.**
- The headline is **not** the scenario title. Keep the title below as **The Follow-Ups That Keep Slipping**.
- Do **not** call this string "Entry card body".

## Title
The Follow-Ups That Keep Slipping

## Scenario (brief card)
You manage a small customer support team. Marcus takes calls from customers who have a problem. When he can't fix it on the call, he writes a short note, and the tech team fixes it from that. Later, Marcus calls the customer to check that it worked. Lately his follow-up calls have been late, and the same customers keep calling in again. Marcus asked to talk to you. Help him work out what to do.

## Your Objectives
1. Marcus is behind on his follow-up calls and plans to stay late to catch up. Decide with him what to do.
2. Marcus keeps his calls short so customers don't wait. Agree with him what, if anything, should change on his calls.
3. Three upset customers are about to hear from Marcus. Agree with him how he handles those calls.

## Who is in the Conversation

**You — Manager**  
You manage a small support team. Marcus and Nina report to you.

**Marcus — Direct report**  
Takes calls from customers and calls them later to check. Friendly and quick.

## Character image
- Pack (GitHub — open this): [`assets/marcus.jpg`](assets/marcus.jpg)
- App path (prod wiring): `/arena/exp4/characters/marcus.jpg`

## Pass threshold
7 / 10 (per competency)

## Competencies (display + id)
| Display | id |
|---|---|
| Assessing Capabilities | `assessing_capabilities` |
| Coaching Team Members | `coaching_team_members` |
| Sharing Knowledge | `sharing_knowledge` |

## Course placement
- Program: New Manager Essentials  
- Lesson: Coaching and Developing Teams  
- Slot: Practice Roleplay (`scene-mc6-marcus-practice`)

## Videos
See [`VIDEO_MAPPING.md`](VIDEO_MAPPING.md).
