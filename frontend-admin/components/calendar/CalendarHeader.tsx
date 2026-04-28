"use client";

import { ChevronLeft, ChevronRight, CalendarDays, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const dayNames = ["Ня", "Да", "Мя", "Лх", "Пү", "Ба", "Бя"];
const monthNames = [
  "1-р сар", "2-р сар", "3-р сар", "4-р сар", "5-р сар", "6-р сар",
  "7-р сар", "8-р сар", "9-р сар", "10-р сар", "11-р сар", "12-р сар"
];

interface Props {
  date: Date;
  onChange: (d: Date) => void;
  bookingCount: number;
  totalRevenue: number;
}

export function CalendarHeader({ date, onChange, bookingCount, totalRevenue }: Props) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isToday =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();

  const shift = (days: number) => {
    const next = new Date(date);
    next.setDate(date.getDate() + days);
    onChange(next);
  };

  return (
    <div className="card p-4 flex flex-wrap items-center gap-3">
      {/* Date navigator */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => shift(-1)}
          className="h-9 w-9 grid place-items-center rounded-md border border-border hover:bg-surface-2 transition"
          aria-label="Өмнөх өдөр"
        >
          <ChevronLeft size={16} />
        </button>

        <button
          onClick={() => onChange(today)}
          className={cn(
            "h-9 px-4 rounded-md border text-sm flex items-center gap-2",
            isToday
              ? "bg-fg text-bg border-fg"
              : "border-border hover:bg-surface-2"
          )}
        >
          <CalendarDays size={14} />
          Өнөөдөр
        </button>

        <button
          onClick={() => shift(1)}
          className="h-9 w-9 grid place-items-center rounded-md border border-border hover:bg-surface-2 transition"
          aria-label="Дараа өдөр"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Date label */}
      <div className="border-l border-border pl-4">
        <p className="text-[11px] uppercase tracking-wider text-fg-muted">
          {dayNames[date.getDay()]} · {date.getFullYear()}
        </p>
        <p className="font-serif text-xl tracking-tight">
          {monthNames[date.getMonth()]}, {date.getDate()}
        </p>
      </div>

      <div className="flex-1" />

      {/* KPIs */}
      <div className="hidden md:flex items-center gap-2 text-xs">
        <Stat label="Захиалга" value={String(bookingCount)} />
        <Stat label="Орлого" value={`${(totalRevenue / 1000).toFixed(0)}K₮`} />
      </div>

      <Button variant="outline" size="sm">
        <Filter size={14} />
        Шүүлтүүр
      </Button>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-3 py-1.5 rounded-md bg-surface-2 border border-border">
      <span className="text-fg-muted">{label}: </span>
      <strong className="font-semibold tabular-nums">{value}</strong>
    </div>
  );
}
