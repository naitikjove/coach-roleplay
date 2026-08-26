"use client";

import React from "react";
import exploreStyles from "@/app/microcourse/Explore.module.css";

type Exp7DesktopNavPanelProps = {
  title: string;
  subTitle?: string;
};

/** Same structure as ExploreClient DesktopNavPanel — page title band for Practice Simulation. */
export default function Exp7DesktopNavPanel({ title, subTitle }: Exp7DesktopNavPanelProps) {
  return (
    <header
      className={exploreStyles.navHeader}
      style={{ alignItems: subTitle ? "flex-start" : "center" }}
    >
      <div style={{ flex: 1 }}>
        <h1
          className={exploreStyles.navHeaderTitle}
          style={{ fontSize: "24px", fontFamily: "Inter" }}
        >
          {title}
        </h1>
        {subTitle ? <p className={exploreStyles.navHeaderLead}>{subTitle}</p> : null}
      </div>
    </header>
  );
}
