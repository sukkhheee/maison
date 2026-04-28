"use client";

import { useEffect, useState } from "react";

interface Props {
  /** Day-start in minutes (e.g. 9*60). */
  dayStartMin: number;
  /** Day-end in minutes (e.g. 21*60). */
  dayEndMin: number;
  /** Pixel height of one 30-minute slot. */
  slotPx: number;
  /** Calendar date being shown — only renders when date is today. */
  date: Date;
}

/**
 * Horizontal red line marking the current time across all staff columns.
 * Re-positions every 60 seconds. Hidden when the visible day isn't today
 * or when the current time is outside business hours.
 */
export function NowIndicator({ dayStartMin, dayEndMin, slotPx, date }: Props) {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const today = new Date();
  const isToday =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();
  if (!isToday) return null;

  const nowMin = now.getHours() * 60 + now.getMinutes();
  if (nowMin < dayStartMin || nowMin > dayEndMin) return null;

  const top = ((nowMin - dayStartMin) / 30) * slotPx;
  const label = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  return (
    <div
      className="pointer-events-none absolute left-0 right-0 z-20"
      style={{ top }}
    >
      <div className="relative h-0">
        <span className="absolute -left-1.5 -top-1.5 h-3 w-3 rounded-full bg-danger ring-4 ring-danger/20" />
        <div className="border-t border-danger" />
        <span className="absolute -top-2.5 left-3 text-[10px] font-bold text-danger tabular-nums bg-bg px-1 rounded">
          {label}
        </span>
      </div>
    </div>
  );
}
