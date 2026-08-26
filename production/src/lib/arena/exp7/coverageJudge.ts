/**
 * Live objective-coverage judge — out-of-band responses on the existing
 * Realtime session. The judge instructions REPLACE the actor prompt for that
 * one hidden generation; the model reads the conversation it already holds
 * and returns four booleans. Stateless per call; the UI merges monotonically.
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
    "A concrete path or timing for the deck this week was expressed by either person and acknowledged by the other (e.g. when it moves, or who sees it before leadership).",
    "It is now clear who does the rewrite, after any back-and-forth about helping resolved. Merely asking for help does not count; the matter must have settled.",
    "Who will be present or represent the work in the leadership conversation was decided (not merely raised or offered).",
  ],
};

const SAM_POST: JudgeCriteria = {
  criteria: [
    "What happened with the flagged client report was explained, and the manager engaged with it (asked, acknowledged, or responded to the substance).",
    "Concrete next actions and timing for the corrected report were expressed and acknowledged.",
    "It is now clear who does the numbers rework, after any back-and-forth resolved. Merely asking for help does not count; the matter must have settled.",
    "How progress will be reviewed before the report is resubmitted was agreed (not merely raised).",
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
    "For each item below, answer true only if it has GENUINELY been resolved in the conversation so far — both people engaged and the matter moved. A topic being mentioned once is NOT enough.",
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
