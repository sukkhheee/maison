"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { AdminBooking } from "@/lib/data/mockBookings";
import { hueClasses, staffToMaster, type AdminMaster } from "@/lib/data/masters";
import { BookingStatusPill, PaymentStatusPill } from "@/components/shared/StatusPill";
import { Skeleton } from "@/components/shared/Skeleton";
import { cn, formatHHmm, formatMnt } from "@/lib/utils";
import { listBookings, listStaff } from "@/lib/api/admin";
import { useApi } from "@/lib/useApi";
import { adaptBooking } from "@/lib/adapters";

export function RecentBookings() {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const staffQuery = useApi(() => listStaff(), []);
  const bookingsQuery = useApi(
    () => listBookings({ from: today, to: today }),
    [today.toISOString()]
  );

  const masterById = useMemo<Record<string, AdminMaster>>(() => {
    const list = (staffQuery.data ?? []).map(staffToMaster);
    return Object.fromEntries(list.map((m) => [m.id, m]));
  }, [staffQuery.data]);

  const bookings = useMemo<AdminBooking[]>(
    () =>
      (bookingsQuery.data ?? [])
        .map(adaptBooking)
        .sort((a, b) => b.start.getTime() - a.start.getTime())
        .slice(0, 5),
    [bookingsQuery.data]
  );

  const loading = bookingsQuery.loading || staffQuery.loading;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="card overflow-hidden"
    >
      <div className="px-6 py-4 flex items-center justify-between border-b border-border">
        <div>
          <p className="text-xs text-fg-muted uppercase tracking-wider">
            Сүүлийн захиалгууд
          </p>
          <p className="font-serif text-lg mt-0.5">Өнөөдрийн идэвх</p>
        </div>
        <Link
          href="/bookings"
          className="text-xs text-accent inline-flex items-center gap-1 hover:gap-2 transition-all font-medium"
        >
          Бүгдийг харах
          <ArrowRight size={12} />
        </Link>
      </div>

      {loading && bookings.length === 0 ? (
        <ul className="divide-y divide-border">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="px-6 py-3.5 flex items-center gap-4">
              <Skeleton className="h-9 w-9 rounded-full shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-5 w-20 hidden sm:block" />
            </li>
          ))}
        </ul>
      ) : bookings.length === 0 ? (
        <p className="px-6 py-12 text-center text-sm text-fg-muted">
          Өнөөдөр захиалга байхгүй байна.
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {bookings.map((b) => (
            <BookingRow
              key={b.id}
              booking={b}
              master={masterById[b.staffId] ?? null}
            />
          ))}
        </ul>
      )}
    </motion.div>
  );
}

function BookingRow({
  booking,
  master
}: {
  booking: AdminBooking;
  master: AdminMaster | null;
}) {
  const hue = master ? hueClasses[master.hue] : null;
  return (
    <li className="px-6 py-3.5 flex items-center gap-4 hover:bg-surface-2 transition-colors">
      <div
        className={cn(
          "h-9 w-9 shrink-0 rounded-full grid place-items-center text-[11px] font-semibold",
          hue?.bg,
          hue?.text
        )}
      >
        {master?.initials ?? "?"}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{booking.clientName}</p>
        <p className="text-xs text-fg-muted truncate">{booking.service}</p>
      </div>

      <div className="hidden sm:block text-right shrink-0">
        <p className="text-xs font-medium tabular-nums">
          {formatHHmm(booking.start)}
        </p>
        <p className="text-[10px] text-fg-muted">{master?.name}</p>
      </div>

      <div className="hidden md:flex flex-col items-end gap-1 shrink-0">
        <BookingStatusPill status={booking.status} />
        <PaymentStatusPill status={booking.paymentStatus} />
      </div>

      <div className="text-right shrink-0">
        <p className="font-serif text-base tabular-nums">
          {formatMnt(booking.totalPrice)}
        </p>
      </div>
    </li>
  );
}
