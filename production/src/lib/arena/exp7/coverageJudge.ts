/**
 * Live objective-coverage judge — out-of-band responses on the existing
 * Realtime session. The judge instructions REPLACE the actor prompt for that
 * one hidden generation; the model reads the conversation it already holds
 * and returns four booleans. Stateless per call; the UI merges monotonically.
 *
 * Coverage ≠ quality. true = the topic was settled in-conversation.
 * Whether the manager handled it well is scored later by the analyzer.
 */

export const EXP7_COVERAGE_TOPIC = "exp7_coverage";

export const EXP7_COVERAGE_OBJECTIVE_COUNT = 4;

type JudgeCriteria = {
  /** Numbered, judge-facing resolution criteria (not learner-facing copy). */
  criteria: [string, string, string, string];
};

const JORDAN_PRE: JudgeCriteria = {
  criteria: [
    "What happened with the rejected client presentation was explained, and the manager engaged with it (asked, acknowledged, or responded to the substance).",
    "What needs to happen with the deck this week (path, review, or timing) was expressed and acknowledged by the other person — not merely that work is due. Claire only volunteering \"I'll fix/rewrite it\" without a path/timing ack does NOT count. Manager only refusing help does NOT count.",
    "It is now clear who does the rewrite, after any back-and-forth about helping resolved. Merely asking for help does not count; the matter must have settled (either Claire owns it, or they agreed another split).",
    "Who will represent / be present for the leadership conversation was decided and acknowledged — including if the manager joins, sits in, or Claire goes alone. Merely raising or offering the idea without a clear decision does NOT count. Do NOT judge whether the decision was good.",
  ],
};

const SAM_POST: JudgeCriteria = {
  criteria: [
    "What happened after the client flagged the report was explained, and the manager engaged with it (asked, acknowledged, or responded to the substance).",
    "What needs to happen before the corrected report goes back to the client (path, review, or timing) was expressed and acknowledged by the other person — not merely that it is due. Sam only volunteering \"I'll fix/send it\" without a path/timing ack does NOT count. Manager only refusing help does NOT count.",
    "It is now clear who fixes the numbers before the report goes back, after any back-and-forth about helping resolved. Merely asking for help does not count; the matter must have settled (either Sam owns it, or they agreed another split).",
    "Who handles the conversation when the report returns to the client was decided and acknowledged — including if the manager joins, loops in, or Sam goes alone. Merely raising or offering the idea without a clear decision does NOT count. Do NOT judge whether the decision was good.",
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
