"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  MoreHorizontal,
  Eye,
  Pencil,
  XCircle,
  Phone,
  ChevronLeft,
  ChevronRight,
  Download,
  type LucideIcon
} from "lucide-react";
import {
  type AdminBooking,
  type AdminBookingStatus
} from "@/lib/data/mockBookings";
import { hueClasses, staffToMaster, masters as fallbackMasters, type AdminMaster } from "@/lib/data/masters";
import {
  BookingStatusPill,
  PaymentStatusPill
} from "@/components/shared/StatusPill";
import { Skeleton, ErrorBlock } from "@/components/shared/Skeleton";
import { Button } from "@/components/ui/button";
import { cn, formatHHmm, formatMnt } from "@/lib/utils";
import { listBookings, listStaff } from "@/lib/api/admin";
import { useApi } from "@/lib/useApi";
import { adaptBooking } from "@/lib/adapters";

type Filter = "ALL" | AdminBookingStatus;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "ALL", label: "Бүгд" },
  { id: "PENDING", label: "Хүлээгдэж буй" },
  { id: "CONFIRMED", label: "Баталгаажсан" },
  { id: "COMPLETED", label: "Дууссан" },
  { id: "CANCELLED", label: "Цуцлагдсан" }
];

const PAGE_SIZE = 8;

