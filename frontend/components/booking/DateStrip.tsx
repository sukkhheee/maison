"use client";

import { useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buildDateStrip, isSameDay, monthName, shortDayName } from "@/lib/data/slots";
import { cn } from "@/lib/utils";

interface Props {
  selected: Date;
  onSelect: (d: Date) => void;
  /** how many days ahead to render */
  days?: number;
}

export function DateStrip({ selected, onSelect, days = 14 }: Props) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const dates = useMemo(() => buildDateStrip(today, days), [today, days]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "l" | "r") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "l" ? -240 : 240, behavior: "smooth" });
  };

  return (
    <div>
      <div className="flex items-end justify-between mb-4">
        <div>
          <span className="eyebrow">— Өдөр сонгох</span>
          <p className="mt-1 font-serif text-2xl tracking-luxury-tight">
            {monthName(selected)}, {selected.getDate()}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => scroll("l")}
            className="h-9 w-9 grid place-items-center rounded-full border border-ink/15 hover:border-gold hover:text-gold-700 transition"
            aria-label="Previous days"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => scroll("r")}
            className="h-9 w-9 grid place-items-center rounded-full border border-ink/15 hover:border-gold hover:text-gold-700 transition"
            aria-label="Next days"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="no-scrollbar flex gap-2 overflow-x-auto snap-x pb-1"
      >
        {dates.map((d, i) => {
          const active = isSameDay(d, selected);
          const isToday = isSameDay(d, today);
          return (
            <motion.button
              key={d.toISOString()}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.02 }}
              onClick={() => onSelect(d)}
              className={cn(
                "snap-start shrink-0 w-16 sm:w-[72px] py-3 rounded-xl border text-center transition-all duration-300",
                active
                  ? "bg-ink text-bone border-ink shadow-soft"
                  : "bg-white border-ink/10 hover:border-gold/50 text-ink"
              )}
            >
              <p
                className={cn(
                  "text-[10px] uppercase tracking-luxury-wide",
                  active ? "text-gold-200" : "text-ink/40"
                )}
              >
                {shortDayName(d)}
              </p>
              <p
                className={cn(
                  "mt-1 font-serif text-2xl",
                  active ? "text-bone" : "text-ink"
                )}
              >
                {d.getDate()}
              </p>
              <p
                className={cn(
                  "text-[10px]",
                  active
                    ? "text-gold-200"
                    : isToday
                    ? "text-gold-700"
                    : "text-ink/30"
                )}
              >
                {isToday ? "Өнөөдөр" : monthName(d).split("-")[0] + " сар"}
              </p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
