"use client";

import React from "react";
import { PAGE_CATEGORY } from "@/utils/constant";
import MicroCourseChapterVideosClient from "@/app/microcourse/MicroCourseChapterVideosClient";
import {
  EXP7_CHAPTER_SLUG,
  EXP7_SUBJECT_SLUG,
  type Exp7ChapterPayload,
} from "../constants";
import PrePostEntryCard from "./PrePostEntryCard";

type ArenaExp7PrePostClientProps = Exp7ChapterPayload;

/**
 * Entry: platform chapter shell + meta card only.
 * Details + voice live at /arena/exp7/pre-post/session.
 */
export default function ArenaExp7PrePostClient({
  initialData,
  microCourseOverviewData,
  mobileUserAgentHint,
}: ArenaExp7PrePostClientProps) {
  return (
    <MicroCourseChapterVideosClient
      initialData={initialData}
      microCourseOverviewData={microCourseOverviewData}
      mobileUserAgentHint={mobileUserAgentHint}
      pageCategory={PAGE_CATEGORY.MICROCOURSE_CHAPTER_PAGE}
      displayOnly
      experimentSlugs={{
        subjectSlug: initialData?.subjectSlug ?? EXP7_SUBJECT_SLUG,
        chapterSlug: initialData?.chapterSlug ?? EXP7_CHAPTER_SLUG,
      }}
      chapterCardSlot={<PrePostEntryCard />}
      hideChapterCard
      hideLibraryList={false}
    />
  );
}