export function BookingTable() {
  const [filter, setFilter] = useState<Filter>("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  // Last 14 days inclusive of today.
  const range = useMemo(() => {
    const to = new Date();
    to.setHours(0, 0, 0, 0);
    const from = new Date(to);
    from.setDate(to.getDate() - 13);
    return { from, to };
  }, []);

  const staffQuery = useApi(() => listStaff(), []);
  const bookingsQuery = useApi(
    () => listBookings({ from: range.from, to: range.to }),
    [range.from.toISOString(), range.to.toISOString()]
  );

  const masterById = useMemo<Record<string, AdminMaster>>(() => {
    const list =
      staffQuery.data && staffQuery.data.length > 0
        ? staffQuery.data.map(staffToMaster)
        : fallbackMasters;
    return Object.fromEntries(list.map((m) => [m.id, m]));
  }, [staffQuery.data]);

  const all = useMemo<AdminBooking[]>(
    () =>
      (bookingsQuery.data ?? [])
        .map(adaptBooking)
        .sort((a, b) => b.start.getTime() - a.start.getTime()),
    [bookingsQuery.data]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return all.filter((b) => {
      if (filter !== "ALL" && b.status !== filter) return false;
      if (q && !`${b.clientName} ${b.service} ${b.id}`.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [all, filter, search]);

  const counts = useMemo(() => {
    const c: Record<Filter, number> = {
      ALL: all.length,
      PENDING: 0,
      CONFIRMED: 0,
      COMPLETED: 0,
      CANCELLED: 0,
      NO_SHOW: 0
    };
    all.forEach((b) => {
      if (c[b.status] !== undefined) c[b.status]++;
    });
    return c;
  }, [all]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="card"
    >
      {/* Toolbar */}
      <div className="px-5 py-4 border-b border-border flex flex-wrap items-center gap-3">
        {/* Status filter chips */}
        <div className="flex items-center gap-1 flex-wrap">
          {FILTERS.map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => {
                  setFilter(f.id);
                  setPage(1);
                }}
                className={cn(
                  "h-8 px-3 rounded-md text-xs font-medium inline-flex items-center gap-2 transition-colors",
                  active
                    ? "bg-fg text-bg"
                    : "bg-surface-2 text-fg-muted hover:text-fg hover:bg-border"
                )}
              >
                {f.label}
                <span
                  className={cn(
                    "tabular-nums text-[10px] px-1.5 py-0.5 rounded-full",
                    active ? "bg-bg/20" : "bg-bg border border-border"
                  )}
                >
                  {counts[f.id]}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex-1" />

        {/* Search */}
        <div className="flex items-center gap-2 h-9 px-3 rounded-md bg-surface-2 border border-border w-full sm:w-72">
          <Search size={14} className="text-fg-muted shrink-0" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Үйлчлүүлэгч, үйлчилгээ хайх…"
            className="bg-transparent flex-1 text-sm placeholder:text-fg-muted focus:outline-none min-w-0"
          />
        </div>

        <Button variant="outline" size="sm">
          <Download size={14} />
          Экспорт
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-fg-muted border-b border-border">
              <th className="px-5 py-3 font-medium">ID</th>
              <th className="px-5 py-3 font-medium">Үйлчлүүлэгч</th>
              <th className="px-5 py-3 font-medium hidden lg:table-cell">Үйлчилгээ</th>
              <th className="px-5 py-3 font-medium hidden md:table-cell">Мастер</th>
              <th className="px-5 py-3 font-medium">Цаг</th>
              <th className="px-5 py-3 font-medium">Төлөв</th>
              <th className="px-5 py-3 font-medium hidden sm:table-cell">Төлбөр</th>
              <th className="px-5 py-3 font-medium text-right">Үнэ</th>
              <th className="px-5 py-3 font-medium w-12" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {bookingsQuery.loading && all.length === 0 && (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={`sk-${i}`}>
                  <td colSpan={9} className="px-5 py-3.5">
                    <Skeleton className="h-6 w-full" />
                  </td>
                </tr>
              ))
            )}
            {!bookingsQuery.loading && bookingsQuery.error && (
              <tr>
                <td colSpan={9} className="px-5 py-12">
                  <ErrorBlock
                    message={bookingsQuery.error.message}
                    onRetry={bookingsQuery.refetch}
                  />
                </td>
              </tr>
            )}
            {!bookingsQuery.loading &&
              !bookingsQuery.error &&
              pageRows.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-5 py-16 text-center text-fg-muted text-sm"
                  >
                    Тохирох захиалга олдсонгүй.
                  </td>
                </tr>
              )}
            {pageRows.map((b) => (
              <BookingRow
                key={b.id}
                booking={b}
                master={masterById[b.staffId] ?? null}
                menuOpen={openMenuId === b.id}
                onToggleMenu={() =>
                  setOpenMenuId((id) => (id === b.id ? null : b.id))
                }
                onCloseMenu={() => setOpenMenuId(null)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-5 py-3 border-t border-border flex items-center justify-between text-xs text-fg-muted">
        <span>
          {filtered.length === 0
            ? "Илэрц байхгүй"
            : `${(safePage - 1) * PAGE_SIZE + 1}–${Math.min(
                safePage * PAGE_SIZE,
                filtered.length
              )} / ${filtered.length} илэрц`}
        </span>
        <div className="flex items-center gap-1">
          <button
            disabled={safePage <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="h-8 w-8 grid place-items-center rounded-md hover:bg-surface-2 disabled:opacity-30 disabled:hover:bg-transparent"
            aria-label="Previous page"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="px-2 tabular-nums">
            {safePage} / {totalPages}
          </span>
          <button
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="h-8 w-8 grid place-items-center rounded-md hover:bg-surface-2 disabled:opacity-30 disabled:hover:bg-transparent"
            aria-label="Next page"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */

function BookingRow({
  booking,
  master,
  menuOpen,
  onToggleMenu,
  onCloseMenu
}: {
  booking: AdminBooking;
  master: AdminMaster | null;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
}) {
  const hue = master ? hueClasses[master.hue] : null;

  const dateLabel = `${booking.start.getMonth() + 1}/${booking.start.getDate()}`;

  return (
    <tr className="group hover:bg-surface-2 transition-colors">
      <td className="px-5 py-3.5 font-mono text-xs text-fg-muted">
        #{booking.id}
      </td>

      {/* Client */}
      <td className="px-5 py-3.5">
        <p className="font-medium">{booking.clientName}</p>
        <p className="text-[11px] text-fg-muted inline-flex items-center gap-1">
          <Phone size={10} />
          {booking.clientPhone}
        </p>
      </td>

      <td className="px-5 py-3.5 hidden lg:table-cell text-fg-muted">
        {booking.service}
      </td>

      {/* Master */}
      <td className="px-5 py-3.5 hidden md:table-cell">
        {master && (
          <div className="inline-flex items-center gap-2">
            <span
              className={cn(
                "h-7 w-7 rounded-full grid place-items-center text-[10px] font-semibold shrink-0",
                hue?.bg,
                hue?.text
              )}
            >
              {master.initials}
            </span>
            <span className="text-sm">{master.name}</span>
          </div>
        )}
      </td>

      {/* Time */}
      <td className="px-5 py-3.5">
        <p className="font-medium tabular-nums">{formatHHmm(booking.start)}</p>
        <p className="text-[11px] text-fg-muted tabular-nums">{dateLabel}</p>
      </td>

      <td className="px-5 py-3.5">
        <BookingStatusPill status={booking.status} />
      </td>

      <td className="px-5 py-3.5 hidden sm:table-cell">
        <PaymentStatusPill status={booking.paymentStatus} />
      </td>

      <td className="px-5 py-3.5 text-right font-serif tabular-nums">
        {formatMnt(booking.totalPrice)}
      </td>

      {/* Action */}
      <td className="px-5 py-3.5 relative">
        <button
          onClick={onToggleMenu}
          className="h-8 w-8 grid place-items-center rounded-md text-fg-muted hover:text-fg hover:bg-border opacity-0 group-hover:opacity-100 focus:opacity-100 transition"
          aria-label="Үйлдэл"
        >
          <MoreHorizontal size={16} />
        </button>

        {menuOpen && (
          <>
            {/* Backdrop to close on outside click */}
            <div className="fixed inset-0 z-40" onClick={onCloseMenu} />
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute right-2 top-12 z-50 w-44 card !p-1"
            >
              <MenuItem icon={Eye} label="Дэлгэрэнгүй" onClick={onCloseMenu} />
              <MenuItem icon={Pencil} label="Засах" onClick={onCloseMenu} />
              <MenuItem
                icon={XCircle}
                label="Цуцлах"
                danger
                onClick={onCloseMenu}
              />
            </motion.div>
          </>
        )}
      </td>
    </tr>
  );
}

function MenuItem({
  icon: Icon,
  label,
  danger,
  onClick
}: {
  icon: LucideIcon;
  label: string;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2 px-3 py-2 text-xs rounded-md transition-colors",
        danger
          ? "text-rose-600 dark:text-rose-400 hover:bg-rose-500/10"
          : "text-fg hover:bg-surface-2"
      )}
    >
      <Icon size={13} />
      {label}
    </button>
  );
}
