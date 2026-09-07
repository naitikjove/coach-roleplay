import ArenaExp4Seed from "../../../exp4/ArenaExp4Seed";
import PrePostSessionClient from "../PrePostSessionClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "1:1 — Conversation",
  robots: { index: false, follow: false },
};

/**
 * Full-view PRE/POST brief + live voice.
 * PRE: /arena/exp7/pre-post/session
 * POST: /arena/exp7/pre-post/session?phase=post
 * Entry meta lives at /arena/exp7/pre-post.
 */
export default async function ArenaExp7PrePostSessionPage({
  searchParams,
}: {
  searchParams: Promise<{ phase?: string; view?: string }>;
}) {
  const { phase, view } = await searchParams;
  return (
    <ArenaExp4Seed>
      <PrePostSessionClient
        phase={phase === "post" ? "post" : "pre"}
        viewLast={view === "last"}
      />
    </ArenaExp4Seed>
  );
}
