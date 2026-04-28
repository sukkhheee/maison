"use client";

import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Dialog } from "./Dialog";
import { Button } from "./button";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Тийм",
  cancelLabel = "Болих",
  danger = false
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handle = async () => {
    setLoading(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Алдаа гарлаа.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={loading ? () => {} : onClose} maxWidth="max-w-md">
      <div className="p-6 space-y-4">
        <div className="flex items-start gap-4">
          {danger && (
            <span className="h-10 w-10 shrink-0 rounded-full bg-rose-500/10 grid place-items-center text-rose-600 dark:text-rose-400">
              <AlertTriangle size={20} />
            </span>
          )}
          <div className="flex-1">
            <h2 className="font-serif text-xl tracking-tight">{title}</h2>
            {description && (
              <p className="text-sm text-fg-muted mt-1 leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>

        {error && (
          <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={danger ? "danger" : "primary"}
            onClick={handle}
            disabled={loading}
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
