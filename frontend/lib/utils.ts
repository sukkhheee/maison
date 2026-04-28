import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMnt(amount: number, currency = "MNT") {
  if (currency === "MNT") {
    return `${amount.toLocaleString("mn-MN")}₮`;
  }
  return `${amount.toLocaleString()} ${currency}`;
}

export function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} мин`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} цаг` : `${h} цаг ${m} мин`;
}
