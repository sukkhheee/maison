"use client";

import { cn } from "@/lib/utils";
import type { AdminBookingStatus, AdminPaymentStatus } from "@/lib/data/mockBookings";

const bookingStatusStyles: Record<AdminBookingStatus, { cls: string; label: string }> = {
  PENDING: {
    cls: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20",
    label: "Хүлээгдэж буй"
  },
  CONFIRMED: {
    cls: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20",
    label: "Баталгаажсан"
  },
  COMPLETED: {
    cls: "bg-zinc-500/10 text-zinc-700 dark:text-zinc-300 border border-zinc-500/20",
    label: "Дууссан"
  },
  CANCELLED: {
    cls: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20",
    label: "Цуцлагдсан"
  },
  NO_SHOW: {
    cls: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20",
    label: "Ирээгүй"
  }
};

const paymentStatusStyles: Record<AdminPaymentStatus, { cls: string; label: string }> = {
  PAID: {
    cls: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20",
    label: "Төлсөн"
  },
  UNPAID: {
    cls: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20",
    label: "Төлөгдөөгүй"
  }
};

export function BookingStatusPill({ status }: { status: AdminBookingStatus }) {
  const s = bookingStatusStyles[status];
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider whitespace-nowrap",
        s.cls
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current mr-1.5 opacity-70" />
      {s.label}
    </span>
  );
}

export function PaymentStatusPill({ status }: { status: AdminPaymentStatus }) {
  const s = paymentStatusStyles[status];
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider whitespace-nowrap",
        s.cls
      )}
    >
      {s.label}
    </span>
  );
}
