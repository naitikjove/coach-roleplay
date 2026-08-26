import { redirect } from "next/navigation";
import { EXP7_PRE_POST_HREF } from "../../constants";

export const dynamic = "force-dynamic";

/**
 * Nested slug URLs redirect to the single entry: /arena/exp7/pre-post
 */
export default function ArenaExp7PrePostChapterRedirect() {
  redirect(EXP7_PRE_POST_HREF);
}
