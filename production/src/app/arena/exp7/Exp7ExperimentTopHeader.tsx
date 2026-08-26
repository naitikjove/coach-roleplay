"use client";

import React from "react";
import Logo from "@/Assets/CoachExplore/Logo/ColorLogo.svg";
import ChevronDown from "@/Assets/Icons/lucide/chevron-down.svg";
import styles from "./Exp7ExperimentTopHeader.module.css";

const HEADER_LINKS = [
  { key: "practice-simulation", label: "Practice Simulation", active: true },
  { key: "microcourse", label: "Micro-courses", hasChevron: true, active: false },
  { key: "business", label: "For Businesses", active: false },
] as const;

/** Production-style top header — only Practice Simulation is selected; other links are inert. */
export default function Exp7ExperimentTopHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <div className={styles.logo} aria-hidden>
          <img src={Logo} alt="" height={30} />
        </div>
        <nav className={styles.nav} aria-label="Primary">
          {HEADER_LINKS.map((link) => (
            <span
              key={link.key}
              className={`${styles.navLink} ${link.active ? styles.navLinkActive : styles.navLinkMuted}`}
              aria-current={link.active ? "page" : undefined}
            >
              {link.label}
              {"hasChevron" in link && link.hasChevron ? (
                <img src={ChevronDown} alt="" className={styles.chevron} aria-hidden />
              ) : null}
            </span>
          ))}
        </nav>
      </div>
    </header>
  );
}
