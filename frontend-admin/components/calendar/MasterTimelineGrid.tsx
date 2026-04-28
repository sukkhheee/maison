"use client";

import { Star } from "lucide-react";
import { hueClasses, type AdminMaster } from "@/lib/data/masters";
import type { AdminBooking } from "@/lib/data/mockBookings";
import { cn } from "@/lib/utils";
import { BookingBlock } from "./BookingBlock";
import { NowIndicator } from "./NowIndicator";

const DAY_START_HOUR = 9;
const DAY_END_HOUR = 21;
const SLOT_HEIGHT_PX = 56;

interface Props {
  bookings: AdminBooking[];
  masters: AdminMaster[];
  date: Date;
}

export function MasterTimelineGrid({ bookings, masters, date }: Props) {
  const dayStartMin = DAY_START_HOUR * 60;
  const dayEndMin = DAY_END_HOUR * 60;

  // 30-minute slots between dayStart and dayEnd inclusive of both ends.
  const slotCount = (DAY_END_HOUR - DAY_START_HOUR) * 2;
  const timeLabels = Array.from({ length: slotCount + 1 }, (_, i) => {
    const totalMin = dayStartMin + i * 30;
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  });

  const totalGridHeight = slotCount * SLOT_HEIGHT_PX;

  return (
    <div className="card overflow-hidden">
      <div className="overflow-auto max-h-[calc(100vh-220px)]">
        <div
          className="calendar-grid relative grid"
          style={{
            gridTemplateColumns: `var(--time-w) repeat(${masters.length}, minmax(190px, 1fr))`
          }}
        >
          {/* === Header row === */}
          <div className="sticky top-0 left-0 z-30 bg-surface border-b border-r border-border h-[68px]" />
          {masters.map((m) => {
            const hue = hueClasses[m.hue];
            return (
              <div
                key={m.id}
                className="sticky top-0 z-20 bg-surface border-b border-r border-border last:border-r-0 h-[68px] px-3 flex items-center gap-3"
              >
                <div
                  className={cn(
                    "h-9 w-9 shrink-0 rounded-full grid place-items-center text-xs font-semibold ring-2 ring-offset-2 ring-offset-surface",
                    hue.bg,
                    hue.text,
                    hue.ring
                  )}
                >
                  {m.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">{m.name}</p>
                  <p className="text-[11px] text-fg-muted truncate flex items-center gap-1">
                    <Star size={10} fill="currentColor" className="text-accent" />
                    <span className="tabular-nums">{m.rating.toFixed(2)}</span>
                    <span className="text-fg-muted/60">·</span>
                    <span className="truncate">{m.title}</span>
                  </p>
                </div>
              </div>
            );
          })}

          {/* === Body: time labels column + staff columns === */}

          {/* Time column (sticky left) */}
          <div
            className="sticky left-0 z-10 bg-surface border-r border-border"
            style={{ height: totalGridHeight }}
          >
            {timeLabels.slice(0, -1).map((t, i) => (
              <div
                key={t}
                className="text-[11px] tabular-nums text-fg-muted px-2 pt-1"
                style={{ height: SLOT_HEIGHT_PX }}
              >
                {/* Skip rendering at half-hour marks for cleanliness */}
                {i % 2 === 0 ? t : <span className="opacity-40">{t}</span>}
              </div>
            ))}
          </div>

          {/* Staff columns */}
          {masters.map((m) => {
            const staffBookings = bookings.filter((b) => b.staffId === m.id);
            return (
              <div
                key={m.id}
                className="relative border-r border-border last:border-r-0"
                style={{ height: totalGridHeight }}
              >
                {/* Slot background grid (hover-able cells) */}
                {Array.from({ length: slotCount }).map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "border-b border-border/60 hover:bg-accent-soft/40 transition-colors cursor-pointer",
                      // Heavier border every full hour
                      i % 2 === 1 && "border-b-border"
                    )}
                    style={{ height: SLOT_HEIGHT_PX }}
                  />
                ))}

                {/* Bookings overlay */}
                {staffBookings.map((b) => (
                  <BookingBlock
                    key={b.id}
                    booking={b}
                    master={m}
                    dayStartMin={dayStartMin}
                    slotPx={SLOT_HEIGHT_PX}
                  />
                ))}
              </div>
            );
          })}

          {/* Now indicator — rendered as an absolute child of the body wrapper.
              It needs to span all staff columns starting after the time column. */}
          <div
            className="absolute pointer-events-none"
            style={{
              top: 68,
              left: "var(--time-w)",
              right: 0,
              height: totalGridHeight
            }}
          >
            <NowIndicator
              dayStartMin={dayStartMin}
              dayEndMin={dayEndMin}
              slotPx={SLOT_HEIGHT_PX}
              date={date}
            />
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="border-t border-border px-4 py-3 flex flex-wrap items-center gap-4 text-[11px] text-fg-muted">
        <LegendDot color="bg-emerald-500" label="Баталгаажсан" />
        <LegendDot color="bg-amber-500" label="Хүлээгдэж буй" />
        <LegendDot color="bg-rose-500" label="Цуцлагдсан" />
        <LegendDot color="bg-zinc-400" label="Дууссан" />
        <span className="ml-auto">
          Хоосон нүдийг товшиж шинэ захиалга үүсгэх боломжтой
        </span>
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("h-2 w-2 rounded-full", color)} />
      {label}
    </span>
  );
}
