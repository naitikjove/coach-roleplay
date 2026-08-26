/** Sample voices for Claire PRE (gpt-4o-mini-tts). Live S2S: gpt-realtime-2.1 + marin. */

export const JORDAN_SAMPLE_LINE =
  "Hey — weird first 1:1, right? Leadership sent the client deck back yesterday. Incomplete story, and the numbers didn't hold. We still need a recovery plan this week. How are you thinking about this?";

export const JORDAN_VOICE_SAMPLES = [
  {
    id: "coral",
    name: "Coral",
    tag: "Previous",
    feel: "Warm, slightly bright — the voice used on the 1:1 before Marin.",
  },
  {
    id: "sage",
    name: "Sage",
    tag: "Grounded",
    feel: "Calmer and more even. Less sparkle, more senior-IC.",
  },
  {
    id: "verse",
    name: "Verse",
    tag: "Conversational",
    feel: "Newer, closer to live speech. Candid without sounding theatrical.",
  },
  {
    id: "marin",
    name: "Marin",
    tag: "Current",
    feel: "OpenAI’s recommended quality voice — crisp, composed. Live Claire PRE now.",
  },
] as const;

export type JordanVoiceSampleId = (typeof JORDAN_VOICE_SAMPLES)[number]["id"];
