"use client";

import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type StatAccent = "emerald" | "indigo" | "amber" | "rose" | "violet";

const accentMap: Record<
  StatAccent,
  { bg: string; text: string; stroke: string; gradient: string }
> = {
  emerald: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    stroke: "#10b981",
    gradient: "url(#sparkline-emerald)"
  },
  indigo: {
    bg: "bg-indigo-500/10",
    text: "text-indigo-600 dark:text-indigo-400",
    stroke: "#6366f1",
    gradient: "url(#sparkline-indigo)"
  },
  amber: {
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    stroke: "#f59e0b",
    gradient: "url(#sparkline-amber)"
  },
  rose: {
    bg: "bg-rose-500/10",
    text: "text-rose-600 dark:text-rose-400",
    stroke: "#f43f5e",
    gradient: "url(#sparkline-rose)"
  },
  violet: {
    bg: "bg-violet-500/10",
    text: "text-violet-600 dark:text-violet-400",
    stroke: "#8b5cf6",
    gradient: "url(#sparkline-violet)"
  }
};

interface Props {
  icon: LucideIcon;
  label: string;
  value: string;
  change: { percent: number; positive: boolean; vs: string };
  trend: number[];
  accent: StatAccent;
  delay?: number;
}

export function StatsCard({
  icon: Icon,
  label,
  value,
  change,
  trend,
  accent,
  delay = 0
}: Props) {
  const a = accentMap[accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="card p-5 relative overflow-hidden hover:border-accent/40 transition-colors"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-fg-muted uppercase tracking-wider">{label}</p>
          <p className="font-serif text-3xl tracking-tight mt-2 tabular-nums">
            {value}
          </p>
        </div>
        <span
          className={cn(
            "h-10 w-10 shrink-0 rounded-md grid place-items-center",
            a.bg,
            a.text
          )}
        >
          <Icon size={18} />
        </span>
      </div>

      {/* Footer: change + sparkline */}
      <div className="mt-5 flex items-end justify-between gap-3">
        <div
          className={cn(
            "inline-flex items-center gap-1 text-xs font-medium",
            change.positive
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-rose-600 dark:text-rose-400"
          )}
        >
          {change.positive ? (
            <ArrowUpRight size={14} />
          ) : (
            <ArrowDownRight size={14} />
          )}
          <span className="tabular-nums">
            {change.positive ? "+" : "−"}
            {change.percent}%
          </span>
          <span className="text-fg-muted font-normal">· {change.vs}</span>
        </div>

        <Sparkline trend={trend} stroke={a.stroke} accent={accent} />
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */

function Sparkline({
  trend,
  stroke,
  accent
}: {
  trend: number[];
  stroke: string;
  accent: StatAccent;
}) {
  const max = Math.max(...trend);
  const min = Math.min(...trend);
  const range = max - min || 1;
  const w = 90;
  const h = 32;
  const stepX = w / (trend.length - 1);
  const pts = trend.map((v, i) => {
    const x = i * stepX;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return [x, y] as const;
  });
  const linePath = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ");
  const areaPath = `${linePath} L ${w} ${h} L 0 ${h} Z`;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0">
      <defs>
        <linearGradient id={`sparkline-${accent}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.35" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#sparkline-${accent})`} />
      <path d={linePath} fill="none" stroke={stroke} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      {/* Last point */}
      <circle
        cx={pts[pts.length - 1][0]}
        cy={pts[pts.length - 1][1]}
        r="2.5"
        fill={stroke}
      />
    </svg>
  );
}
