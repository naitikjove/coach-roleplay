"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import exploreStyles from "@/app/microcourse/Explore.module.css";
import LockIcon from "@/Assets/sidebar icons/LockIconDark.svg";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { EXP7_WORK_SKILLS } from "./constants";

const CATEGORY_NAME = "Work skills";

/** Pixel match to ExploreClient CardItem — Work skills category with NME + ICE subjects. */
export default function Exp7WorkSkillsCard() {
  const router = useRouter();
  const isMobileScreen = useMediaQuery("(width < 768px)");
  const [cardOpen, setCardOpen] = useState(true);

  useEffect(() => {
    if (!isMobileScreen) setCardOpen(true);
    else setCardOpen(false);
  }, [isMobileScreen]);

  const toggleCard = () => {
    if (isMobileScreen) setCardOpen((prev) => !prev);
  };

  return (
    <div className={`${exploreStyles.card} ${cardOpen ? exploreStyles.cardOpen : ""}`}>
      <div className={exploreStyles.cardTitle} onClick={toggleCard}>
        <h2
          style={{
            fontSize: "20px",
            fontFamily: "Inter",
            cursor: "pointer",
            margin: 0,
          }}
        >
          {CATEGORY_NAME}
        </h2>
        <span className={exploreStyles.cardHandle} />
      </div>

      <ul className={exploreStyles.cardList}>
        {EXP7_WORK_SKILLS.map((skill) => {
          const locked = Boolean(skill.locked);
          return (
            <li
              key={skill.id}
              className={exploreStyles.cardListItem}
              style={
                locked
                  ? {
                      opacity: 0.55,
                      cursor: "not-allowed",
                      position: "relative",
                    }
                  : undefined
              }
              onClick={() => {
                if (locked || !skill.href) return;
                router.push(skill.href);
              }}
            >
              <a
                href={locked ? undefined : skill.href}
                onClick={(e) => e.preventDefault()}
                style={{
                  fontSize: "16px",
                  fontFamily: "Inter",
                  cursor: locked ? "not-allowed" : "pointer",
                  margin: 0,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                }}
                aria-disabled={locked || undefined}
              >
                {skill.title}
                {locked ? (
                  <img src={LockIcon} alt="" width={14} height={14} aria-hidden />
                ) : null}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
