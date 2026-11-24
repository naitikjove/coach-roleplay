# Locked learner-facing copy (variable only)

Static feedback chrome (How it went, Your next step, You said, Try instead, score ring labels, etc.) already exists on staging — **do not re-specify it here**.

## MC1 headline replacement (practice slot)
Shown when the learner opens MC3 practice (modal / purpose line). Production may still show MC1 copy here; replace only this headline.

| Field | Copy |
|---|---|
| Eyebrow | Practice Roleplay |
| Headline | Show how you'd set clear goals with your team |
| Subtitle | Unchanged — keep as in production |
| Chips | Unchanged — keep as in production (Voice Roleplay \| No Preparation \| Instant Feedback) |

- **Replaces the MC1 headline "See how you'd handle your first 1:1" for this slot.**
- The headline is **not** the scenario title. Keep the title below as **Planning Ethan's Next Month**.
- Do **not** call this string "Entry card body".

## Title
Planning Ethan's Next Month

## Scenario (brief card)
You manage your company's sales team. Ethan joined your team four weeks ago, and this is his first sales job. His job is to call people who have shown interest in your company's service and get them to sign up. On his first day, your only advice was to get comfortable on the phone and make as many calls as he could. You haven't given him any other guidance since. Today is his first monthly check-in. He's keen and wants to do well. Help him plan his next month.

## Your Objectives
1. Ethan wants to double his calls next month. Agree with him what he should aim for.
2. A customer waited four days for Ethan to reply to her email. Agree with him how to handle customer emails.
3. Agree with Ethan how you'll both know whether it's working.

## Who is in the Conversation

**You — Manager**  
You manage the sales team. You hired Ethan four weeks ago.

**Ethan — Direct report**  
A keen new sales rep in his first sales job. Calls people who have shown interest in the service and tries to get them to sign up.

## Character image
- Pack (GitHub — open this): [`assets/ethan.jpg`](assets/ethan.jpg)
- App path (prod wiring): `/arena/exp4/characters/ethan.jpg`
- Drive (optional; may require Google account): https://drive.google.com/file/d/1sPVjmXmbbfqTpnBdAa1Y5YfyFSxj3WVr/view?usp=drivesdk

## Pass threshold
7 / 10

## Competencies (display + id)
| Display | id |
|---|---|
| Goal Setting | `setting_goals` |
| Expectations Setting | `setting_expectations` |
| Managing & Measuring Work | `measuring_results` |

## Course placement
- Program: New Manager Essentials  
- Lesson: Setting Clear Goals and Expectations  
- Slot: Practice Roleplay (replaces legacy Rachel practice; scene id `scene-mc3-rachel-practice` retained)

## Videos
See [`VIDEO_MAPPING.md`](VIDEO_MAPPING.md).
