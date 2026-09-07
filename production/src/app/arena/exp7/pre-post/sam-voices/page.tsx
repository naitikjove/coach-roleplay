import SamVoiceSamplesClient from "../SamVoiceSamplesClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Sam voice samples (temp)",
  robots: { index: false, follow: false },
};

/** Temp bare page — no sidebar shell (avoids client crash while A/B’ing voices). */
export default function SamVoiceSamplesPage() {
  return <SamVoiceSamplesClient />;
}
