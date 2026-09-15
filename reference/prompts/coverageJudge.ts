/**
 * Live objective-coverage judge — out-of-band responses on the existing
 * Realtime session. The judge instructions REPLACE the actor prompt for that
 * one hidden generation; the model reads the conversation it already holds
 * and returns four booleans. Stateless per call; the UI merges monotonically.
 *
 * Coverage ≠ quality. true = the topic was settled in-conversation.
 * Whether the manager handled it well is scored later by the analyzer.
 *
 * ---------------------------------------------------------------------------
 * JUDGE PROMPT ONLY — do not change output schema here.
 * Schema stays exactly: {"1":boolean,"2":boolean,"3":boolean,"4":boolean}
 *
 * ITERATIONS (quality-only; no schema / actor / analyzer edits):
 * - rev1 (2026-09-15): Align criteria to current Claire v17 / Sam v11 beats +
 *   learner-facing objectives. Tighten false positives (greeting-only, weak
 *   ack, character volunteering a plan alone, invite-without-decision).
 * - rev2 (2026-09-15): Playbook test — thin_input falsely set Obj4=true on bare
 *   "Okay"/"Yeah" after Sam's client-visit invite. Require an explicit decision
 *   (who leads / who answers / goes alone / manager joins as support), not a
 *   soft ack of the invite.
 * - rev3 (2026-09-15): More playbooks — (a) derail falsely set Obj3=true with no
 *   ownership line (jargon only); require explicit who-owns-the-fix language.
 *   (b) out_of_order under-called Obj4 when manager clearly offered to join and
 *   Sam accepted — count manager-offer + character-accept as settled.
 * ---------------------------------------------------------------------------
 */
export const JUDGE_PROMPT_REV = 3;

export const EXP7_COVERAGE_TOPIC = "exp7_coverage";

export const EXP7_COVERAGE_OBJECTIVE_COUNT = 4;

type JudgeCriteria = {
  /** Numbered, judge-facing resolution criteria (not learner-facing copy). */
  criteria: [string, string, string, string];
};

/**
 * Claire PRE — maps to UI objectives:
 * 1 talk about what happened with the presentation
 * 2 what needs to happen with the deck this week
 * 3 how the rewrite gets done
 * 4 who represents in the leadership conversation
 */
const JORDAN_PRE: JudgeCriteria = {
  criteria: [
    "Obj1 (what happened): The rejected / sent-back presentation was explained in substance (what leadership flagged or why it came back), AND the manager engaged with that substance (asked, acknowledged, or responded to it). Greeting / how-are-you / role small-talk alone = false. Claire naming it once with no manager engagement = false.",
    "Obj2 (deck this week): A concrete next step for the deck before end of week was expressed AND acknowledged by the other person — review path, timing, or order of work (e.g. draft to manager first, day/time checkpoint). Claire only saying she will fix/rewrite/send up, with no manager ack of path/timing = false. Manager only refusing help with no plan settled = false. Bare okay/yeah/sure alone never settles this.",
    "Obj3 (who does the rewrite): It is now clear who owns the rewrite work after any help/co-write pull resolved — Claire keeps it, manager takes it, or they agreed another split — in explicit ownership words. Merely asking for help, an open favor pull, or vague collaboration / jargon with no named owner = false. Weak ack alone = false.",
    "Obj4 (leadership conversation): Who will be present / represent for the leadership conversation was decided and acknowledged with a clear role split — manager joins/sits in as support, Claire goes alone, or another explicit split. Counts if Claire invites and the manager clearly accepts a role, OR the manager offers to join/sit in and Claire accepts. Claire only inviting followed by bare okay/yeah/sure/fine = false. Soft thanks/ack without naming who answers or who goes = false. Do NOT judge whether the decision was good.",
  ],
};

/**
 * Sam POST — maps to UI objectives:
 * 1 what happened with the client report
 * 2 what happens with the report before the client meeting EOW
 * 3 who fixes the mistakes
 * 4 who goes to the client meeting / walk-through
 */
