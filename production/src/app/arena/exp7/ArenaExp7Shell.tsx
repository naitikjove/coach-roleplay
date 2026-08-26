"use client";

import React, { useCallback } from "react";
import SidebarLayout from "@/components/SidebarLayout";

type ArenaExp7ShellProps = {
  children: React.ReactNode;
};

/** Production sidebar shell for Exp 7 — blocks standard nav on practice routes. */
export default function ArenaExp7Shell({ children }: ArenaExp7ShellProps) {
  const blockNavigation = useCallback(() => {}, []);

  return (
    <SidebarLayout
      loading={false}
      setLoading={() => {}}
      skipAuthModals
      forceDesktopLayout
      onNavigateAttempt={blockNavigation}
      initialSegment="microcourse"
    >
      {children}
    </SidebarLayout>
  );
}
