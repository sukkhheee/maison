"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  Mail,
  Phone,
  UserCircle2,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Skeleton, ErrorBlock } from "@/components/shared/Skeleton";
import { StaffFormDialog } from "@/components/staff/StaffFormDialog";
import { StaffScheduleDialog } from "@/components/staff/StaffScheduleDialog";
import { useApi } from "@/lib/useApi";
import {
  deleteStaff,
  listStaffDetail,
  type AdminStaffDetail
} from "@/lib/api/admin-staff";
import { hueClasses, staffToMaster } from "@/lib/data/masters";
import { cn } from "@/lib/utils";

export default function StaffPage() {
  const { data, loading, error, refetch } = useApi(() => listStaffDetail(), []);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<AdminStaffDetail | null>(null);
  const [deleting, setDeleting] = useState<AdminStaffDetail | null>(null);
  const [schedulingFor, setSchedulingFor] = useState<AdminStaffDetail | null>(null);

  const staff = data ?? [];
  const activeCount = staff.filter((s) => s.active).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl tracking-tight">Ажилчид</h2>
          <p className="text-fg-muted text-sm mt-1">
            Мастеруудыг бүртгэж, профайлыг удирдах.
          </p>
        </div>
        <Button variant="primary" onClick={() => setCreating(true)}>
          <Plus size={14} />
          Шинэ ажилтан
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Stat label="Нийт" value={String(staff.length)} />
        <Stat label="Идэвхтэй" value={String(activeCount)} accent="emerald" />
        <Stat
          label="Идэвхгүй"
          value={String(staff.length - activeCount)}
          accent="rose"
        />
      </div>

      {error ? (
        <ErrorBlock message={error.message} onRetry={refetch} />
      ) : loading && staff.length === 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full" />
          ))}
        </div>
      ) : staff.length === 0 ? (
        <EmptyState onCreate={() => setCreating(true)} />
      ) : (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.04 } }
          }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {staff.map((s) => (
            <StaffCard
              key={s.id}
              staff={s}
              onEdit={() => setEditing(s)}
              onDelete={() => setDeleting(s)}
              onSchedule={() => setSchedulingFor(s)}
            />
          ))}
        </motion.div>
      )}

      <StaffFormDialog
        open={creating}
        onClose={() => setCreating(false)}
        onSaved={refetch}
      />
      <StaffFormDialog
        open={editing !== null}
        staff={editing}
        onClose={() => setEditing(null)}
        onSaved={refetch}
      />
      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          if (deleting) {
            await deleteStaff(deleting.id);
            refetch();
          }
        }}
        title="Ажилтанг идэвхгүй болгох уу?"
        description={
          deleting
            ? `"${deleting.displayName}"-ийг идэвхгүй болгоно. Одоо байгаа захиалгууд хэвээр үлдэнэ.`
            : ""
        }
        confirmLabel="Идэвхгүй болгох"
        danger
      />
      <StaffScheduleDialog
        open={schedulingFor !== null}
        onClose={() => setSchedulingFor(null)}
        staffId={schedulingFor?.id ?? null}
        staffName={schedulingFor?.displayName ?? ""}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function StaffCard({
  staff,
  onEdit,
  onDelete,
  onSchedule
}: {
  staff: AdminStaffDetail;
  onEdit: () => void;
  onDelete: () => void;
  onSchedule: () => void;
}) {
  // Re-use the calendar's hue mapping so the staff card matches booking colors.
  const master = staffToMaster({
    externalId: staff.externalId,
    displayName: staff.displayName,
    title: staff.title,
    avatarUrl: staff.avatarUrl,
    active: staff.active
  });
  const hue = hueClasses[master.hue];

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 8 },
        show: { opacity: 1, y: 0 }
      }}
      className={cn(
        "card p-5 flex flex-col gap-4 transition-colors hover:border-accent/40",
        !staff.active && "opacity-60"
      )}
    >
      <div className="flex items-start gap-3">
        <Avatar
          url={staff.avatarUrl}
          name={staff.displayName}
          initials={master.initials}
          fallbackBg={hue.bg}
          fallbackText={hue.text}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium truncate">{staff.displayName}</p>
            {!staff.active && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                Идэвхгүй
              </span>
            )}
          </div>
          {staff.title && (
            <p className="text-xs text-fg-muted truncate">{staff.title}</p>
          )}
          <p className="text-[10px] text-fg-muted/70 mt-0.5 font-mono">
            {staff.externalId}
          </p>
        </div>
      </div>

      {staff.bio && (
        <p className="text-xs text-fg-muted leading-relaxed line-clamp-2">
          {staff.bio}
        </p>
      )}

      <div className="space-y-1 text-xs text-fg-muted border-t border-border pt-3">
        {staff.userEmail && (
          <p className="inline-flex items-center gap-1.5">
            <Mail size={11} />
            <span className="truncate">{staff.userEmail}</span>
          </p>
        )}
        {staff.userPhone && (
          <p className="inline-flex items-center gap-1.5">
            <Phone size={11} />
            {staff.userPhone}
          </p>
        )}
        {!staff.userEmail && !staff.userPhone && (
          <p className="inline-flex items-center gap-1.5 italic">
            <UserCircle2 size={11} />
            Холбоо барих мэдээлэл байхгүй
          </p>
        )}
      </div>

      <div className="flex items-center gap-1 mt-auto pt-2 border-t border-border -mx-5 -mb-5 px-3 py-2 bg-surface-2/40">
        <button
          onClick={onEdit}
          className="flex-1 h-9 inline-flex items-center justify-center gap-1.5 rounded-md text-xs font-medium text-fg-muted hover:text-fg hover:bg-surface-2 transition"
        >
          <Pencil size={12} />
          Засах
        </button>
        <button
          onClick={onSchedule}
          className="flex-1 h-9 inline-flex items-center justify-center gap-1.5 rounded-md text-xs font-medium text-fg-muted hover:text-fg hover:bg-surface-2 transition"
        >
          <Clock size={12} />
          Хуваарь
        </button>
        {staff.active && (
          <button
            onClick={onDelete}
            className="flex-1 h-9 inline-flex items-center justify-center gap-1.5 rounded-md text-xs font-medium text-fg-muted hover:text-rose-600 hover:bg-rose-500/10 transition"
          >
            <Trash2 size={12} />
            Идэвхгүй
          </button>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Renders a user-supplied avatar URL with graceful fallback to coloured initials
 * when the URL fails to load (broken link, hotlink-blocked CDN, Facebook page
 * URL pasted by mistake, etc.). Skips Next.js image optimization on purpose so
 * arbitrary hostnames don't need to be whitelisted in next.config.
 */
function Avatar({
  url,
  name,
  initials,
  fallbackBg,
  fallbackText
}: {
  url: string | null;
  name: string;
  initials: string;
  fallbackBg: string;
  fallbackText: string;
}) {
  const [errored, setErrored] = useState(false);
  const usable = url && !errored && /^https?:\/\//i.test(url);

  if (!usable) {
    return (
      <div
        className={cn(
          "h-14 w-14 shrink-0 rounded-full grid place-items-center font-semibold text-lg",
          fallbackBg,
          fallbackText
        )}
      >
        {initials}
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={name}
      onError={() => setErrored(true)}
      className="h-14 w-14 rounded-full object-cover shrink-0"
    />
  );
}

function Stat({
  label,
  value,
  accent
}: {
  label: string;
  value: string;
  accent?: "emerald" | "rose";
}) {
  return (
    <div className="card p-4">
      <p className="text-xs text-fg-muted uppercase tracking-wider">{label}</p>
      <p
        className={cn(
          "font-serif text-2xl mt-1 tabular-nums",
          accent === "emerald" && "text-emerald-600 dark:text-emerald-400",
          accent === "rose" && "text-rose-600 dark:text-rose-400"
        )}
      >
        {value}
      </p>
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="card p-12 text-center">
      <div className="mx-auto h-12 w-12 rounded-full bg-accent-soft text-accent grid place-items-center">
        <UserCircle2 size={20} />
      </div>
      <h3 className="font-serif text-xl mt-4">Ажилтан хараахан байхгүй</h3>
      <p className="text-fg-muted text-sm mt-1">
        Мастер бүртгэх үед таны календарь идэвхжих болно.
      </p>
      <Button variant="primary" className="mt-6" onClick={onCreate}>
        <Plus size={14} />
        Эхний ажилтнаа бүртгэх
      </Button>
    </div>
  );
}
