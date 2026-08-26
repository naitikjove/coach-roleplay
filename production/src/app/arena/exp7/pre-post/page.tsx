import ArenaExp4Seed from "../../exp4/ArenaExp4Seed";
import { loadExp7ChapterDataOrFallback } from "../loadExp7ChapterData";
import ArenaExp7PrePostClient from "./ArenaExp7PrePostClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Arena Exp 7 PRE/POST — MC1 Practice",
  robots: { index: false, follow: false },
};

/**
 * Entry point: coach chapter shell (NME MC1) + PRE/POST practice.
 * This is the surface learners open first — not a separate explore picker.
 */
export default async function ArenaExp7PrePostPage() {
  const payload = await loadExp7ChapterDataOrFallback();

  return (
    <ArenaExp4Seed>
      <ArenaExp7PrePostClient
        initialData={payload.initialData}
        microCourseOverviewData={payload.microCourseOverviewData}
        mobileUserAgentHint={payload.mobileUserAgentHint}
      />
    </ArenaExp4Seed>
  );
}
