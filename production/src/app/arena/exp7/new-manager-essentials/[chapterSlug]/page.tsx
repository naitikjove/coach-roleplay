import ArenaExp4Seed from "../../../exp4/ArenaExp4Seed";
import ArenaExp7Client from "../../ArenaExp7Client";
import { loadExp7ChapterDataOrFallback } from "../../loadExp7ChapterData";
import { EXP7_CHAPTER_SLUG } from "../../constants";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Arena Exp 7 — Boundaries with Former Peers",
  robots: { index: false, follow: false },
};

export default async function ArenaExp7ChapterPage({
  params,
}: {
  params: Promise<{ chapterSlug: string }>;
}) {
  const { chapterSlug } = await params;
  if (chapterSlug !== EXP7_CHAPTER_SLUG) {
    notFound();
  }

  const payload = await loadExp7ChapterDataOrFallback();

  return (
    <ArenaExp4Seed>
      <ArenaExp7Client
        initialData={payload.initialData}
        microCourseOverviewData={payload.microCourseOverviewData}
        mobileUserAgentHint={payload.mobileUserAgentHint}
      />
    </ArenaExp4Seed>
  );
}
