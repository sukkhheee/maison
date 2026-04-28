"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sun, Sunrise, Moon, AlertCircle, type LucideIcon } from "lucide-react";
import { getSlotGroupsFor, type Period } from "@/lib/data/slots";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface Props {
  masterId: string;
  date: Date;
  /** Total minutes from selected services — informs the user. */
  durationMinutes: number;
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
}

const periodIcons: Record<Period, LucideIcon> = {
  morning: Sunrise,
  afternoon: Sun,
  evening: Moon
};

export function TimeSlots({
  masterId,
  date,
  durationMinutes,
  selectedTime,
  onSelectTime
}: Props) {
  const groups = useMemo(() => getSlotGroupsFor(masterId, date), [masterId, date]);
  const animationKey = `${masterId}-${date.toISOString()}`;

  const totalAvailable = groups.reduce(
    (a, g) => a + g.slots.filter((s) => s.available).length,
    0
  );

  return (
    <div>
      <div className="flex items-end justify-between mb-4">
        <div>
          <span className="eyebrow">— Цаг сонгох</span>
          <p className="mt-1 font-serif text-2xl tracking-luxury-tight">
            Боломжит цагууд
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-ink/40 uppercase tracking-wider">
            Үргэлжлэх
          </p>
          <p className="font-medium">
            {durationMinutes > 0 ? `${durationMinutes} мин` : "—"}
          </p>
        </div>
      </div>

      {totalAvailable === 0 && (
        <div className="rounded-xl border border-ink/10 bg-white p-6 flex items-start gap-3">
          <AlertCircle className="text-gold-700 shrink-0 mt-0.5" size={18} />
          <div>
            <p className="font-medium">Энэ өдөрт сул цаг байхгүй байна</p>
            <p className="text-sm text-ink/60">
              Өөр өдөр эсвэл өөр мастер сонгоно уу.
            </p>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={animationKey}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="space-y-7"
        >
          {groups.map((g) => {
            const Icon = periodIcons[g.period];
            const availableCount = g.slots.filter((s) => s.available).length;
            return (
              <div key={g.period}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="h-8 w-8 rounded-full grid place-items-center bg-bone-200 text-gold-700">
                    <Icon size={14} />
                  </span>
                  <h4 className="font-medium tracking-wide">{g.label}</h4>
                  <span className="text-xs text-ink/40">
                    {availableCount} сул
                  </span>
                  <div className="flex-1 ml-2 gold-divider" />
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-6 gap-2">
                  {g.slots.map((s, i) => {
                    const isSelected = selectedTime === s.time;
                    return (
                      <motion.button
                        key={s.time}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.25, delay: i * 0.012 }}
                        whileHover={s.available ? { y: -2 } : undefined}
                        disabled={!s.available}
                        onClick={() => onSelectTime(s.time)}
                        className={cn(
                          "py-2.5 rounded-lg text-sm font-medium border transition-all duration-300",
                          isSelected
                            ? "bg-ink text-bone border-ink shadow-soft"
                            : s.available
                            ? "bg-white text-ink border-ink/10 hover:border-gold hover:text-gold-700"
                            : "bg-bone-200/60 text-ink/30 border-transparent line-through cursor-not-allowed"
                        )}
                      >
                        {s.time}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
