export interface TimeSlot {
  time: string;
  available: boolean;
}

export type Period = "morning" | "afternoon" | "evening";

export interface SlotGroup {
  period: Period;
  label: string;
  slots: TimeSlot[];
}

/* Deterministic pseudo-random so the same (master,date) returns the same
   availability pattern between renders. */
function hash(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function getSlotGroupsFor(masterId: string, date: Date): SlotGroup[] {
  const key = `${masterId}-${date.toDateString()}`;
  const seed = hash(key);

  const day = date.getDay();
  const isSunday = day === 0;
  const isMonday = day === 1;

  const make = (period: Period, from: number, to: number): SlotGroup => {
    const slots: TimeSlot[] = [];
    for (let h = from; h < to; h++) {
      for (const m of [0, 30]) {
        const time = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
        const localSeed = (seed + h * 7 + m) % 11;
        // ~30% taken; fewer in evening for sundays etc.
        let available = localSeed > 3;
        if (isSunday) available = localSeed > 6;
        if (isMonday && period === "morning") available = localSeed > 5;
        if (masterId === "any") available = localSeed > 1;
        slots.push({ time, available });
      }
    }
    return { period, label: labelFor(period), slots };
  };

  return [make("morning", 9, 12), make("afternoon", 12, 17), make("evening", 17, 21)];
}

function labelFor(p: Period) {
  return p === "morning" ? "Өглөө" : p === "afternoon" ? "Өдөр" : "Орой";
}

export function buildDateStrip(start: Date, days = 14): Date[] {
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    d.setHours(0, 0, 0, 0);
    return d;
  });
}

const dayNames = ["Ня", "Да", "Мя", "Лх", "Пү", "Ба", "Бя"];
export function shortDayName(d: Date) {
  return dayNames[d.getDay()];
}

const monthNames = [
  "1-р сар",
  "2-р сар",
  "3-р сар",
  "4-р сар",
  "5-р сар",
  "6-р сар",
  "7-р сар",
  "8-р сар",
  "9-р сар",
  "10-р сар",
  "11-р сар",
  "12-р сар"
];
export function monthName(d: Date) {
  return monthNames[d.getMonth()];
}

export function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
