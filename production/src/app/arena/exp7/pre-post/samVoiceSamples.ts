/** Temp Sam voice A/B — same Realtime voice IDs as live POST (gpt-realtime-2.1). Preview via gpt-4o-mini-tts. */

export const SAM_SAMPLE_LINE =
  "Hey, good to connect. I’m glad this slot worked out. How are you holding up this week?";

export const SAM_TTS_INSTRUCTIONS =
  "You are Sam, a former peer and work friend talking to your new manager in a first 1:1 after a client flagged your report. Informal, a bit shaken but not collapsing. Short conversational sentences. Sound like a real coworker, not a narrator, actor, or coach. Natural pacing; slight tightness around the client miss.";

/** Candidates for Sam live voice. Cedar = current default. */
export const SAM_VOICE_SAMPLES = [
  {
    id: "cedar",
    name: "Cedar",
    tag: "Current",
    feel: "Live Sam today. Baseline for comparison.",
  },
  {
    id: "ash",
    name: "Ash",
    tag: "Steady",
    feel: "Deeper, steadier — same family as Alex.",
  },
  {
    id: "echo",
    name: "Echo",
    tag: "Clear",
    feel: "Clearer, more neutral. Less soft than Cedar.",
  },
  {
    id: "verse",
    name: "Verse",
    tag: "Conversational",
    feel: "Warmer live-speech feel. Candid coworker.",
  },
  {
    id: "ballad",
    name: "Ballad",
    tag: "Soft",
    feel: "Softer edge after the client flag.",
  },
  {
    id: "sage",
    name: "Sage",
    tag: "Grounded",
    feel: "Calmer, even — more senior-IC than rattled peer.",
  },
] as const;

export type SamVoiceSampleId = (typeof SAM_VOICE_SAMPLES)[number]["id"];
