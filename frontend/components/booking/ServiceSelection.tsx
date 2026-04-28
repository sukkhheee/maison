"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Clock, Loader2, Sparkles } from "lucide-react";
import {
  categories,
  type ServiceCategory,
  type ServiceItem
} from "@/lib/data/services";
import { fetchServices } from "@/lib/api/catalog";
import { cn, formatDuration, formatMnt } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const ease = [0.22, 1, 0.36, 1];

interface Props {
  /** Optional: pre-selected service ids */
  initialSelected?: string[];
  /** Called whenever selection changes */
  onChange?: (selected: ServiceItem[]) => void;
  /** Called when user confirms and proceeds to next step */
  onContinue?: (selected: ServiceItem[]) => void;
  /**
   * "section" — full landing-style block with heading, decorative blob, and a
   * fixed bottom CTA bar (default).
   * "embedded" — for use inside a wizard: no <section>/blob/container wrapper,
   * no heading, and no fixed bar (the wizard provides its own footer).
   */
  variant?: "section" | "embedded";
}

export function ServiceSelection({
  initialSelected = [],
  onChange,
  onContinue,
  variant = "section"
}: Props) {
  const [active, setActive] = useState<ServiceCategory | "all">("all");
  const [selected, setSelected] = useState<Set<string>>(new Set(initialSelected));
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch the salon's catalog from the backend on mount.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchServices()
      .then((items) => {
        if (cancelled) return;
        setServices(items);
        setError(null);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e?.message ?? "Үйлчилгээний жагсаалтыг ачаалж чадсангүй.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(
    () => (active === "all" ? services : services.filter((s) => s.category === active)),
    [active, services]
  );

  const selectedItems = useMemo(
    () => services.filter((s) => selected.has(s.id)),
    [selected, services]
  );

  const totals = useMemo(() => {
    const minutes = selectedItems.reduce((a, s) => a + s.durationMinutes, 0);
    const price = selectedItems.reduce((a, s) => a + s.price, 0);
    return { minutes, price };
  }, [selectedItems]);

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
    onChange?.(services.filter((s) => next.has(s.id)));
  };

  const isEmbedded = variant === "embedded";

  const inner = (
    <>
      {!isEmbedded && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease }}
          className="max-w-2xl"
        >
          <span className="eyebrow">— Үйлчилгээ</span>
          <h2 className="mt-3 font-serif text-4xl sm:text-5xl lg:text-6xl tracking-luxury-tight leading-[1.1]">
            Та өөрийнхөө
            <br />
            <span className="italic gold-text">мэдрэмжийг сонго.</span>
          </h2>
          <p className="mt-5 text-ink/60 max-w-lg leading-relaxed">
            Бүх үйлчилгээ нь олон улсын стандартын мастерууд, эко-cертификаттай
            бүтээгдэхүүнээр гүйцэтгэгдэнэ. Олон үйлчилгээг нэг захиалгад
            нэгтгэх боломжтой.
          </p>
        </motion.div>
      )}

      {/* Category filter */}
      <div className={cn("flex flex-wrap gap-2", isEmbedded ? "mt-0" : "mt-12")}>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setActive(c.id)}
            className={cn(
              "px-5 py-2.5 rounded-full text-sm transition-all duration-300 border",
              active === c.id
                ? "bg-ink text-bone border-ink shadow-soft"
                : "bg-transparent text-ink/70 border-ink/15 hover:border-gold hover:text-ink"
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Cards grid (or loading / empty / error states) */}
      {loading ? (
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl bg-white border border-ink/8 h-72 animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center text-rose-700 inline-flex items-center gap-2 justify-center">
          <Loader2 size={16} />
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-ink/10 bg-white p-12 text-center text-ink/55">
          Үйлчилгээ хараахан бүртгэгдээгүй байна.
        </div>
      ) : (
        <motion.ul
          layout
          className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((service, i) => {
              const isSelected = selected.has(service.id);
              return (
                <motion.li
                  key={service.id}
                  layout
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.5, ease, delay: i * 0.04 }}
                >
                  <ServiceCard
                    service={service}
                    selected={isSelected}
                    onToggle={() => toggle(service.id)}
                  />
                </motion.li>
              );
            })}
          </AnimatePresence>
        </motion.ul>
      )}

      {/* Floating summary bar — only in section mode (wizard supplies its own) */}
      {!isEmbedded && (
        <AnimatePresence>
          {selectedItems.length > 0 && (
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ duration: 0.4, ease }}
              className="fixed left-1/2 bottom-6 -translate-x-1/2 z-40 w-[min(96%,720px)]"
            >
              <div className="glass-light rounded-2xl shadow-soft p-3 sm:p-4 flex items-center gap-3 sm:gap-5">
                <div className="hidden sm:grid h-12 w-12 rounded-full bg-gold-gradient place-items-center text-ink shrink-0">
                  <Sparkles size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs uppercase tracking-luxury-wide text-ink/50">
                    Сонгосон {selectedItems.length} үйлчилгээ
                  </p>
                  <p className="font-serif text-lg sm:text-xl truncate">
                    {formatMnt(totals.price)} ·{" "}
                    <span className="text-ink/60">
                      {formatDuration(totals.minutes)}
                    </span>
                  </p>
                </div>
                <Button
                  variant="gold"
                  size="md"
                  onClick={() => onContinue?.(selectedItems)}
                >
                  Үргэлжлүүлэх
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </>
  );

  if (isEmbedded) return <div className="space-y-2">{inner}</div>;

  return (
    <section id="services" className="relative bg-bone py-24 sm:py-32">
      {/* Decorative blob */}
      <div
        aria-hidden
        className="absolute -top-40 right-0 h-[500px] w-[500px] rounded-full opacity-40 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(201,169,106,0.35), transparent 60%)"
        }}
      />
      <div className="container relative">{inner}</div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Card                                                                        */
