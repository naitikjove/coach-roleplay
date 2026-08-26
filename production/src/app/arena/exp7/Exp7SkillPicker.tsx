"use client";

import React, { useMemo } from "react";
import exploreStyles from "@/app/microcourse/Explore.module.css";
import TopNavPanel from "@/components/TopNavPanel";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import Exp7DesktopNavPanel from "./Exp7DesktopNavPanel";
import Exp7ExperimentTopHeader from "./Exp7ExperimentTopHeader";
import Exp7WorkSkillsCard from "./Exp7WorkSkillsCard";

/** Match ExploreClient column count so a single category card is ~1/4 width on desktop. */
function useExploreColumnCount() {
  const isTabletScreen = useMediaQuery("(width >= 768px) and (width < 1280px)");
  const isMobileScreen = useMediaQuery("(width < 768px)");

  return useMemo(() => {
    if (isMobileScreen) return 1;
    if (isTabletScreen) return 2;
    return 4;
  }, [isMobileScreen, isTabletScreen]);
}

export default function Exp7SkillPicker() {
  const isTabletScreen = useMediaQuery("(width >= 768px) and (width < 1280px)");
  const isMobileScreen = useMediaQuery("(width < 768px)");
  const useCompactNav = isMobileScreen || isTabletScreen;
  const columnCount = useExploreColumnCount();

  return (
    <>
      <Exp7ExperimentTopHeader />
      <div className={exploreStyles.wrapper}>
        {useCompactNav ? (
          <TopNavPanel
            className="nav-top-header"
            title="Practice Simulation"
            showBackArrow={false}
            backAction={() => {}}
            searchOpenDefault={false}
          />
        ) : (
          <Exp7DesktopNavPanel title="Practice Simulation" />
        )}

        <section className={exploreStyles.contentWrapper}>
          <div className={exploreStyles.categoriesGrid}>
            {Array.from({ length: columnCount }, (_, index) => (
              <div key={index} className="column">
                {index === 0 ? <Exp7WorkSkillsCard /> : null}
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
