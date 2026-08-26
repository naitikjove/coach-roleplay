import type { Exp7SessionState, TranscriptEntry } from "@/lib/arena/exp7/sessionStore";

function lastEntry(transcript: TranscriptEntry[], role: TranscriptEntry["role"]) {
  for (let i = transcript.length - 1; i >= 0; i -= 1) {
    if (transcript[i]?.role === role) return transcript[i];
  }
  return undefined;
}

/** Resolve character speaker id from scene (do not hardcode Alex). */
export function characterSpeakerIdForScene(sceneId?: string): string {
  const id = String(sceneId ?? "").toLowerCase();
  if (id.includes("jordan")) return "jordan";
  if (id.includes("sam")) return "sam";
  return "alex";
}

/** Idempotent — skips lines already present (client optimistic sync). */
export function applyTurnIfMissing(
  session: Exp7SessionState,
  learnerText: string,
  characterText: string,
): Exp7SessionState {
  const learner = learnerText.trim();
  const character = characterText.trim();
  const transcript = [...session.transcript];
  const movesLedger = [...session.movesLedger];
  const speakerId = characterSpeakerIdForScene(session.sceneId);

  if (character && !learner) {
    const tail = transcript[transcript.length - 1];
    if (!(tail?.role === "character" && tail.text === character)) {
      transcript.push({ role: "character", text: character, speakerId });
    }
  } else if (learner && !character) {
    const tail = transcript[transcript.length - 1];
    if (!(tail?.role === "learner" && tail.text === learner)) {
      transcript.push({ role: "learner", text: learner });
      movesLedger.push({ turn: movesLedger.length + 1, learner_quote: learner });
    }
  } else if (learner && character) {
    const lastLearner = lastEntry(transcript, "learner");
    const pairAtEnd =
      transcript.length >= 2 &&
      transcript[transcript.length - 2]?.role === "learner" &&
      transcript[transcript.length - 2]?.text === learner &&
      transcript[transcript.length - 1]?.role === "character" &&
      transcript[transcript.length - 1]?.text === character;

    if (!pairAtEnd) {
      if (!(lastLearner?.text === learner)) {
        transcript.push({ role: "learner", text: learner });
        movesLedger.push({ turn: movesLedger.length + 1, learner_quote: learner });
      }
      const tail = transcript[transcript.length - 1];
      if (!(tail?.role === "character" && tail.text === character)) {
        transcript.push({ role: "character", text: character, speakerId });
      }
    }
  }

  return {
    ...session,
    transcript,
    movesLedger,
  };
}
