import { Link } from "react-router-dom";
import MockCoachShell from "../shell/MockCoachShell";
import { EXP7_PRE } from "../data/content";

const LINE =
  "Hey — weird first 1:1, right? Leadership sent the client deck back yesterday. Incomplete story, and the numbers didn't hold. We still need a recovery plan this week. How are you thinking about this?";

const SAMPLES = [
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
];

/**
 * Sample variant — same four voices as the live PRE/POST voices page.
 * Prefers baked MP3s in /voices; falls back to live TTS on the Vercel demo.
 */
export default function VoiceSamplesPage() {
  return (
    <MockCoachShell mode="session">
      <div className="chapterFrame">
        <p className="type-overline">Sample variant</p>
        <h1 className="pageTitle" style={{ marginTop: 8 }}>
          Claire voice samples
        </h1>
        <p className="voiceSampleLead">
          Same opening line, four Realtime voices. Pick the one that sounds like a senior IC
          in a tense first 1:1. Current live 1:1 uses <strong>Marin</strong>.
        </p>
        <p className="voiceSampleLine">&ldquo;{LINE}&rdquo;</p>
        <ul className="voiceSampleGrid">
          {SAMPLES.map((sample) => (
            <li key={sample.id} className="voiceSampleCard">
              <div className="voiceSampleHead">
                <span className="voiceSampleName">{sample.name}</span>
                <span className="voiceSampleTag">{sample.tag}</span>
              </div>
              <p className="voiceSampleFeel">{sample.feel}</p>
              <audio className="voiceSampleAudio" controls preload="none" src={`/voices/${sample.id}.mp3`}>
                <track kind="captions" />
              </audio>
            </li>
          ))}
        </ul>
        <p className="voiceSampleFoot">
          {EXP7_PRE.characterName} · {EXP7_PRE.characterRole}.{" "}
          <Link to="/arena/exp7/pre-post">Back to entry</Link>
        </p>
      </div>
    </MockCoachShell>
  );
}
