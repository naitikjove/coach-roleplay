"use client";

import React, { useCallback, useState } from "react";
import { PAGE_CATEGORY } from "@/utils/constant";
import MicroCourseChapterVideosClient from "@/app/microcourse/MicroCourseChapterVideosClient";
import Exp7PracticePanel from "./Exp7PracticePanel";
import {
  EXP7_JORDAN_SCENE,
  EXP7_SCENE,
  EXP7_SIDEBAR_NAV,
  EXP7_SUBJECT_SLUG,
  EXP7_CHAPTER_SLUG,
} from "./constants";
import styles from "./exp7PracticeCard.module.css";

type ArenaExp7ClientProps = {
  initialData: any;
  microCourseOverviewData: any;
  mobileUserAgentHint: boolean;
};

export default function ArenaExp7Client({
  initialData,
  microCourseOverviewData,
  mobileUserAgentHint,
}: ArenaExp7ClientProps) {
  const [alexBusy, setAlexBusy] = useState(false);
  const [jordanBusy, setJordanBusy] = useState(false);

  const onAlexBusy = useCallback((busy: boolean) => setAlexBusy(busy), []);
  const onJordanBusy = useCallback((busy: boolean) => setJordanBusy(busy), []);

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
      chapterCardSlot={
        <div className={styles.practiceStack}>
          <Exp7PracticePanel
            scene={EXP7_SCENE}
            disabled={jordanBusy}
            onBusyChange={onAlexBusy}
          />
          <Exp7PracticePanel
            scene={EXP7_JORDAN_SCENE}
            disabled={alexBusy}
            onBusyChange={onJordanBusy}
          />
        </div>
      }
      hideLibraryList
      hideChapterCard
      sidebarExperimentNav={EXP7_SIDEBAR_NAV}
    />
  );
}
