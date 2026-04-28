"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const ease = [0.22, 1, 0.36, 1];

interface Props {
  /** Optional tenant slug — when present, "Book now" links into this salon's
   *  booking flow at `/[slug]/book`. Without it, the CTA links to a slug
   *  picker / generic landing. */
  salonSlug?: string;
}

export function Hero({ salonSlug }: Props = {}) {
  const t = useTranslations("Hero");
  const bookHref = salonSlug ? `/${salonSlug}/book` : "/";
  return (
    <section className="relative min-h-[100svh] w-full overflow-hidden bg-ink text-bone">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?auto=format&fit=crop&w=2400&q=80"
          alt="Maison salon interior"
          fill
          priority
          sizes="100vw"
          className="object-cover scale-105"
        />
        {/* Layered gradients for legibility + luxury mood */}
        <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/30 to-ink/95" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/70 via-transparent to-ink/40" />
        {/* Soft gold glow */}
        <div
          className="absolute inset-0 opacity-30 mix-blend-screen"
          style={{
            background:
              "radial-gradient(900px 500px at 20% 30%, rgba(201,169,106,0.35), transparent 60%)"
          }}
        />
      </div>

      {/* Content */}
      <div className="relative container min-h-[100svh] flex flex-col justify-center pt-32 pb-20">
        <div className="max-w-3xl">
          {/* Eyebrow chip */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease }}
            className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs uppercase tracking-luxury-wide text-gold-200"
          >
            <Sparkles size={14} className="text-gold" />
            {t("eyebrow")}
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.1 }}
            className="mt-8 font-serif text-5xl sm:text-6xl lg:text-8xl leading-[1.05] tracking-luxury-tight"
          >
            {t("headlineLine1")}
            <br />
            <span className="gold-text italic">{t("headlineLine2")}</span>
            <br />
            {t("headlineLine3")}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.25 }}
            className="mt-8 max-w-xl text-base sm:text-lg text-bone/75 leading-relaxed"
          >
            {t("description")}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.4 }}
            className="mt-10 flex flex-wrap gap-3"
          >
            <Button asChild variant="gold" size="lg">
              <Link href={bookHref}>
                {t("ctaPrimary")}
                <ArrowRight size={18} className="ml-1" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="bg-bone/5 text-bone border border-bone/20 backdrop-blur hover:bg-bone/10 hover:border-gold/40"
            >
              <Link href="/#services">{t("ctaSecondary")}</Link>
            </Button>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease, delay: 0.55 }}
            className="mt-14 flex flex-wrap items-center gap-8"
          >
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {[
                  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80",
                  "https://images.unsplash.com/photo-1541823709867-1b206113eafd?auto=format&fit=crop&w=120&q=80",
                  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80"
                ].map((src) => (
                  <div
                    key={src}
                    className="h-9 w-9 rounded-full border-2 border-ink overflow-hidden relative"
                  >
                    <Image src={src} alt="" fill className="object-cover" />
                  </div>
                ))}
              </div>
              <div className="text-sm text-bone/70">
                <div className="flex items-center gap-1 text-gold">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} fill="currentColor" />
                  ))}
                  <span className="text-bone/80 ml-1.5">4.9</span>
                </div>
                <p className="text-xs text-bone/50">{t("rating", { count: "2,400" })}</p>
              </div>
            </div>

            <div className="hidden sm:block h-10 w-px bg-bone/15" />

            <div className="text-sm">
              <p className="text-gold-200 uppercase text-xs tracking-luxury-wide">
                {t("award")}
              </p>
              <p className="text-bone/80">{t("awardName")}</p>
            </div>
          </motion.div>
        </div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-bone/50"
        >
          <span className="text-[10px] uppercase tracking-luxury-wide">
            {t("scroll")}
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="h-8 w-px bg-gradient-to-b from-gold to-transparent"
          />
        </motion.div>
      </div>
    </section>
  );
}
