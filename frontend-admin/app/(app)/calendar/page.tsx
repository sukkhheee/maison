"use client";

import { useMemo, useState } from "react";
import { CalendarHeader } from "@/components/calendar/CalendarHeader";
import { MasterTimelineGrid } from "@/components/calendar/MasterTimelineGrid";
import { Skeleton, ErrorBlock } from "@/components/shared/Skeleton";
import { listBookings, listStaff } from "@/lib/api/admin";
import { useApi } from "@/lib/useApi";
import { staffToMaster, masters as fallbackMasters } from "@/lib/data/masters";
import { adaptBooking } from "@/lib/adapters";

export default function CalendarPage() {
  const [date, setDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const dateKey = date.toISOString().slice(0, 10);

  const staffQuery = useApi(() => listStaff(), []);
  const bookingsQuery = useApi(
    () => listBookings({ from: date, to: date }),
    [dateKey]
  );

  const masters = useMemo(
    () =>
      staffQuery.data && staffQuery.data.length > 0
        ? staffQuery.data.map(staffToMaster)
        : fallbackMasters,
    [staffQuery.data]
  );

  const bookings = useMemo(
    () => (bookingsQuery.data ?? []).map(adaptBooking),
    [bookingsQuery.data]
  );

  const totalRevenue = useMemo(
    () =>
      bookings
        .filter((b) => b.status !== "CANCELLED")
        .reduce((a, b) => a + b.totalPrice, 0),
    [bookings]
  );

  const loading = staffQuery.loading || bookingsQuery.loading;
  const error = staffQuery.error || bookingsQuery.error;

  return (
    <div className="space-y-4">
      <CalendarHeader
        date={date}
        onChange={setDate}
        bookingCount={bookings.length}
        totalRevenue={totalRevenue}
      />

      {error ? (
        <ErrorBlock
          message={error.message}
          onRetry={() => {
            staffQuery.refetch();
            bookingsQuery.refetch();
          }}
        />
      ) : loading && bookings.length === 0 ? (
        <CalendarSkeleton />
      ) : (
        <MasterTimelineGrid
          bookings={bookings}
          masters={masters}
          date={date}
        />
      )}
    </div>
  );
}

function CalendarSkeleton() {
  return (
    <div className="card overflow-hidden">
      <div className="grid grid-cols-[80px_repeat(6,minmax(0,1fr))] gap-px bg-border">
        {Array.from({ length: 7 * 8 }).map((_, i) => (
          <Skeleton key={i} className="h-12 rounded-none bg-surface" />
        ))}
      </div>
    </div>
  );
}
