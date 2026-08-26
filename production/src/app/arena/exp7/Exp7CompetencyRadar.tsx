"use client";

import React, { useId, useMemo, useState } from "react";
import type { Exp7CompetencyScore } from "./exp7Types";
import styles from "./exp7PracticeCard.module.css";

type Exp7CompetencyRadarProps = {
  competencies: Exp7CompetencyScore[];
  className?: string;
};

function scoreValue(c: Exp7CompetencyScore): number {
  if (c.level === "not_observed" || c.score == null) return 0;
  return Math.min(10, Math.max(0, c.score)) / 10;
}

function slotForIndex(i: number, n: number): "top" | "right" | "bottom" | "left" {
  if (n === 4) {
    return (["top", "right", "bottom", "left"] as const)[i] || "top";
  }
  const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  if (Math.abs(cos) < 0.4) return sin < 0 ? "top" : "bottom";
  return cos > 0 ? "right" : "left";
}

function levelLabel(level: Exp7CompetencyScore["level"]): string {
  if (level === "strong") return "Strong";
  if (level === "adequate") return "Adequate";
  if (level === "needs_work") return "Needs work";
  return "Not observed";
}

function scoreLabel(c: Exp7CompetencyScore): string {
  if (c.level === "not_observed" || c.score == null) return "—";
  return `${c.score}/10`;
}

/**
 * Compact centered spider chart: skill name + score + info on each axis (no side cards).
 */
export default function Exp7CompetencyRadar({
  competencies,
  className,
}: Exp7CompetencyRadarProps) {
  const id = useId();
  const [openId, setOpenId] = useState<string | null>(null);
  const n = Array.isArray(competencies) ? competencies.length : 0;
  if (n < 3) return null;

  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const r = 72;

  const points = useMemo(() => {
    return competencies.map((c, i) => {
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
      const s = scoreValue(c);
      return {
        x: cx + r * s * Math.cos(angle),
        y: cy + r * s * Math.sin(angle),
        angle,
        slot: slotForIndex(i, n),
        c,
      };
    });
  }, [competencies, n, cx, cy, r]);

  const poly = points.map((p) => `${p.x},${p.y}`).join(" ");
  const rings = [0.25, 0.5, 0.75, 1];

  return (
    <figure
      className={[styles.radarWrap, className].filter(Boolean).join(" ")}
      aria-label="Skills snapshot radar chart"
    >
      <div className={styles.radarPlot}>
        <div className={styles.radarSvgWrap}>
          <svg
            className={styles.radarSvg}
            viewBox={`0 0 ${size} ${size}`}
            width={size}
            height={size}
            role="img"
          >
            <defs>
              <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#2183ed" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#2183ed" stopOpacity="0.12" />
              </linearGradient>
            </defs>

            {rings.map((frac) => (
              <polygon
                key={frac}
                className={styles.radarRing}
                points={Array.from({ length: n }, (_, i) => {
                  const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
                  return `${cx + r * frac * Math.cos(angle)},${cy + r * frac * Math.sin(angle)}`;
                }).join(" ")}
              />
            ))}

            {points.map((p, i) => (
              <line
                key={`axis-${i}`}
                className={styles.radarAxis}
                x1={cx}
                y1={cy}
                x2={cx + r * Math.cos(p.angle)}
                y2={cy + r * Math.sin(p.angle)}
              />
            ))}

            <polygon className={styles.radarPoly} points={poly} fill={`url(#${id}-fill)`} />

            {points.map((p, i) => (
              <circle
                key={`dot-${i}`}
                className={styles.radarDot}
                cx={p.x}
                cy={p.y}
                r={3.5}
              />
            ))}
          </svg>
        </div>

        {points.map((p) => {
          const isOpen = openId === p.c.id;
          const tip = [levelLabel(p.c.level), p.c.note?.trim()].filter(Boolean).join(" — ");
          return (
            <div
              key={p.c.id}
              className={`${styles.radarAxisLabel} ${styles[`radarLabel_${p.slot}`]}`}
            >
              <div className={styles.radarLabelMain}>
                <span className={styles.radarSkillName}>{p.c.name}</span>
                <button
                  type="button"
                  className={styles.radarInfoBtn}
                  aria-label={`${p.c.name}: ${tip}`}
                  aria-expanded={isOpen}
                  title={tip}
                  onClick={() => setOpenId(isOpen ? null : p.c.id)}
                  onBlur={() => setOpenId((cur) => (cur === p.c.id ? null : cur))}
                >
                  i
                </button>
              </div>
              <span
                className={`${styles.radarScore} ${styles[`radarScore_${p.c.level}`]}`}
              >
                {scoreLabel(p.c)}
              </span>
              {isOpen && tip ? (
                <div className={styles.radarTooltip} role="tooltip">
                  <strong>{levelLabel(p.c.level)}</strong>
                  {p.c.note?.trim() ? <p>{p.c.note.trim()}</p> : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      <figcaption className={styles.radarCaption}>
        Tap i for details. Edge = 10; not observed = 0.
      </figcaption>
    </figure>
  );
}
