"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, MapPin, Phone, Mail, Clock } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { fetchSalon, type PublicSalon } from "@/lib/api/salons";

interface Props {
  salonSlug: string;
}

const ease = [0.22, 1, 0.36, 1];

const PLACEHOLDER_COVERS = [
  "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?auto=format&fit=crop&w=2400&q=80",
  "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=2400&q=80",
  "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=2400&q=80",
  "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=2400&q=80",
  "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=2400&q=80",
  "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=2400&q=80"
];

function coverFor(slug: string): string {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) hash = (hash * 31 + slug.charCodeAt(i)) | 0;
  return PLACEHOLDER_COVERS[Math.abs(hash) % PLACEHOLDER_COVERS.length];
}

/**
 * Compact salon-specific header that replaces the generic Hero on /[slug].
 * Shows the salon's name, contact info, and a "Back to directory" link —
 * everything below it is the booking surface (services).
 */
export function SalonHeader({ salonSlug }: Props) {
  const [salon, setSalon] = useState<PublicSalon | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchSalon(salonSlug)
      .then((s) => !cancelled && setSalon(s))
      .catch((e) => !cancelled && setError(e?.message ?? "Салон олдсонгүй."));
    return () => {
      cancelled = true;
    };
  }, [salonSlug]);

  return (
    <section className="relative bg-ink text-bone overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={coverFor(salonSlug)}
          alt={salon?.name ?? salonSlug}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/55 via-ink/45 to-ink/85" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/60 via-transparent to-ink/40" />
      </div>

      <div className="relative container pt-28 pb-14 sm:pt-32 sm:pb-16">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-luxury-wide text-bone/70 hover:text-bone transition"
        >
          <ChevronLeft size={14} />
          Бүх салон
        </Link>

        {/* Salon identity */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="mt-5 max-w-3xl"
        >
          {error ? (
            <p className="text-rose-200">{error}</p>
          ) : !salon ? (
            <div className="space-y-3">
              <div className="h-5 w-32 bg-bone/20 rounded animate-pulse" />
              <div className="h-12 sm:h-16 w-2/3 bg-bone/20 rounded animate-pulse" />
              <div className="h-4 w-48 bg-bone/15 rounded animate-pulse" />
            </div>
          ) : (
            <>
              <p className="text-xs uppercase tracking-luxury-wide text-gold-200">
                /{salon.slug}
              </p>
              <h1 className="mt-2 font-serif text-4xl sm:text-5xl lg:text-6xl tracking-luxury-tight leading-[1.1]">
                {salon.name}
              </h1>

              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-bone/80">
                {salon.address && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={13} className="text-gold-200" />
                    {salon.address}
                  </span>
                )}
                {salon.phone && (
                  <a
                    href={`tel:${salon.phone}`}
                    className="inline-flex items-center gap-1.5 hover:text-gold-200 transition"
                  >
                    <Phone size={13} className="text-gold-200" />
                    {salon.phone}
                  </a>
                )}
                {salon.email && (
                  <a
                    href={`mailto:${salon.email}`}
                    className="inline-flex items-center gap-1.5 hover:text-gold-200 transition"
                  >
                    <Mail size={13} className="text-gold-200" />
                    {salon.email}
                  </a>
                )}
                {salon.timezone && (
                  <span className="inline-flex items-center gap-1.5 text-bone/55">
                    <Clock size={13} />
                    {salon.timezone}
                  </span>
                )}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
}
