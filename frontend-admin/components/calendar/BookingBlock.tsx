"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Clock, AlertCircle, Ban } from "lucide-react";
import { hueClasses, type AdminMaster } from "@/lib/data/masters";
import type { AdminBooking } from "@/lib/data/mockBookings";
import { cn, formatHHmm, formatMntCompact, minutesBetween } from "@/lib/utils";

interface Props {
  booking: AdminBooking;
  master: AdminMaster;
  /** Day-start in minutes (e.g. 9*60 = 540). Used to position the block. */
  dayStartMin: number;
  /** Pixel height of one 30-minute slot. */
  slotPx: number;
}

export function BookingBlock({ booking, master, dayStartMin, slotPx }: Props) {
  const startMin =
    booking.start.getHours() * 60 + booking.start.getMinutes() - dayStartMin;
  const durationMin = minutesBetween(booking.start, booking.end);

  const top = (startMin / 30) * slotPx;
  const height = (durationMin / 30) * slotPx;

  const hue = hueClasses[master.hue];
  const isCancelled = booking.status === "CANCELLED";
  const isCompact = height < 56;

  return (
    <motion.button
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{ top, height: height - 4 }}
      className={cn(
        "group absolute left-1.5 right-1.5 text-left rounded-md border overflow-hidden",
        "px-2.5 py-1.5 transition-shadow hover:shadow-soft hover:z-10",
        "focus-visible:ring-2 focus-visible:ring-offset-2",
        hue.bg,
        hue.border,
        hue.text,
        isCancelled && "opacity-60 line-through"
      )}
    >
      {/* Color rail on the left */}
      <span
        className={cn(
          "absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r",
          hue.dot
        )}
      />

      <div className="pl-1.5 flex flex-col h-full">
        {/* Top line: time + status pill */}
        <div className="flex items-center justify-between gap-2 text-[10px] font-medium opacity-80">
          <span className="tabular-nums">
            {formatHHmm(booking.start)} – {formatHHmm(booking.end)}
          </span>
          <StatusBadge status={booking.status} />
        </div>

        {/* Client + service */}
        <p className={cn("font-semibold truncate", isCompact ? "text-xs" : "text-sm mt-0.5")}>
          {booking.clientName}
        </p>
        {!isCompact && (
          <p className="text-[11px] opacity-75 truncate">{booking.service}</p>
        )}

        {/* Footer */}
        {height >= 80 && (
          <div className="mt-auto pt-1 flex items-center justify-between text-[10px] opacity-80">
            <span className="font-semibold tabular-nums">
              {formatMntCompact(booking.totalPrice)}
            </span>
            <PaymentBadge paid={booking.paymentStatus === "PAID"} />
          </div>
        )}
      </div>
    </motion.button>
  );
}

function StatusBadge({ status }: { status: AdminBooking["status"] }) {
  if (status === "CONFIRMED")
    return (
      <span className="inline-flex items-center gap-0.5">
        <CheckCircle2 size={10} />
      </span>
    );
  if (status === "PENDING")
    return (
      <span className="inline-flex items-center gap-0.5">
        <Clock size={10} />
      </span>
    );
  if (status === "CANCELLED")
    return (
      <span className="inline-flex items-center gap-0.5">
        <Ban size={10} />
      </span>
    );
  if (status === "COMPLETED")
    return (
      <span className="inline-flex items-center gap-0.5">
        <CheckCircle2 size={10} className="opacity-50" />
      </span>
    );
  return null;
}

function PaymentBadge({ paid }: { paid: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold",
        paid
          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
          : "bg-amber-500/15 text-amber-700 dark:text-amber-300"
      )}
    >
      {paid ? <CheckCircle2 size={9} /> : <AlertCircle size={9} />}
      {paid ? "PAID" : "UNPAID"}
    </span>
  );
}
