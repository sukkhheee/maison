"use client";

import { useEffect, useState } from "react";
import { Loader2, AlertCircle, CalendarClock } from "lucide-react";
import { Dialog } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/Field";
import { Skeleton } from "@/components/shared/Skeleton";
import {
  fetchSchedule,
  updateSchedule,
  type DayOfWeek,
  type StaffScheduleEntry
} from "@/lib/api/admin-staff-schedule";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  staffId: number | null;
  staffName: string;
}

const DAYS: { id: DayOfWeek; label: string; short: string }[] = [
  { id: "MONDAY", label: "Даваа", short: "Да" },
  { id: "TUESDAY", label: "Мягмар", short: "Мя" },
  { id: "WEDNESDAY", label: "Лхагва", short: "Лх" },
  { id: "THURSDAY", label: "Пүрэв", short: "Пү" },
  { id: "FRIDAY", label: "Баасан", short: "Ба" },
  { id: "SATURDAY", label: "Бямба", short: "Бя" },
  { id: "SUNDAY", label: "Ням", short: "Ня" }
];

interface DayState {
  enabled: boolean;
  startTime: string; // "HH:MM"
  endTime: string;
}

const DEFAULT_DAY: DayState = {
  enabled: true,
  startTime: "09:00",
  endTime: "20:00"
};

/**
 * Single-shift-per-day schedule editor. Sends a full PUT replacing all rows
 * atomically, so cancelled days are silently dropped and the active days
 * become the staff's complete week.
 */
export function StaffScheduleDialog({ open, onClose, staffId, staffName }: Props) {
  const [days, setDays] = useState<Record<DayOfWeek, DayState>>(initialState());
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load the staff's existing schedule when the dialog opens.
  useEffect(() => {
    if (!open || !staffId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchSchedule(staffId)
      .then((entries) => {
        if (cancelled) return;
        setDays(applyEntries(entries));
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof ApiError ? e.message : "Хуваарь ачаалж чадсангүй.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, staffId]);

  const setDay = (id: DayOfWeek, patch: Partial<DayState>) => {
    setDays((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffId) return;

    // Build the payload from active days, validate ordering.
    const payload: StaffScheduleEntry[] = [];
    for (const day of DAYS) {
      const d = days[day.id];
      if (!d.enabled) continue;
      if (d.startTime >= d.endTime) {
        setError(
          `${day.label} өдөр: эхлэх цаг (${d.startTime}) дуусах цагаас (${d.endTime}) өмнө байх ёстой.`
        );
        return;
      }
      payload.push({
        dayOfWeek: day.id,
        startTime: d.startTime,
        endTime: d.endTime
      });
    }

    setSubmitting(true);
    setError(null);
    try {
      await updateSchedule(staffId, payload);
      onClose();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Хадгалахад алдаа гарлаа.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={submitting ? () => {} : onClose}
      title={`${staffName} — Ажлын цаг`}
      description="Долоо хоногийн ажлын цаг тохируулах. Цуцалсан өдөр захиалга авахгүй."
      maxWidth="max-w-2xl"
    >
      <form onSubmit={submit} className="p-6 space-y-4">
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <ul className="space-y-2">
            {DAYS.map((day) => (
              <DayRow
                key={day.id}
                label={day.label}
                shortLabel={day.short}
                value={days[day.id]}
                onChange={(patch) => setDay(day.id, patch)}
              />
            ))}
          </ul>
        )}

        {error && (
          <div className="flex items-start gap-2 p-3 rounded-md bg-rose-500/10 border border-rose-500/30 text-sm text-rose-700 dark:text-rose-300">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-between items-center gap-2 pt-2 border-t border-border">
          <p className="text-[11px] text-fg-muted inline-flex items-center gap-1">
            <CalendarClock size={11} />
            Долоо хоног тутамд давтагдана
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting}
            >
              Болих
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={submitting || loading}
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              Хадгалах
            </Button>
          </div>
        </div>
      </form>
    </Dialog>
  );
}

/* -------------------------------------------------------------------------- */

function DayRow({
  label,
  shortLabel,
  value,
  onChange
}: {
  label: string;
  shortLabel: string;
  value: DayState;
  onChange: (patch: Partial<DayState>) => void;
}) {
  return (
    <li
      className={cn(
        "flex items-center gap-3 sm:gap-4 p-3 rounded-md border transition-colors",
        value.enabled ? "border-border bg-surface" : "border-border bg-surface-2/40"
      )}
    >
      {/* Day label + toggle */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <span
          className={cn(
            "h-9 w-9 shrink-0 grid place-items-center rounded-md text-xs font-semibold",
            value.enabled ? "bg-accent-soft text-accent" : "bg-border text-fg-muted"
          )}
        >
          {shortLabel}
        </span>
        <Switch
          label={label}
          checked={value.enabled}
          onChange={(next) => onChange({ enabled: next })}
        />
      </div>

      {/* Time inputs */}
      <div className="flex items-center gap-2">
        <input
          type="time"
          value={value.startTime}
          onChange={(e) => onChange({ startTime: e.target.value })}
          disabled={!value.enabled}
          className={cn(
            "w-[100px] sm:w-[120px] h-9 px-2 rounded-md border bg-surface text-sm tabular-nums",
            "focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30",
            "border-border disabled:opacity-40"
          )}
        />
        <span className="text-fg-muted text-xs">—</span>
        <input
          type="time"
          value={value.endTime}
          onChange={(e) => onChange({ endTime: e.target.value })}
          disabled={!value.enabled}
          className={cn(
            "w-[100px] sm:w-[120px] h-9 px-2 rounded-md border bg-surface text-sm tabular-nums",
            "focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30",
            "border-border disabled:opacity-40"
          )}
        />
      </div>
    </li>
  );
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

function initialState(): Record<DayOfWeek, DayState> {
  const out = {} as Record<DayOfWeek, DayState>;
  for (const day of DAYS) out[day.id] = { ...DEFAULT_DAY };
  return out;
}

/**
 * Applies the server's schedule list onto our day-state map. Days absent
 * from the response are marked disabled.
 */
function applyEntries(entries: StaffScheduleEntry[]): Record<DayOfWeek, DayState> {
  const out = {} as Record<DayOfWeek, DayState>;
  for (const day of DAYS) out[day.id] = { ...DEFAULT_DAY, enabled: false };
  for (const e of entries) {
    out[e.dayOfWeek] = {
      enabled: true,
      startTime: trimSeconds(e.startTime),
      endTime: trimSeconds(e.endTime)
    };
  }
  return out;
}

/** Backend may return "HH:MM:SS"; HTML time input wants "HH:MM". */
function trimSeconds(s: string): string {
  return s.length >= 5 ? s.slice(0, 5) : s;
}
