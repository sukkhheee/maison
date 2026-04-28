"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles, Star, Check } from "lucide-react";
import { masters, type Master } from "@/lib/data/masters";
import { cn, formatMnt } from "@/lib/utils";

interface Props {
  selectedId?: string;
  onSelect: (master: Master) => void;
}

export function MasterSelector({ selectedId, onSelect }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "l" | "r") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({ left: dir === "l" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <span className="eyebrow">— Мастер сонгох</span>
          <h3 className="mt-2 font-serif text-3xl tracking-luxury-tight">
            Хэнтэй ажиллахаа сонго
          </h3>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => scroll("l")}
            className="h-10 w-10 grid place-items-center rounded-full border border-ink/15 hover:border-gold hover:text-gold-700 transition"
            aria-label="Scroll left"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => scroll("r")}
            className="h-10 w-10 grid place-items-center rounded-full border border-ink/15 hover:border-gold hover:text-gold-700 transition"
            aria-label="Scroll right"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Edge fades */}
      <div className="pointer-events-none absolute left-0 top-20 bottom-0 w-12 bg-gradient-to-r from-bone to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-20 bottom-0 w-12 bg-gradient-to-l from-bone to-transparent z-10" />

      {/* Scroller */}
      <div
        ref={scrollRef}
        className="no-scrollbar flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 -mx-1 px-1"
      >
        {masters.map((m, i) => {
          const active = selectedId === m.id;
          const isAny = m.id === "any";
          return (
            <motion.button
              key={m.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => onSelect(m)}
              className={cn(
                "snap-start shrink-0 w-[260px] sm:w-[280px] text-left rounded-2xl bg-white border overflow-hidden transition-all duration-500",
                "hover:-translate-y-1 hover:shadow-soft",
                active
                  ? "border-gold shadow-gold ring-1 ring-gold/40"
                  : "border-ink/8 hover:border-gold/40"
              )}
            >
              {/* Image */}
              <div className="relative h-44 overflow-hidden">
                <Image
                  src={m.avatar}
                  alt={m.name}
                  fill
                  sizes="280px"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />

                {/* Badges */}
                {m.signature && (
                  <div className="absolute top-3 left-3 inline-flex items-center gap-1 glass rounded-full px-2.5 py-1 text-[10px] uppercase tracking-luxury-wide text-bone">
                    <Sparkles size={11} className="text-gold" />
                    Signature
                  </div>
                )}
                {isAny && (
                  <div className="absolute top-3 left-3 inline-flex items-center gap-1 bg-gold-gradient rounded-full px-2.5 py-1 text-[10px] uppercase tracking-luxury-wide text-ink">
                    <Sparkles size={11} />
                    Хурдан
                  </div>
                )}

                {/* Name overlay */}
                <div className="absolute bottom-3 left-4 right-4 text-bone">
                  <p className="font-serif text-xl leading-tight">{m.name}</p>
                  <p className="text-[11px] uppercase tracking-luxury-wide text-bone/70">
                    {m.title}
                  </p>
                </div>

                {/* Selected check */}
                <motion.div
                  initial={false}
                  animate={{ scale: active ? 1 : 0.5, opacity: active ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute top-3 right-3 h-8 w-8 rounded-full bg-gold-gradient grid place-items-center text-ink shadow-gold"
                >
                  <Check size={16} strokeWidth={3} />
                </motion.div>
              </div>

              {/* Body */}
              <div className="p-4 space-y-3">
                {!isAny ? (
                  <>
                    <div className="flex items-center justify-between text-xs">
                      <span className="inline-flex items-center gap-1 text-gold-700">
                        <Star size={12} fill="currentColor" />
                        <strong className="font-medium text-ink">
                          {m.rating.toFixed(2)}
                        </strong>
                        <span className="text-ink/40">· {m.reviewCount}</span>
                      </span>
                      <span className="text-ink/50">{m.yearsExperience}+ жил</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {m.specialties.slice(0, 2).map((s) => (
                        <span
                          key={s}
                          className="text-[10px] uppercase tracking-wider px-2 py-1 bg-bone-200 text-ink/70 rounded-full"
                        >
                          {s}
                        </span>
                      ))}
                    </div>

                    <div className="gold-divider" />

                    <p className="text-xs text-ink/60">
                      <span className="text-ink/40">эхлэх үнэ</span>{" "}
                      <strong className="text-ink font-medium">
                        {formatMnt(m.fromPrice)}
                      </strong>
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-ink/60 leading-relaxed">
                    Системээс таны үйлчилгээнд тохирох хамгийн ойрын мастерыг
                    автоматаар санал болгоно.
                  </p>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
