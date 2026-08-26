import EntryCard from "../components/EntryCard";
import {
  EXP7_MICROCOURSE_TITLE,
  EXP7_PRE_POST_SUBJECT_TITLE,
} from "../data/content";
import MockCoachShell from "../shell/MockCoachShell";

/**
 * Mirrors /arena/exp7/pre-post
 * Production: ArenaExp7PrePostClient embeds PrePostEntryCard in chapterCardSlot
 * inside MicroCourseChapterVideosClient.
 */
export default function EntryPage() {
  return (
    <MockCoachShell mode="entry">
      <div className="chapterFrame">
        <header className="chapterHeader">
          <h1>{EXP7_MICROCOURSE_TITLE}</h1>
          <p>
            {EXP7_PRE_POST_SUBJECT_TITLE} chapter shell. The PRE meta card sits in the
            chapter card slot above the video list (videos mocked below).
          </p>
        </header>

        <EntryCard />

        <div className="videoStrip" aria-hidden>
          <div className="videoThumb">Video 1 (mock)</div>
          <div className="videoThumb">Video 2 (mock)</div>
          <div className="videoThumb">Video 3 (mock)</div>
        </div>
      </div>
    </MockCoachShell>
  );
}
