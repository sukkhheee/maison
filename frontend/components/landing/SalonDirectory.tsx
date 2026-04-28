"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, Phone, Sparkles, AlertCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { fetchSalons, type PublicSalon } from "@/lib/api/salons";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1];

const PLACEHOLDER_COVERS = [
  "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80"
];

/** Deterministic cover image per salon — same slug always gets the same cover. */
function coverFor(slug: string): string {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) hash = (hash * 31 + slug.charCodeAt(i)) | 0;
  return PLACEHOLDER_COVERS[Math.abs(hash) % PLACEHOLDER_COVERS.length];
}

export function SalonDirectory() {
  const [salons, setSalons] = useState<PublicSalon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchSalons()
      .then((items) => {
        if (cancelled) return;
        setSalons(items);
        setError(null);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e?.message ?? "Салонуудыг ачаалж чадсангүй.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="bg-bone min-h-[calc(100svh-80px)] pt-32 pb-24">
      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
          className="max-w-2xl mb-12"
        >
          <span className="eyebrow">— Maison платформ</span>
          <h1 className="mt-3 font-serif text-4xl sm:text-5xl lg:text-6xl tracking-luxury-tight leading-[1.1]">
            <span className="italic gold-text">Салоноо</span> сонгож
            <br />
            захиалга өгөөрэй.
          </h1>
          <p className="mt-5 text-ink/60 leading-relaxed max-w-lg">
            Манай платформд бүртгэлтэй идэвхтэй салонуудаас өөрт ойрхон,
            тохиромжтойг сонгож үйлчилгээ авах боломжтой.
          </p>
        </motion.div>

        {/* Cards */}
        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 text-rose-700 p-8 inline-flex items-center gap-3">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        ) : loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl bg-white border border-ink/8 h-72 animate-pulse"
              />
            ))}
          </div>
        ) : salons.length === 0 ? (
          <div className="rounded-2xl border border-ink/10 bg-white p-12 text-center text-ink/55">
            Хараахан бүртгэлтэй идэвхтэй салон байхгүй байна.
          </div>
        ) : (
          <motion.ul
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.07 } }
            }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {salons.map((salon) => (
              <SalonCard key={salon.slug} salon={salon} />
            ))}
          </motion.ul>
        )}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

function SalonCard({ salon }: { salon: PublicSalon }) {
  return (
    <motion.li
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
      }}
    >
      <Link
        href={`/${salon.slug}`}
        className={cn(
          "group block rounded-2xl bg-white border border-ink/8 overflow-hidden",
          "transition-all duration-500 hover:-translate-y-1 hover:shadow-soft hover:border-gold/40"
        )}
      >
        {/* Cover */}
        <div className="relative h-44 overflow-hidden bg-bone-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverFor(salon.slug)}
            alt={salon.name}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent" />
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 glass rounded-full px-2.5 py-1 text-[10px] uppercase tracking-luxury-wide text-bone">
            <Sparkles size={11} className="text-gold" />
            /{salon.slug}
          </span>
        </div>

        {/* Body */}
        <div className="p-5 space-y-3">
          <h3 className="font-serif text-2xl tracking-luxury-tight leading-tight">
            {salon.name}
          </h3>

          <div className="space-y-1 text-xs text-ink/55">
            {salon.address && (
              <p className="inline-flex items-center gap-1.5">
                <MapPin size={11} className="shrink-0" />
                <span className="truncate">{salon.address}</span>
              </p>
            )}
            {salon.phone && (
              <p className="inline-flex items-center gap-1.5">
                <Phone size={11} className="shrink-0" />
                {salon.phone}
              </p>
            )}
          </div>

          <div className="gold-divider" />

          <div className="flex items-center justify-between text-xs">
            <span className="text-ink/40">Үйлчилгээ үзэх</span>
            <span className="inline-flex items-center gap-1 uppercase tracking-luxury-wide text-gold-700 group-hover:text-gold-600 transition-colors">
              Захиалах
              <ArrowRight
                size={12}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </span>
          </div>
        </div>
      </Link>
    </motion.li>
  );
}
