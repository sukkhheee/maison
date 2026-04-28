"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Skeleton, ErrorBlock } from "@/components/shared/Skeleton";
import { ServiceFormDialog } from "@/components/services/ServiceFormDialog";
import { useApi } from "@/lib/useApi";
import {
  deleteService,
  listServices,
  type AdminServiceItem
} from "@/lib/api/admin-services";
import { cn, formatMnt } from "@/lib/utils";

export default function ServicesPage() {
  const { data, loading, error, refetch } = useApi(() => listServices(), []);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<AdminServiceItem | null>(null);
  const [deleting, setDeleting] = useState<AdminServiceItem | null>(null);

  const services = data ?? [];
  const activeCount = services.filter((s) => s.active).length;
  const inactiveCount = services.length - activeCount;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl tracking-tight">Үйлчилгээнүүд</h2>
          <p className="text-fg-muted text-sm mt-1">
            Зочдод харагдах үйлчилгээний жагсаалтыг удирдах.
          </p>
        </div>
        <Button variant="primary" onClick={() => setCreating(true)}>
          <Plus size={14} />
          Шинэ үйлчилгээ
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Stat label="Нийт" value={String(services.length)} />
        <Stat label="Идэвхтэй" value={String(activeCount)} accent="emerald" />
        <Stat label="Идэвхгүй" value={String(inactiveCount)} accent="rose" />
      </div>

      {error ? (
        <ErrorBlock message={error.message} onRetry={refetch} />
      ) : loading && services.length === 0 ? (
        <div className="grid gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : services.length === 0 ? (
        <EmptyState onCreate={() => setCreating(true)} />
      ) : (
        <motion.ul
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.04 } }
          }}
          className="grid gap-3"
        >
          {services.map((s) => (
            <ServiceRow
              key={s.id}
              service={s}
              onEdit={() => setEditing(s)}
              onDelete={() => setDeleting(s)}
            />
          ))}
        </motion.ul>
      )}

      <ServiceFormDialog
        open={creating}
        onClose={() => setCreating(false)}
        onSaved={refetch}
      />
      <ServiceFormDialog
        open={editing !== null}
        service={editing}
        onClose={() => setEditing(null)}
        onSaved={refetch}
      />
      <ConfirmDialog
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          if (deleting) {
            await deleteService(deleting.id);
            refetch();
          }
        }}
        title="Үйлчилгээг идэвхгүй болгох уу?"
        description={
          deleting
            ? `"${deleting.name}" үйлчилгээ зочдод харагдахгүй болно. Өмнөх захиалгууд хадгалагдана.`
            : ""
        }
        confirmLabel="Идэвхгүй болгох"
        danger
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function ServiceRow({
  service,
  onEdit,
  onDelete
}: {
  service: AdminServiceItem;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <motion.li
      variants={{
        hidden: { opacity: 0, y: 6 },
        show: { opacity: 1, y: 0 }
      }}
      className={cn(
        "card p-4 sm:p-5 flex flex-wrap items-center gap-4 transition-colors",
        !service.active && "opacity-60"
      )}
    >
      <div className="h-10 w-10 shrink-0 rounded-md bg-accent-soft text-accent grid place-items-center">
        <Sparkles size={16} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-medium truncate">{service.name}</p>
          {!service.active && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              Идэвхгүй
            </span>
          )}
        </div>
        {service.description && (
          <p className="text-xs text-fg-muted truncate mt-0.5">
            {service.description}
          </p>
        )}
        <p className="text-[10px] text-fg-muted/70 mt-0.5 font-mono">
          {service.externalId}
        </p>
      </div>

      <div className="text-right">
        <p className="font-serif text-lg tabular-nums">
          {formatMnt(service.price)}
        </p>
        <p className="text-[11px] text-fg-muted inline-flex items-center gap-1">
          <Clock size={10} />
          {service.durationMinutes} мин
        </p>
      </div>

      <div className="flex items-center gap-1 ml-auto sm:ml-0">
        <button
          onClick={onEdit}
          className="h-9 w-9 grid place-items-center rounded-md text-fg-muted hover:text-fg hover:bg-surface-2 transition"
          aria-label="Засах"
        >
          <Pencil size={15} />
        </button>
        {service.active && (
          <button
            onClick={onDelete}
            className="h-9 w-9 grid place-items-center rounded-md text-fg-muted hover:text-rose-600 hover:bg-rose-500/10 transition"
            aria-label="Идэвхгүй болгох"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>
    </motion.li>
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
        <Sparkles size={20} />
      </div>
      <h3 className="font-serif text-xl mt-4">Үйлчилгээ хараахан байхгүй</h3>
      <p className="text-fg-muted text-sm mt-1">
        Эхний үйлчилгээгээ нэмэхэд таны booking widget идэвхжинэ.
      </p>
      <Button variant="primary" className="mt-6" onClick={onCreate}>
        <Plus size={14} />
        Эхний үйлчилгээгээ нэмэх
      </Button>
    </div>
  );
}