/* -------------------------------------------------------------------------- */

function ServiceCard({
  service,
  selected,
  onToggle
}: {
  service: ServiceItem;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "group relative w-full text-left rounded-2xl overflow-hidden bg-white border transition-all duration-500",
        "hover:-translate-y-1 hover:shadow-soft",
        selected
          ? "border-gold shadow-gold ring-1 ring-gold/40"
          : "border-ink/8 hover:border-gold/40"
      )}
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden">
        <Image
          src={service.image}
          alt={service.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/30 via-transparent to-transparent" />

        {service.signature && (
          <div className="absolute top-3 left-3 inline-flex items-center gap-1 glass rounded-full px-3 py-1 text-[10px] uppercase tracking-luxury-wide text-bone">
            <Sparkles size={12} className="text-gold" />
            Signature
          </div>
        )}

        {/* Selection indicator */}
        <motion.div
          initial={false}
          animate={{
            scale: selected ? 1 : 0.6,
            opacity: selected ? 1 : 0
          }}
          transition={{ duration: 0.3, ease }}
          className="absolute top-3 right-3 h-9 w-9 rounded-full bg-gold-gradient grid place-items-center text-ink shadow-gold"
        >
          <Check size={18} strokeWidth={3} />
        </motion.div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-serif text-xl tracking-luxury-tight leading-tight">
            {service.name}
          </h3>
          <span className="font-serif text-xl text-gold-700 shrink-0">
            {formatMnt(service.price)}
          </span>
        </div>

        <p className="text-sm text-ink/60 leading-relaxed line-clamp-2">
          {service.description}
        </p>

        <div className="gold-divider" />

        <div className="flex items-center justify-between text-xs">
          <span className="inline-flex items-center gap-1.5 text-ink/60">
            <Clock size={13} />
            {formatDuration(service.durationMinutes)}
          </span>
          <span
            className={cn(
              "uppercase tracking-luxury-wide transition-colors",
              selected ? "text-gold-700" : "text-ink/40 group-hover:text-gold-600"
            )}
          >
            {selected ? "Сонгогдсон" : "Сонгох"} →
          </span>
        </div>
      </div>
    </button>
  );
}
