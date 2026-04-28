"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  /** Tailwind max-width class — default `max-w-lg`. */
  maxWidth?: string;
}

/**
 * Headless modal dialog. Closes on Escape, click-outside, or the X button.
 * Locks body scroll while open.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  maxWidth = "max-w-lg"
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-fg/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, y: 8, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 4, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "card w-full overflow-hidden flex flex-col max-h-[calc(100vh-2rem)]",
              maxWidth
            )}
          >
            {(title || description) && (
              <div className="px-6 py-4 border-b border-border flex items-start justify-between gap-3">
                <div>
                  {title && <h2 className="font-serif text-xl tracking-tight">{title}</h2>}
                  {description && (
                    <p className="text-fg-muted text-sm mt-0.5">{description}</p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="h-8 w-8 grid place-items-center rounded-md text-fg-muted hover:text-fg hover:bg-surface-2 transition shrink-0"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              </div>
            )}
            <div className="flex-1 overflow-y-auto">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