const SAM_POST: JudgeCriteria = {
  criteria: [
    "Obj1 (what happened): The client-flagged report was explained in substance (what the client flagged — totals, contradictions, or the miss), AND the manager engaged with that substance (asked, acknowledged, or responded to it). Greeting / how-are-you / week small-talk alone = false. Sam naming the flag once with no manager engagement = false.",
    "Obj2 (before client again): A concrete next step for the corrected report before the client sees it again / before the end-of-week client meeting was expressed AND acknowledged by the other person — manager review first, timing, or order of work. Sam only saying he will fix tonight / send straight back to the client, with no manager ack of path/timing = false. Manager only refusing help with no plan settled = false. Bare okay/yeah/sure alone never settles this.",
    "Obj3 (who fixes the numbers): It is now clear who fixes the mistakes / totals before the report goes back, after any favor / take-the-numbers pull resolved — Sam keeps the fix, manager takes it, or they agreed another split — in explicit ownership words. Merely asking for help, an open favor pull, or vague collaboration / jargon with no named owner = false. Weak ack alone = false.",
    "Obj4 (client meeting): Who goes to the client-office walk-through / client meeting was decided and acknowledged with a clear role split — who leads/answers vs who only sits in, or Sam goes alone. Counts if Sam invites and the manager clearly accepts a role, OR the manager offers to join/sit in and Sam accepts. Sam only inviting followed by bare okay/yeah/sure/fine = false. Soft thanks/ack without naming who answers or who goes = false. Do NOT judge whether the decision was good.",
  ],
};

function criteriaForScene(sceneId: string): JudgeCriteria | null {
  const id = String(sceneId ?? "").toLowerCase();
  if (id.includes("jordan") || id.includes("claire")) return JORDAN_PRE;
  if (id.includes("sam")) return SAM_POST;
  return null;
}

/**
 * Judge instructions for one out-of-band response. Self-contained: at judge
 * time these replace the actor prompt, so all definitions must live here.
 *
 * OUTPUT SCHEMA (locked — do not change):
 * {"1":boolean,"2":boolean,"3":boolean,"4":boolean}
 */
export function coverageJudgeInstructions(sceneId: string): string | null {
  const config = criteriaForScene(sceneId);
  if (!config) return null;
  const lines = config.criteria.map((c, i) => `${i + 1}. ${c}`).join("\n");
  return [
    "You are silently auditing this workplace 1:1 for a training tool. Do not speak to anyone; produce data only.",
    "",
    "You track TOPIC COVERAGE only — whether each matter was settled in the conversation. You are NOT scoring quality, correctness, or managerial skill.",
    "For each item, answer true only if it has GENUINELY been resolved so far — both people engaged and the matter settled. A topic being mentioned once is NOT enough.",
    "A settled decision that is a poor managerial choice still counts as true for coverage.",
    "If you are not sure, answer false — you will see more of the conversation next time. Never guess true.",
    "Hard false cases (apply every time): greeting-only / PRE-A small-talk; bare okay/yeah/sure/fine with no substance; Sam/Claire volunteering a fix or send-back alone with no manager acknowledgment of the plan; an open help/favor ask with no ownership decision; vague collaboration jargon with no named owner of the fix/rewrite; a meeting/walk-through invite answered only with okay/yeah/sure/thanks (not an explicit who-goes / who-answers decision).",
    "",
    lines,
    "",
    'Output ONLY this JSON object, nothing else: {"1":boolean,"2":boolean,"3":boolean,"4":boolean}',
  ].join("\n");
}

/**
 * Parse the judge's text output into [obj1, obj2, obj3, obj4].
 * Returns null when the output is malformed — caller skips and waits
 * for the next turn's verdict.
 */
export function parseCoverageVerdict(text: string): boolean[] | null {
  const raw = String(text ?? "").trim();
  if (!raw) return null;
  const match = raw.match(/\{[^{}]*\}/);
  if (!match) return null;
  try {
    const obj = JSON.parse(match[0]) as Record<string, unknown>;
    const covered: boolean[] = [];
    for (let i = 1; i <= EXP7_COVERAGE_OBJECTIVE_COUNT; i++) {
      const v = obj[String(i)];
      if (typeof v !== "boolean") return null;
      covered.push(v);
    }
    return covered;
  } catch {
    return null;
  }
}
