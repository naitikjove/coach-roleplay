import ArenaExp4Seed from "../../../exp4/ArenaExp4Seed";
import ArenaExp7Shell from "../../ArenaExp7Shell";
import JordanVoiceSamplesClient from "../JordanVoiceSamplesClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Claire voice samples",
  robots: { index: false, follow: false },
};

/** Sample variant — compare Realtime voices for Jordan (PRE). */
export default function JordanVoiceSamplesPage() {
  return (
    <ArenaExp4Seed>
      <ArenaExp7Shell>
        <JordanVoiceSamplesClient />
      </ArenaExp7Shell>
    </ArenaExp4Seed>
  );
}
