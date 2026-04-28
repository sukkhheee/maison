"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MasterSelector } from "./MasterSelector";
import { DateStrip } from "./DateStrip";
import { TimeSlots } from "./TimeSlots";
import { type Master } from "@/lib/data/masters";
import type { ServiceItem } from "@/lib/data/services";
import { fetchMasters } from "@/lib/api/catalog";
import { cn, formatDuration, formatMnt } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface Props {
  selectedServices: ServiceItem[];
  master: Master | null;
  date: Date;
  time: string | null;
  onChange: (next: { master: Master; date: Date; time: string | null }) => void;
  onContinue: () => void;
  onBack: () => void;
}

export function BookingCalendar({
  selectedServices,
  master,
  date,
  time,
  onChange,
  onContinue,
  onBack
}: Props) {
  const totalMinutes = selectedServices.reduce(
    (a, s) => a + s.durationMinutes,
    0
  );
  const totalPrice = selectedServices.reduce((a, s) => a + s.price, 0);

  const [masters, setMasters] = useState<Master[]>([]);
  const [activeMaster, setActiveMaster] = useState<Master | null>(master);
  const [activeDate, setActiveDate] = useState<Date>(date);

  // Fetch the salon's masters on mount.
  useEffect(() => {
    let cancelled = false;
    fetchMasters()
      .then((items) => {
        if (cancelled) return;
        setMasters(items);
        if (!activeMaster && items.length > 0) {
          setActiveMaster(items[0]);
        }
      })
      .catch(() => {
        // Silent on error — empty grid + the time selector will be inert.
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset selected time whenever master or date changes.
  useEffect(() => {
    if (!activeMaster) return;
    if (master?.id !== activeMaster.id || +activeDate !== +date) {
      onChange({ master: activeMaster, date: activeDate, time: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMaster?.id, activeDate]);

  return (
    <div className="space-y-12">
      <MasterSelector
        masters={masters}
        selectedId={activeMaster?.id}
        onSelect={(m) => setActiveMaster(m)}
      />

      <div className="grid lg:grid-cols-[1.05fr_2fr] gap-8 lg:gap-10">
        {/* Left: date strip in card.
            min-w-0 lets the inner horizontal scroller actually scroll instead
            of expanding the grid column past its 1.05fr share. */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="min-w-0 bg-white rounded-2xl p-6 border border-ink/8 shadow-soft"
        >
          <DateStrip selected={activeDate} onSelect={setActiveDate} />

          <div className="mt-8 pt-6 border-t border-ink/5">
            <p className="text-xs uppercase tracking-luxury-wide text-ink/40">
              Сонгосон мастер
            </p>
            <p className="mt-2 font-serif text-xl">{activeMaster?.name ?? "—"}</p>
            <p className="text-sm text-ink/55">{activeMaster?.title ?? ""}</p>
          </div>
        </motion.div>

        {/* Right: time slots in card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="min-w-0 bg-white rounded-2xl p-6 sm:p-8 border border-ink/8 shadow-soft"
        >
          <TimeSlots
            masterId={activeMaster?.id ?? ""}
            date={activeDate}
            durationMinutes={totalMinutes}
            selectedTime={time}
            onSelectTime={(t) => {
              if (!activeMaster) return;
              onChange({ master: activeMaster, date: activeDate, time: t });
            }}
          />
        </motion.div>
      </div>

      {/* Footer summary + actions */}
      <div className="sticky bottom-4 z-30">
        <div className="glass-light rounded-2xl shadow-soft p-4 sm:p-5 flex flex-wrap items-center gap-4">
          <div className="hidden sm:grid h-12 w-12 rounded-full bg-gold-gradient place-items-center text-ink shrink-0">
            <Sparkles size={18} />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase tracking-luxury-wide text-ink/50">
              {selectedServices.length} үйлчилгээ ·{" "}
              {formatDuration(totalMinutes)}
            </p>
            <p className="font-serif text-lg sm:text-xl truncate">
              {formatMnt(totalPrice)}
              {time && (
                <span className="text-ink/60 font-sans text-sm ml-3">
                  {activeDate.getMonth() + 1}/{activeDate.getDate()} · {time}
                </span>
              )}
            </p>
          </div>

          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={onBack}>
              Буцах
            </Button>
            <Button
              variant="gold"
              disabled={!time}
              onClick={onContinue}
              className={cn(!time && "opacity-50")}
            >
              Үргэлжлүүлэх
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
