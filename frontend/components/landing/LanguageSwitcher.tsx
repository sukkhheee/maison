"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Check, Loader2 } from "lucide-react";
import { locales, localeMeta, type Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

interface Props {
  /** Visual style — Navbar text color depends on whether the page is scrolled. */
  variant?: "light" | "dark";
}

/**
 * URL-based locale switcher. Delegates the prefix logic entirely to
 * next-intl's locale-aware router — switching is a one-liner: keep the
 * current path, change the locale param.
 */
export function LanguageSwitcher({ variant = "light" }: Props) {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const switchTo = (next: Locale) => {
    setOpen(false);
    if (next === locale) return;
    // `router.replace` with an explicit `locale` option is the canonical
    // next-intl pattern — works on both default and prefixed routes,
    // and avoids the trailing-slash edge cases of manual URL building.
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  };

  const meta = localeMeta[locale];

  return (
    <div ref={wrapperRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={isPending}
        className={cn(
          "inline-flex items-center gap-2 h-9 px-3 rounded-md text-sm transition-colors",
          variant === "dark"
            ? "text-ink/70 hover:text-ink hover:bg-ink/5"
            : "text-bone/85 hover:text-bone hover:bg-bone/10",
          isPending && "opacity-60"
        )}
        aria-label="Language"
      >
        {isPending ? <Loader2 size={15} className="animate-spin" /> : <Globe size={15} />}
        <span className="hidden sm:inline">{meta.flag} {meta.label}</span>
        <span className="sm:hidden">{meta.flag}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className={cn(
              "absolute right-0 mt-2 w-48 rounded-md p-1 z-50",
              "glass-light border border-ink/8 shadow-soft"
            )}
          >
            {locales.map((l) => {
              const m = localeMeta[l];
              const active = l === locale;
              return (
                <button
                  key={l}
                  onClick={() => switchTo(l)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-left transition-colors",
                    active
                      ? "bg-gold/10 text-ink"
                      : "text-ink/70 hover:bg-ink/5 hover:text-ink"
                  )}
                >
                  <span className="text-base leading-none">{m.flag}</span>
                  <span className="flex-1">{m.nativeName}</span>
                  {active && <Check size={14} className="text-gold-700" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
