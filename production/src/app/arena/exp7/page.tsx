import ArenaExp4Seed from "../exp4/ArenaExp4Seed";
import ArenaExp7Shell from "./ArenaExp7Shell";
import Exp7SkillPicker from "./Exp7SkillPicker";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Arena Exp 7 — Practice Simulation",
  robots: { index: false, follow: false },
};

export default function ArenaExp7Page() {
  return (
    <ArenaExp4Seed>
      <ArenaExp7Shell>
        <Exp7SkillPicker />
      </ArenaExp7Shell>
    </ArenaExp4Seed>
  );
}
